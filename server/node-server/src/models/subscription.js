const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Subscription extends Model {}

Subscription.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  subscription_name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  meetings_num: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  sequelize,
  modelName: 'Subscription',
  timestamps: false,
});

module.exports = Subscription;
