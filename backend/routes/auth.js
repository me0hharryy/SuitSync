const express = require('express');
const jwt = require('jsonwebtoken');
const { User, Customer, Worker } = require('../models');
const router = express.Router();

// Register
// Update the register route in backend/routes/auth.js
router.post('/register', async (req, res) => {
  const transaction = await require('../config/database').transaction();
  
  try {
    const { 
      email, 
      password = 'defaultPassword123', 
      role, 
      name, 
      phone,
      // Worker specific fields
      skills,
      paymentType,
      hourlyRate,
      monthlyFee,
      pieceRate,
      specialization,
      experience,
      status,
      address,
      emergencyContact,
      joinDate,
      isActive,
      workingHours,
      performanceMetrics
    } = req.body;
    
    console.log('Registration attempt for:', email, 'Role:', role);
    console.log('Request body:', req.body); // Debug log
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      role,
      name,
      phone,
      isActive: isActive !== undefined ? isActive : true
    }, { transaction });

    // Create associated profile based on role
    if (role === 'customer') {
      await Customer.create({ 
        userId: user.id,
        address: address || '',
        preferences: {
          fitType: 'regular',
          preferredFabrics: [],
          notes: ''
        }
      }, { transaction });
    } else if (role === 'worker') {
      // Create worker with all the new fields
      await Worker.create({ 
        userId: user.id,
        skills: skills || [],
        paymentType: paymentType || 'hourly',
        hourlyRate: paymentType === 'hourly' ? hourlyRate : null,
        monthlyFee: paymentType === 'monthly' ? monthlyFee : null,
        pieceRate: paymentType === 'per_piece' ? pieceRate : null,
        specialization: specialization || '',
        experience: experience || 0,
        status: status || 'available',
        address: address || '',
        emergencyContact: emergencyContact || '',
        joinDate: joinDate || new Date(),
        isActive: isActive !== undefined ? isActive : true,
        workingHours: workingHours || {
          start: '09:00',
          end: '18:00',
          daysPerWeek: 6
        },
        performanceMetrics: performanceMetrics || {
          completedOrders: 0,
          averageRating: 0,
          onTimeDelivery: 0
        }
      }, { transaction });
    }

    await transaction.commit();

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'suitsync-secret',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Registration failed',
      error: error.stack // Add this for debugging
    });
  }
});


// Login
// In your login route
router.post('/login', async (req, res) => {
  console.log('=== LOGIN REQUEST RECEIVED ===');
  console.log('Request body:', req.body);
  console.log('Email:', req.body.email);
  console.log('Password:', req.body.password);
  
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ where: { email, isActive: true } });
    console.log('User found:', user ? 'YES' : 'NO');
    
    if (!user) {
      console.log('❌ No user found with email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const passwordMatch = await user.comparePassword(password);
    console.log('Password match:', passwordMatch);
    
    if (!passwordMatch) {
      console.log('❌ Password does not match');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'suitsync-secret',
      { expiresIn: '7d' }
    );
    
    console.log('✅ Login successful, token generated');
    console.log('Token preview:', token.substring(0, 20) + '...');
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});


module.exports = router;
