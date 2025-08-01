const express = require('express');
const router = express.Router();
const { Worker, User, Order } = require('../models');
const { auth, adminAuth } = require('../middleware/auth');

// Get all workers
router.get('/', auth, async (req, res) => {
  try {
    const workers = await Worker.findAll({
      include: [
        { 
          model: User, 
          attributes: ['name', 'email', 'phone'] 
        },
        {
          model: Order,
          as: 'assignedOrders',
          attributes: ['id', 'status']
        }
      ]
    });
    
    // Process workers to add 'currentOrders' count and 'status'
    const workersWithStats = workers.map(worker => {
      const busyOrders = worker.assignedOrders.filter(order => order.status !== 'delivered' && order.status !== 'cancelled').length;
      const status = busyOrders > 0 ? 'busy' : 'available';

      return {
        ...worker.toJSON(),
        currentOrders: busyOrders,
        status,
      };
    });

    res.json({
      success: true,
      workers: workersWithStats
    });
  } catch (error) {
    console.error('Error fetching workers:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update worker details
router.put('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const { name, email, phone, skills, paymentType, hourlyRate, monthlyFee, pieceRate, specialization, experience, address, emergencyContact, joinDate, isActive, workingHours, workHistory } = req.body;
    
    const worker = await Worker.findByPk(req.params.id, {
      include: [{ model: User }]
    });

    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    // Update user details
    await worker.User.update({
      name,
      email,
      phone,
    });
    
    // Update worker details
    await worker.update({
      skills,
      paymentType,
      hourlyRate,
      monthlyFee,
      pieceRate,
      specialization,
      experience,
      address,
      emergencyContact,
      joinDate,
      isActive,
      workingHours,
      workHistory,
    });

    res.json({
      success: true,
      message: 'Worker updated successfully',
      worker,
    });
  } catch (error) {
    console.error('Error updating worker:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete worker
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  const transaction = await require('../config/database').transaction();

  try {
    const worker = await Worker.findByPk(req.params.id, { transaction });
    
    if (!worker) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    // Also delete the associated user
    await User.destroy({ where: { id: worker.userId }, transaction });
    await worker.destroy({ transaction });

    await transaction.commit();

    res.json({ success: true, message: 'Worker and associated user deleted successfully' });
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting worker:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
