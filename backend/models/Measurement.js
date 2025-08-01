// backend/models/measurement.js

module.exports = (sequelize, DataTypes) => {
  const Measurement = sequelize.define('Measurement', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Orders',
        key: 'id',
      },
    },
    // Common body measurements
    chest: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    waist: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    hips: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    shoulder: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    sleeveLength: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    collarSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    inseam: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    thigh: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // Generic field for any other custom measurements
    customMeasurements: {
      type: DataTypes.JSON, // Stores an object of key-value pairs, e.g., { "back_length": 18, "arm_circumference": 12 }
      allowNull: true,
    },
  });

  Measurement.associate = function(models) {
    Measurement.belongsTo(models.Order, {
      foreignKey: 'orderId',
    });
  };

  return Measurement;
};
