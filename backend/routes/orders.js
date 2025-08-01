const express = require('express');
const { Order, Customer, Worker, User } = require('../models');
const { auth, adminAuth } = require('../middleware/auth');
const { Op } = require('sequelize');
const router = express.Router();

// Get all orders
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: Customer,
          include: [{ model: User, attributes: ['name', 'email', 'phone'] }]
        },
        {
          model: Worker,
          include: [{ model: User, attributes: ['name', 'email'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Create order with customer linking
router.post('/create-with-customer', [auth, adminAuth], async (req, res) => {
  const transaction = await require('../config/database').transaction();
  
  try {
    const {
      selectedCustomer,
      newCustomer,
      isNewCustomer,
      selectedWorker,
      priority,
      deliveryDate,
      notes,
      advancePayment,
      totalAmount
    } = req.body;

    let customerId;

    if (isNewCustomer) {
      const userData = {
        email: newCustomer.email,
        password: 'defaultPassword123',
        role: 'customer',
        name: newCustomer.name,
        phone: newCustomer.phone
      };

      const user = await User.create(userData, { transaction });
      
      const customer = await Customer.create({
        userId: user.id,
        address: newCustomer.address || ''
      }, { transaction });

      customerId = customer.id;
    } else {
      customerId = selectedCustomer.id;
    }

    const orderCount = await Order.count();
    const orderNumber = `SS${String(orderCount + 1).padStart(6, '0')}`;

    const order = await Order.create({
      orderNumber,
      customerId,
      workerId: selectedWorker?.id,
      totalAmount,
      advancePayment: advancePayment || 0,
      balanceAmount: totalAmount - (advancePayment || 0),
      priority,
      deliveryDate,
      notes,
      status: 'received'
    }, { transaction });

    // Safely increment customer order count
    await Customer.increment('totalOrders', {
      by: 1,
      where: { id: customerId },
      transaction
    });

    if (selectedWorker?.id) {
      await Worker.update(
        { status: 'busy' },
        { where: { id: selectedWorker.id }, transaction }
      );
    }

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });

  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Update order status
router.put('/:id/status', [auth], async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id);
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    await order.update({ status });
    res.json({
      success: true,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Delete order with safe count management
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  const transaction = await require('../config/database').transaction();
  
  try {
    const order = await Order.findByPk(req.params.id, { transaction });
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Set worker as available if assigned
    if (order.workerId) {
      await Worker.update(
        { status: 'available' },
        { where: { id: order.workerId }, transaction }
      );
    }

    // Safely decrease customer's total orders count (prevent negative)
    if (order.customerId) {
      await Customer.decrement('totalOrders', {
        by: 1,
        where: { 
          id: order.customerId,
          totalOrders: { [Op.gt]: 0 }
        },
        transaction
      });
    }

    await order.destroy({ transaction });
    await transaction.commit();

    res.json({
      success: true,
      message: 'Order deleted successfully'
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
