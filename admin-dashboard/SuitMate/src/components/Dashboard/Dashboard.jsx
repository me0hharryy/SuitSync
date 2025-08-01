import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  LinearProgress,
  Paper,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Work as WorkIcon,
  ShoppingBag as OrderIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
  Timeline as TimelineIcon,
  Assignment as AssignmentIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, BarChart, Bar } from 'recharts';
import axios from 'axios';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh dashboard every 5 minutes
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setDashboardData(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard ', error);
      setError('Failed to load dashboard data');
      
      // Sample data for demonstration
      setDashboardData({
        totalCustomers: 1250,
        totalWorkers: 45,
        totalOrders: 3200,
        ordersByStatus: {
          received: 320,
          'in-progress': 1200,
          ready: 480,
          delivered: 1100,
          cancelled: 100
        },
        workersByStatus: {
          available: 25,
          busy: 15,
          on_break: 3,
          offline: 2
        },
        paymentStats: {
          totalRevenue: 12500000,
          pendingPayments: 1800000,
          collectedPayments: 10700000,
          averageOrderValue: 3906
        },
        recentOrders: [
          {
            id: 1,
            orderNumber: 'SS003200',
            Customer: { User: { name: 'Rajesh Kumar', email: 'rajesh@example.com' }},
            Worker: { User: { name: 'John Taylor' }},
            status: 'in-progress',
            totalAmount: 4500,
            deliveryDate: '2025-08-15',
            createdAt: '2025-07-31'
          },
          {
            id: 2,
            orderNumber: 'SS003199',
            Customer: { User: { name: 'Priya Sharma', email: 'priya@example.com' }},
            Worker: { User: { name: 'Maria Rodriguez' }},
            status: 'ready',
            totalAmount: 7200,
            deliveryDate: '2025-08-10',
            createdAt: '2025-07-30'
          },
          {
            id: 3,
            orderNumber: 'SS003198',
            Customer: { User: { name: 'Ahmed Hassan', email: 'ahmed@example.com' }},
            Worker: { User: { name: 'Ahmed Khan' }},
            status: 'delivered',
            totalAmount: 5800,
            deliveryDate: '2025-08-01',
            createdAt: '2025-07-29'
          }
        ],
        topWorkers: [
          {
            id: 1,
            User: { name: 'Maria Rodriguez' },
            performanceMetrics: { completedOrders: 145, averageRating: 4.9, onTimeDelivery: 96 }
          },
          {
            id: 2,
            User: { name: 'John Taylor' },
            performanceMetrics: { completedOrders: 128, averageRating: 4.7, onTimeDelivery: 93 }
          },
          {
            id: 3,
            User: { name: 'Ahmed Khan' },
            performanceMetrics: { completedOrders: 98, averageRating: 4.8, onTimeDelivery: 89 }
          }
        ],
        monthlyTrends: [
          { month: '2025-02-01T00:00:00.000Z', orders: 180, revenue: 720000 },
          { month: '2025-03-01T00:00:00.000Z', orders: 210, revenue: 840000 },
          { month: '2025-04-01T00:00:00.000Z', orders: 195, revenue: 780000 },
          { month: '2025-05-01T00:00:00.000Z', orders: 245, revenue: 980000 },
          { month: '2025-06-01T00:00:00.000Z', orders: 290, revenue: 1160000 },
          { month: '2025-07-01T00:00:00.000Z', orders: 320, revenue: 1280000 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      received: 'info',
      'in-progress': 'warning',
      ready: 'success',
      delivered: 'default',
      cancelled: 'error',
      available: 'success',
      busy: 'warning',
      on_break: 'info',
      offline: 'error'
    };
    return colors[status] || 'default';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const orderStatusData = dashboardData ? Object.entries(dashboardData.ordersByStatus).map(([status, count]) => ({
    name: status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: count,
    color: getStatusColor(status) === 'info' ? '#2196f3' :
           getStatusColor(status) === 'warning' ? '#ff9800' :
           getStatusColor(status) === 'success' ? '#4caf50' :
           getStatusColor(status) === 'error' ? '#f44336' : '#9e9e9e'
  })) : [];

  const workerStatusData = dashboardData ? Object.entries(dashboardData.workersByStatus).map(([status, count]) => ({
    name: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: count,
    color: getStatusColor(status) === 'info' ? '#2196f3' :
           getStatusColor(status) === 'warning' ? '#ff9800' :
           getStatusColor(status) === 'success' ? '#4caf50' :
           getStatusColor(status) === 'error' ? '#f44336' : '#9e9e9e'
  })) : [];

  const monthlyTrendData = dashboardData ? dashboardData.monthlyTrends.map(item => ({
    month: new Date(item.month).toLocaleDateString('en-IN', { month: 'short' }),
    orders: parseInt(item.orders),
    revenue: parseInt(item.revenue) / 100000 // Convert to lakhs
  })) : [];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Box p={3}>
        <Alert severity="error">Failed to load dashboard data</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              SuitSync Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Real-time insights for your tailoring business
            </Typography>
          </Box>
          
          <Tooltip title="Refresh Dashboard">
            <IconButton onClick={fetchDashboardData} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </motion.div>

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error} - Showing sample data
        </Alert>
      )}

      {/* Key Metrics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 2,
              boxShadow: 2
            }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h5" fontWeight={600}>
                      {dashboardData.totalCustomers?.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                      Total Customers
                    </Typography>
                  </Box>
                  <PeopleIcon sx={{ fontSize: 36, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              borderRadius: 2,
              boxShadow: 2
            }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h5" fontWeight={600}>
                      {dashboardData.totalWorkers?.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                      Total Workers
                    </Typography>
                  </Box>
                  <WorkIcon sx={{ fontSize: 36, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              borderRadius: 2,
              boxShadow: 2
            }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h5" fontWeight={600}>
                      {dashboardData.totalOrders?.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                      Total Orders
                    </Typography>
                  </Box>
                  <OrderIcon sx={{ fontSize: 36, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              color: 'white',
              borderRadius: 2,
              boxShadow: 2
            }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h5" fontWeight={600}>
                      {formatCurrency(dashboardData.paymentStats?.totalRevenue || 0).replace('₹', '₹')}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                      Total Revenue
                    </Typography>
                  </Box>
                  <MoneyIcon sx={{ fontSize: 36, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>

      {/* Charts and Analytics */}
      <Grid container spacing={3} mb={3}>
        {/* Order Status Distribution */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Order Status Distribution
                </Typography>
                <Box sx={{ px: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <PieChart width={280} height={280}>
                      <Pie
                        data={orderStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </Box>
                  <Box display="flex" flexWrap="wrap" gap={1} justifyContent="center" sx={{ mt: 2, mb: 1.5 }}>
                    {orderStatusData.map((entry, index) => (
                      <Chip
                        key={index}
                        label={`${entry.name}: ${entry.value}`}
                        size="small"
                        sx={{ backgroundColor: entry.color, color: 'white', fontSize: '0.75rem', px: 1 }}
                      />
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Worker Status Distribution */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Worker Status Distribution
                </Typography>
                <Box sx={{ mb: 1.5 }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={workerStatusData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Monthly Trends */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Monthly Trends (Last 6 Months)
                </Typography>
                <Box sx={{ mb: 1.5 }}>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={monthlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <RechartsTooltip />
                      <Bar yAxisId="left" dataKey="orders" fill="#8884d8" name="Orders" />
                      <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#82ca9d" name="Revenue (₹ Lakhs)" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Bottom Section */}
      <Grid container spacing={3}>
        {/* Recent Orders */}
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Orders
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Order #</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Worker</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Delivery</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dashboardData.recentOrders?.slice(0, 5).map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>{order.orderNumber}</TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Avatar sx={{ width: 32, height: 32 }}>
                                {order.Customer?.User?.name?.charAt(0)}
                              </Avatar>
                              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                                {order.Customer?.User?.name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ opacity: 0.7 }}>
                              {order.Worker?.User?.name || 'Unassigned'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={order.status}
                              color={getStatusColor(order.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ opacity: 0.7 }}>
                              {formatCurrency(order.totalAmount)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ opacity: 0.7 }}>
                              {formatDate(order.deliveryDate)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Top Performing Workers */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h6" gutterBottom>
                  Top Performing Workers
                </Typography>
                {dashboardData.topWorkers?.slice(0, 5).map((worker, index) => (
                  <Box key={worker.id} display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      {worker.User?.name?.charAt(0)}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight={500} sx={{ opacity: 0.8 }}>
                        {worker.User?.name}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          {worker.performanceMetrics?.averageRating || 0}/5
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.7 }}>
                          • {worker.performanceMetrics?.completedOrders || 0} orders
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={worker.performanceMetrics?.onTimeDelivery || 0}
                        sx={{ height: 4, borderRadius: 2, mt: 1 }}
                        color={worker.performanceMetrics?.onTimeDelivery >= 90 ? 'success' : 'warning'}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.7 }}>
                        {worker.performanceMetrics?.onTimeDelivery || 0}% on-time delivery
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Payment Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <Card sx={{
          mt: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 2,
          boxShadow: 2
        }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="h6" gutterBottom>
              Payment Overview
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Box textAlign="center">
                  <Typography variant="h5" fontWeight={600}>
                    {formatCurrency(dashboardData.paymentStats?.totalRevenue || 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    Total Revenue
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box textAlign="center">
                  <Typography variant="h5" fontWeight={600}>
                    {formatCurrency(dashboardData.paymentStats?.collectedPayments || 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    Collected
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box textAlign="center">
                  <Typography variant="h5" fontWeight={600}>
                    {formatCurrency(dashboardData.paymentStats?.pendingPayments || 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    Pending
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box textAlign="center">
                  <Typography variant="h5" fontWeight={600}>
                    {formatCurrency(dashboardData.paymentStats?.averageOrderValue || 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    Avg Order Value
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default Dashboard;
