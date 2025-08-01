module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderNumber: {
      type: DataTypes.STRING,
      unique: true,
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Customers',
        key: 'id',
      },
    },
    workerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Workers',
        key: 'id',
      },
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    advancePayment: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    balanceAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('received', 'in-progress', 'ready', 'delivered', 'cancelled'),
      defaultValue: 'received',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'medium',
    },
    deliveryDate: {
      type: DataTypes.DATE,
    },
    notes: {
      type: DataTypes.TEXT,
    },
  }, {
    hooks: {
      beforeCreate: async (order) => {
        if (!order.orderNumber) {
          const count = await Order.count();
          order.orderNumber = `SS${String(count + 1).padStart(6, '0')}`;
        }
      },
    },
  });

  Order.associate = function(models) {
    Order.belongsTo(models.Customer, {
      foreignKey: 'customerId',
    });
    
    Order.belongsTo(models.Worker, {
      foreignKey: 'workerId',
    });
    
    Order.hasMany(models.OrderItem, {
      foreignKey: 'orderId',
      as: 'items',
    });

    Order.hasMany(models.Measurement, {
      foreignKey: 'orderId',
      as: 'measurements',
    });
  };

  return Order;
};
