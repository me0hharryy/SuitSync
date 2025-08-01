const { Customer, Worker, Order, User } = require('../models');
const sequelize = require('../config/database');

async function testDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Test model queries
    const customerCount = await Customer.count();
    const workerCount = await Worker.count();
    const orderCount = await Order.count();
    const userCount = await User.count();
    
    console.log('📊 Database counts:');
    console.log(`- Users: ${userCount}`);
    console.log(`- Customers: ${customerCount}`);
    console.log(`- Workers: ${workerCount}`);
    console.log(`- Orders: ${orderCount}`);
    
    // Test customer fetch with associations
    const customers = await Customer.findAll({
      include: [{ model: User, attributes: ['name', 'email', 'phone'] }],
      limit: 3
    });
    console.log(`- Sample customers: ${customers.length}`);
    
    const workers = await Worker.findAll({
      include: [{ model: User, attributes: ['name', 'email', 'phone'] }],
      limit: 3
    });
    console.log(`- Sample workers: ${workers.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  }
}

testDatabase();
