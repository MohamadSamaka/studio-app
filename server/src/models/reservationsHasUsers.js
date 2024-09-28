const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const Reservation = require('./reservation');
const User = require('./user');

class ReservationsHasUsers extends Model {}

ReservationsHasUsers.init({
  reservations_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: Reservation,
      key: 'id',
    },
  },
  users_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: User,
      key: 'id',
    },
  },
}, {
  sequelize,
  modelName: 'ReservationsHasUsers',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['reservations_id', 'users_id'],
    },
  ],
});

module.exports = ReservationsHasUsers;