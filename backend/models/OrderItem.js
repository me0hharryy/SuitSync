module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define('OrderItem', {
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
    itemType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fabric: {
      type: DataTypes.STRING,
    },
    color: {
      type: DataTypes.STRING,
    },
    specifications: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    measurements: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    price: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'cutting', 'stitching', 'finishing', 'completed'),
      defaultValue: 'pending',
    },
  });

  OrderItem.associate = function(models) {
    OrderItem.belongsTo(models.Order, {
      foreignKey: 'orderId',
      onDelete: 'CASCADE',
    });
  };

  return OrderItem;
};
