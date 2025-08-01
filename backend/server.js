const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/database');

// Import models to initialize associations
require('./models');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Server is running', 
    timestamp: new Date().toISOString(),
    database: 'Connected'
  });
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ success: true, message: 'Database connected successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Database connection failed', error: error.message });
  }
});

// Routes with error handling - LOAD BEFORE WILDCARD
try {
  app.use('/api/auth', require('./routes/auth'));
  console.log('✅ Auth routes loaded');
} catch (error) {
  console.error('❌ Failed to load auth routes:', error.message);
}

try {
  app.use('/api/customers', require('./routes/customers'));
  console.log('✅ Customer routes loaded');
} catch (error) {
  console.error('❌ Failed to load customer routes:', error.message);
}

try {
  app.use('/api/workers', require('./routes/workers'));
  console.log('✅ Worker routes loaded');
} catch (error) {
  console.error('❌ Failed to load worker routes:', error.message);
}

try {
  const ordersRouter = require('./routes/orders');
  if (typeof ordersRouter === 'function' || (ordersRouter && typeof ordersRouter.use === 'function')) {
    app.use('/api/orders', ordersRouter);
    console.log('✅ Order routes loaded');
  } else {
    console.log('❌ Orders router is not a valid Express router');
  }
} catch (error) {
  console.error('❌ Failed to load order routes:', error.message);
  console.error('Stack:', error.stack);
}

try {
  app.use('/api/admin', require('./routes/admin'));
  console.log('✅ Admin routes loaded');
} catch (error) {
  console.error('❌ Failed to load admin routes:', error.message);
}

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler - MUST BE LAST and use NAMED wildcard
app.use('/*path', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Database connection and server start
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    // Sync database models
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 SuitSync Server running on port ${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/health`);
      console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth/login`);
      console.log(`👥 Workers endpoint: http://localhost:${PORT}/api/workers`);
      console.log(`👤 Customers endpoint: http://localhost:${PORT}/api/customers`);
      console.log(`📦 Orders endpoint: http://localhost:${PORT}/api/orders`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
