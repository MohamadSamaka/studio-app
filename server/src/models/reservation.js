const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Reservation extends Model {}

Reservation.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,  // Set to false if a date is always required
  },
  time: {
    type: DataTypes.TIME,
    allowNull: false,  // Set to false if time is always required
  },
}, {
  sequelize,
  modelName: 'Reservation',
  timestamps: false,
  indexes: [{ unique: true, fields: ['date', 'time'] }],  // Ensures no duplicate date/time slots
});

module.exports = Reservation;
