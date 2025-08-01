const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');


// Initialize models object
const models = {};

// Define required models - only include models that exist
const modelFiles = [
  'User',
  'Customer', 
  'Worker',
  'Order',
  'OrderItem',
  'Measurement'
];

// Import models safely
modelFiles.forEach(modelName => {
  try {
    const modelPath = `./${modelName}`;
    const model = require(modelPath)(sequelize, DataTypes);
    models[model.name] = model;
    console.log(`✅ ${modelName} model loaded successfully`);
  } catch (error) {
    console.warn(`⚠️  Warning: ${modelName} model not found or has errors:`, error.message);
  }
});

// Define associations after all models are loaded
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    try {
      models[modelName].associate(models);
      console.log(`✅ ${modelName} associations defined`);
    } catch (error) {
      console.error(`❌ Error defining associations for ${modelName}:`, error.message);
    }
  }
});

// Add sequelize instance and Sequelize constructor to models
models.sequelize = sequelize;
models.Sequelize = Sequelize;

console.log('📚 Available models:', Object.keys(models).filter(key => key !== 'sequelize' && key !== 'Sequelize'));

module.exports = models;
