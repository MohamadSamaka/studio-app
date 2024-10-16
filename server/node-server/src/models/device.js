// models/Device.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');

class Device extends Model {}

Device.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  expoPushToken: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
}, {
  sequelize,
  modelName: 'Device',
  timestamps: true,
});

module.exports = Device;
