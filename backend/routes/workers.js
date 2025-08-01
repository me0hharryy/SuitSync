const express = require('express');
const { Worker, User, Order } = require('../models');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

// Get all workers
router.get('/', auth, async (req, res) => {
  try {
    const workers = await Worker.findAll({
      include: [
        {
          model: User,
          attributes: ['name', 'email', 'phone', 'isActive']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      workers
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Update worker status
router.put('/:id/status', [auth], async (req, res) => {
  try {
    const { status } = req.body;
    const worker = await Worker.findByPk(req.params.id);
    
    if (!worker) {
      return res.status(404).json({ 
        success: false,
        message: 'Worker not found' 
      });
    }

    await worker.update({ status });
    res.json({
      success: true,
      message: 'Worker status updated successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Delete worker
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  const transaction = await require('../config/database').transaction();
  
  try {
    const worker = await Worker.findByPk(req.params.id, {
      include: [{ model: User }],
      transaction
    });

    if (!worker) {
      await transaction.rollback();
      return res.status(404).json({ 
        success: false,
        message: 'Worker not found' 
      });
    }

    // Update orders to unassign this worker
    await Order.update(
      { workerId: null },
      { 
        where: { workerId: req.params.id },
        transaction 
      }
    );

    // Delete worker and user
    await worker.destroy({ transaction });
    if (worker.User) {
      await worker.User.destroy({ transaction });
    }

    await transaction.commit();

    res.json({
      success: true,
      message: 'Worker deleted successfully'
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

module.exports = router;
