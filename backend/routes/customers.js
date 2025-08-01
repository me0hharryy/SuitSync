const express = require('express');
const { Customer, User, Order } = require('../models');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

// Get all customers
router.get('/', auth, async (req, res) => {
  try {
    const customers = await Customer.findAll({
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
      customers
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Delete customer with order check
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  const transaction = await require('../config/database').transaction();
  
  try {
    const customer = await Customer.findByPk(req.params.id, {
      include: [{ model: User }],
      transaction
    });

    if (!customer) {
      await transaction.rollback();
      return res.status(404).json({ 
        success: false,
        message: 'Customer not found' 
      });
    }

    // Check if customer has orders
    const orderCount = await Order.count({
      where: { customerId: req.params.id },
      transaction
    });

    if (orderCount > 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Cannot delete customer. They have ${orderCount} existing orders.`
      });
    }

    // Delete customer and user
    await customer.destroy({ transaction });
    if (customer.User) {
      await customer.User.destroy({ transaction });
    }

    await transaction.commit();

    res.json({
      success: true,
      message: 'Customer deleted successfully'
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
