const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const BusinessHour = require('./businessHour');  // Import BusinessHour to access it

class BusinessBreakHour extends Model {}

BusinessBreakHour.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  business_hour_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: BusinessHour, // Reference the BusinessHour model
      key: 'id',
    },
    onDelete: 'CASCADE',
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
  modelName: 'BusinessBreakHour',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['business_hour_id', 'start_time', 'end_time']
    }
  ],
  validate: {
    async startTimeBeforeEndTime() {
      const startTime = new Date(`1970-01-01T${this.start_time}`);
      const endTime = new Date(`1970-01-01T${this.end_time}`);
      if (startTime >= endTime) {
        throw new Error('Start time must be earlier than end time.');
      }
    },
    
    async breakWithinBusinessHours() {
      const businessHour = await BusinessHour.findOne({
        where: { id: this.business_hour_id }
      });

      if (!businessHour) {
        console.log("maana wtfff?")
        throw new Error('Associated business hour not found.');
      }

      const openTime = new Date(`1970-01-01T${businessHour.open_time}`);
      const closeTime = new Date(`1970-01-01T${businessHour.close_time}`);
      const breakStartTime = new Date(`1970-01-01T${this.start_time}`);
      const breakEndTime = new Date(`1970-01-01T${this.end_time}`);

      if (breakStartTime < openTime || breakEndTime > closeTime) {
        throw new Error(`Break time must fall between business open (${businessHour.open_time}) and close (${businessHour.close_time}) times.`);
      }
    }
  }
});

module.exports = BusinessBreakHour;
