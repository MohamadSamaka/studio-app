
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const AvailabilityException = require('./availabilityException'); // Import AvailabilityException to access it

class AvailabilityExceptionBreaks extends Model {}

AvailabilityExceptionBreaks.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  availability_exception_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'AvailabilityExceptions',
      key: 'id',
    },
    onDelete: 'CASCADE',  // Automatically delete associated breaks when the parent is deleted
    onUpdate: 'CASCADE',  // Reflect changes in the parent's id on the associated breaks
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'AvailabilityExceptionBreaks',
  timestamps: false,
  validate: {
    async startTimeBeforeEndTime() {
      const startTime = new Date(`1970-01-01T${this.start_time}`);
      const endTime = new Date(`1970-01-01T${this.end_time}`);
      if (startTime >= endTime) {
        throw new Error('Start time must be earlier than end time.');
      }
    },
    
    async breakWithinAvailabilityTimes() {
      const availabilityException = await AvailabilityException.findOne({
        where: { id: this.availability_exception_id }
      });

      if (!availabilityException) {
        throw new Error('Associated availability exception not found.');
      }

      const openTime = availabilityException.start_time ? new Date(`1970-01-01T${availabilityException.start_time}`) : null;
      const closeTime = availabilityException.end_time ? new Date(`1970-01-01T${availabilityException.end_time}`) : null;
      const breakStartTime = new Date(`1970-01-01T${this.start_time}`);
      const breakEndTime = new Date(`1970-01-01T${this.end_time}`);

      if (openTime && breakStartTime < openTime) {
        throw new Error(`Break start time must be later than or equal to availability start time (${availabilityException.start_time}).`);
      }

      if (closeTime && breakEndTime > closeTime) {
        throw new Error(`Break end time must be earlier than or equal to availability end time (${availabilityException.end_time}).`);
      }
    }
  }
});

module.exports = AvailabilityExceptionBreaks;
