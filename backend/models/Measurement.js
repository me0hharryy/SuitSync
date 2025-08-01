module.exports = (sequelize, DataTypes) => {
  const Measurement = sequelize.define('Measurement', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Customers',
        key: 'id',
      },
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: true, // Can be linked to order later or used for general customer measurements
      references: {
        model: 'Orders',
        key: 'id',
      },
    },
    measurementType: {
      type: DataTypes.ENUM('shirt', 'pant', 'suit', 'blazer', 'kurta', 'dress', 'general'),
      allowNull: false,
      defaultValue: 'general'
    },
    measurements: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
      comment: 'Stores all measurement values in JSON format'
    },
    notes: {
      type: DataTypes.TEXT,
      comment: 'Additional notes about measurements'
    },
    takenBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
      comment: 'ID of the worker/admin who took the measurements'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Whether this is the current active measurement set for the customer'
    },
    measurementDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });

  Measurement.associate = function(models) {
    Measurement.belongsTo(models.Customer, {
      foreignKey: 'customerId',
      onDelete: 'CASCADE',
    });
    
    Measurement.belongsTo(models.Order, {
      foreignKey: 'orderId',
      onDelete: 'SET NULL',
    });
    
    Measurement.belongsTo(models.User, {
      foreignKey: 'takenBy',
      as: 'MeasuredBy',
    });
  };

  return Measurement;
};
