module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define('Customer', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    address: {
      type: DataTypes.TEXT,
    },
    preferences: {
      type: DataTypes.JSONB,
      defaultValue: {
        fitType: 'regular',
        preferredFabrics: [],
        notes: ''
      },
    },
    totalOrders: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    loyaltyPoints: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  });

  Customer.associate = function(models) {
    Customer.belongsTo(models.User, {
      foreignKey: 'userId',
      onDelete: 'CASCADE',
    });
    
    Customer.hasMany(models.Order, {
      foreignKey: 'customerId',
      as: 'orders',
    });
    
    Customer.hasMany(models.Measurement, {
      foreignKey: 'customerId',
      as: 'measurements',
    });
  };

  return Customer;
};
