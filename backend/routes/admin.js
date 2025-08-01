const express = require('express');
const { User, Customer, Worker, Order } = require('../models');
const { auth, adminAuth } = require('../middleware/auth');
const { Op } = require('sequelize');
const router = express.Router();

// Dashboard statistics
router.get('/stats', [auth], async (req, res) => {
  try {
    const totalCustomers = await Customer.count().catch(() => 0);
    const totalWorkers = await Worker.count().catch(() => 0);
    const totalOrders = await Order.count().catch(() => 0);
    const totalRevenue = await Order.sum('totalAmount').catch(() => 0) || 0;
    const pendingPayments = await Order.sum('balanceAmount').catch(() => 0) || 0;

    // Order status breakdown
    let ordersByStatus = {};
    try {
      const orderStatuses = await Order.findAll({
        attributes: ['status'],
        raw: true
      });
      
      ordersByStatus = orderStatuses.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});
    } catch (error) {
      ordersByStatus = {
        received: 0,
        'in-progress': 0,
        ready: 0,
        delivered: 0,
        cancelled: 0
      };
    }

    // Worker status breakdown
    let workersByStatus = {};
    try {
      const workerStatuses = await Worker.findAll({
        attributes: ['status'],
        raw: true
      });
      
      workersByStatus = workerStatuses.reduce((acc, worker) => {
        acc[worker.status] = (acc[worker.status] || 0) + 1;
        return acc;
      }, {});
    } catch (error) {
      workersByStatus = {
        available: 0,
        busy: 0,
        on_break: 0,
        offline: 0
      };
    }

    const stats = {
      totalCustomers,
      totalWorkers,
      totalOrders,
      ordersByStatus,
      workersByStatus,
      paymentStats: {
        totalRevenue,
        pendingPayments,
        collectedPayments: totalRevenue - pendingPayments,
        averageOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0
      },
      recentOrders: [],
      topWorkers: [],
      monthlyTrends: [],
      generatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Fix negative order counts
router.post('/fix-negative-counts', [auth, adminAuth], async (req, res) => {
  try {
    await Customer.update(
      { totalOrders: 0 },
      { where: { totalOrders: { [Op.lt]: 0 } } }
    );

    const customers = await Customer.findAll();
    for (const customer of customers) {
      const actualOrderCount = await Order.count({
        where: { customerId: customer.id }
      });
      await customer.update({ totalOrders: actualOrderCount });
    }

    res.json({
      success: true,
      message: 'Order counts fixed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
