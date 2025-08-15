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
    const orderStatuses = await Order.findAll({ attributes: ['status'], raw: true });
    const ordersByStatus = orderStatuses.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    // Correctly calculate Worker status breakdown by checking their active orders
    const allWorkers = await Worker.findAll({
      include: [{ model: Order, as: 'assignedOrders', attributes: ['status'] }]
    });

    const workersByStatus = allWorkers.reduce((acc, worker) => {
      const busyOrders = worker.assignedOrders.filter(order => order.status !== 'delivered' && order.status !== 'cancelled').length;
      const status = busyOrders > 0 ? 'busy' : 'available';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, { available: 0, busy: 0, on_break: 0, offline: 0 }); // Initialize with defaults

    // Fetch recent orders for the dashboard table
    const recentOrders = await Order.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']],
        include: [
            { model: Customer, include: [{ model: User, attributes: ['name', 'email'] }] },
            { model: Worker, include: [{ model: User, attributes: ['name'] }] }
        ]
    });

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
      recentOrders, // Pass the fetched recent orders to the frontend
      topWorkers: [], // Placeholder for future implementation
      monthlyTrends: [], // Placeholder for future implementation
      generatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
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
