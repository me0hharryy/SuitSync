const express = require('express');
const { Order, Customer, Worker, User, OrderItem, Measurement } = require('../models');
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
        },
        {
          model: OrderItem,
          as: 'items'
        },
        {
          model: Measurement,
          as: 'measurements'
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

// NEW: GET route for fetching invoice data
router.get('/:id/invoice', auth, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: Customer,
          include: [{ model: User, attributes: ['name', 'email', 'phone'] }]
        },
        {
          model: OrderItem,
          as: 'items'
        },
      ]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({
      success: true,
      invoice: order
    });
  } catch (error) {
    console.error('Error fetching invoice data:', error);
    res.status(500).json({ success: false, message: error.message });
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
      items,
      selectedWorker,
      priority,
      deliveryDate,
      notes,
      advancePayment,
      totalAmount,
      measurements
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

    const latestOrder = await Order.findOne({
      order: [['orderNumber', 'DESC']]
    });
    const lastOrderNumber = latestOrder ? parseInt(latestOrder.orderNumber.substring(2)) : 0;
    const newOrderNumber = `SS${String(lastOrderNumber + 1).padStart(6, '0')}`;

    const order = await Order.create({
      orderNumber: newOrderNumber,
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

    if (items && items.length > 0) {
      for (const item of items) {
        await OrderItem.create({
          orderId: order.id,
          itemType: item.itemType,
          fabric: item.fabric,
          color: item.color,
          specifications: item.specifications,
          price: item.price
        }, { transaction });
      }
    }

    if (measurements && Object.keys(measurements).length > 0) {
      await Measurement.create({
        orderId: order.id,
        ...measurements
      }, { transaction });
    }

    await Customer.increment('totalOrders', {
      by: 1,
      where: { id: customerId },
      transaction
    });

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });

  } catch (error) {
    await transaction.rollback();
    console.error("Order creation error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Update order fully by ID
router.put('/:id', [auth], async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    await order.update(req.body);
    res.json({
      success: true,
      order
    });
  } catch (error) {
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
    
    await Measurement.destroy({ where: { orderId: order.id }, transaction });

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

// Add or update measurements for a specific order
router.post('/:orderId/measurements', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const measurementData = req.body;

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    let measurement = await Measurement.findOne({ where: { orderId } });

    if (measurement) {
      await measurement.update(measurementData);
    } else {
      measurement = await Measurement.create({
        orderId,
        ...measurementData,
      });
    }

    res.status(200).json({ success: true, measurement });
  } catch (error) {
    console.error('Error creating/updating measurements:', error);
    res.status(500).json({ success: false, message: 'Failed to save measurements.' });
  }
});

module.exports = router;