const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class AvailabilityException extends Model { }

AvailabilityException.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    unique: true,
    allowNull: false,
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  is_closed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  sequelize,
  modelName: 'AvailabilityException',
  timestamps: false,
  validate: {
    startTimeBeforeEndTime() {
      const openTime = new Date(`1970-01-01T${this.start_time}`);
      const closeTime = new Date(`1970-01-01T${this.end_time}`);
      if (!this.is_closed && openTime >= closeTime) {
        throw new Error('Start time must be earlier than End time.');
      }
    }
  }
});

module.exports = AvailabilityException;
