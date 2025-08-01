const sequelize = require('../config/database');
const { User, Customer, Worker } = require('../models');

const setupDatabase = async () => {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Force sync (recreate tables) - use with caution in production
    await sequelize.sync({ force: true });
    console.log('✅ All tables created successfully.');

    // Create admin user
    const adminUser = await User.create({
      email: 'admin@suitsync.com',
      password: 'admin123',
      role: 'admin',
      name: 'SuitSync Admin',
      phone: '9999999999'
    });
    console.log('✅ Admin user created.');

    // Create sample worker
    const workerUser = await User.create({
      email: 'john@suitsync.com',
      password: 'worker123',
      role: 'worker',
      name: 'John Taylor',
      phone: '8888888888'
    });

    await Worker.create({
      userId: workerUser.id,
      skills: ['shirts', 'pants', 'alterations'],
      hourlyRate: 25.00,
      specialization: 'shirts',
      experience: 5
    });
    console.log('✅ Sample worker created.');

    // Create sample customer
    const customerUser = await User.create({
      email: 'customer@suitsync.com',
      password: 'customer123',
      role: 'customer',
      name: 'Jane Smith',
      phone: '7777777777'
    });

    await Customer.create({
      userId: customerUser.id,
      preferences: {
        fitType: 'slim',
        preferredFabrics: ['cotton', 'linen'],
        notes: 'Prefers modern cuts'
      },
      address: '123 Fashion Street, Style City'
    });
    console.log('✅ Sample customer created.');

    console.log('\n🎉 SuitSync database setup completed successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin: admin@suitsync.com / admin123');
    console.log('Worker: john@suitsync.com / worker123');
    console.log('Customer: customer@suitsync.com / customer123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
};

setupDatabase();
