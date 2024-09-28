const AvailabilityException = require('../models/availabilityException'); // Assuming AvailabilityException is exported from your models
const AvailabilityExceptionBreaks = require('../models/availabilityExceptionBreaks');
const { Op } = require('sequelize');

class AvailabilityExceptionRepository {
  async findAll() {
    return AvailabilityException.findAll({
      where: {
        date: {
          [Op.gte]: new Date(), // Op.gte means greater than or equal to
        },
      },
      include: [{ model: AvailabilityExceptionBreaks, as: 'AvailabilityExceptionBreaks' }],
    });
  }

  async findById(id) {
    return AvailabilityException.findByPk(id, {
      include: [{ model: AvailabilityExceptionBreaks, as: 'AvailabilityExceptionBreaks' }],
    });
  }

  async findClosedExceptionByDate(date) {
    try {
      return await AvailabilityException.findOne({
        where: {
          date: date,
          is_closed: true
        }
      });
    } catch (error) {
      console.error('Error finding closed availability exception:', error);
      throw error;
    }
  }



  async findByDate(date) {
    // Find the availability exception for the given date
    const availabilityException = await AvailabilityException.findOne({
      where: {
        date: date
      },
      include: [
        {
          model: AvailabilityExceptionBreaks, // Include any breaks related to this exception
          as: 'AvailabilityExceptionBreaks',
        }
      ]
    });

    return availabilityException;
  }


  async create(data, transaction) {
    const { AvailabilityExceptionBreaks: breaks, ...availabilityData } = data;
  
    // First, create the AvailabilityException
    const availabilityException = await AvailabilityException.create(availabilityData, { transaction });
  
    // If there are breaks, create them separately
    if (breaks && breaks.length > 0) {
      const breaksWithAvailabilityExceptionId = breaks.map(availabilityBreak => ({
        ...availabilityBreak,
        availability_exception_id: availabilityException.id
      }));
      await AvailabilityExceptionBreaks.bulkCreate(breaksWithAvailabilityExceptionId, { transaction });
    }
  
    // Fetch the created AvailabilityException with its breaks
    return AvailabilityException.findByPk(availabilityException.id, {
      include: [{ model: AvailabilityExceptionBreaks, as: 'AvailabilityExceptionBreaks' }],
      transaction
    });
  }




  async bulkCreate(dataArray, transaction) {
    return AvailabilityException.bulkCreate(dataArray, { transaction });
  }

  async update(id, data) {
    return AvailabilityException.update(data, {
      where: { id },
    });
  }


  async delete(id) {
    return AvailabilityException.destroy({ where: { id } });
  }
}

module.exports = new AvailabilityExceptionRepository();
