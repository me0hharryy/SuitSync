module.exports = (sequelize, DataTypes) => {
  const Worker = sequelize.define('Worker', {
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
    skills: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    paymentType: {
      type: DataTypes.ENUM('hourly', 'monthly', 'per_piece'),
      defaultValue: 'hourly',
    },
    hourlyRate: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
    },
    monthlyFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    pieceRate: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('available', 'busy', 'on_break', 'offline'),
      defaultValue: 'available',
    },
    specialization: {
      type: DataTypes.STRING,
    },
    experience: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    address: {
      type: DataTypes.TEXT,
    },
    emergencyContact: {
      type: DataTypes.STRING,
    },
    joinDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    workingHours: {
      type: DataTypes.JSONB,
      defaultValue: {
        start: '09:00',
        end: '18:00',
        daysPerWeek: 6
      },
    },
    performanceMetrics: {
      type: DataTypes.JSONB,
      defaultValue: {
        completedOrders: 0,
        averageRating: 0,
        onTimeDelivery: 0
      },
    },
  });

  Worker.associate = function(models) {
    Worker.belongsTo(models.User, {
      foreignKey: 'userId',
      onDelete: 'CASCADE',
    });
    
    Worker.hasMany(models.Order, {
      foreignKey: 'workerId',
      as: 'assignedOrders',
    });
  };

  return Worker;
};
