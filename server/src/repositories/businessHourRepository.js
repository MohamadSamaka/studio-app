const BusinessHour = require('../models/businessHour');
const BusinessBreakHour = require('../models/businessBreakHour');
// const sequelize  = require('../models/index');
const sequelize = require('../config/database'); // Directly import Sequelize instance

class BusinessHourRepository {
  async findAll() {
    return await BusinessHour.findAll({
      include: {
        model: BusinessBreakHour,
        as: 'breaks', // Alias to match Prisma's include behavior
      },
    });
  }

  async findById(id) {
    return await BusinessHour.findByPk(id, {
      include: {
        model: BusinessBreakHour,
        as: 'breaks',
      },
    });
  }


  async findByDayOfWeek(dayOfWeek, includeBussinessBreakHours = true) {
    // Build the include array conditionally
    const include = includeBussinessBreakHours ? [
      {
        model: BusinessBreakHour, // Include any breaks related to this business hour
        as: 'breaks',
      }
    ] : [];

    // Find the business hour for the given day of the week
    const businessHour = await BusinessHour.findOne({
      where: {
        day_of_week: dayOfWeek
      },
      include: include
    });

    return businessHour;
  }

  async findBusinessHourByDay(dayOfWeek) {
    try {
      return await BusinessHour.findOne({
        where: { day_of_week: dayOfWeek },
        include: [{
          model: BusinessBreakHour,
          as: 'breaks'
        }]
      });
    } catch (error) {
      console.error('Error finding business hour:', error);
      throw error;
    }
  }

  async create(data, transaction) {
    const { breaks, ...businessHourData } = data;
  
    // First, create the BusinessHour
    const businessHour = await BusinessHour.create(businessHourData, { transaction });
  
    // If there are breaks, create them separately
    if (breaks && breaks.length > 0) {
      const breaksWithBusinessHourId = breaks.map(breakItem => ({
        ...breakItem,
        business_hour_id: businessHour.id
      }));
  
      await BusinessBreakHour.bulkCreate(breaksWithBusinessHourId, { transaction });
    }
  
    // Fetch the created BusinessHour with its breaks
    return BusinessHour.findByPk(businessHour.id, {
      include: [{ model: BusinessBreakHour, as: 'breaks' }],
      transaction
    });
  }
  
  async update(id, data) {
    return await BusinessHour.update(data, { where: { id } });
  }

  async updateByDayOfWeek(dayOfWeek, data) {
    const { breaks, ...businessHourData } = data;
  
    const transaction = await BusinessHour.sequelize.transaction();
    try {
      // Find the business hour by day_of_week
      const businessHour = await this.findByDayOfWeek(dayOfWeek, false);
  
      if (!businessHour) {
        throw new Error(`Business hour for ${dayOfWeek} not found`);
      }
  
      // Update the business hour's open and close times
      await businessHour.update(businessHourData, { transaction });
  
      // If breaks are provided, either update or delete breaks
      if (breaks && breaks.length > 0) {
        // Delete old breaks
        await BusinessBreakHour.destroy({ where: { business_hour_id: businessHour.id }, transaction });
  
        // Add new breaks
        for (const breakData of breaks) {
          await BusinessBreakHour.create({
            business_hour_id: businessHour.id,
            start_time: breakData.start_time,
            end_time: breakData.end_time,
          }, { transaction });
        }
      } else if (breaks && breaks.length === 0) {
        // If the breaks array is empty, delete all breaks for this business hour
        await BusinessBreakHour.destroy({ where: { business_hour_id: businessHour.id }, transaction });
      }
  
      await transaction.commit();
      return businessHour;
  
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  

  async delete(id) {
    return await BusinessHour.destroy({ where: { id } });
  }

  async deleteByDayOfWeek(dayOfWeek) {
    // Find the business hour by day_of_week
    const businessHour = await BusinessHour.findOne({ where: { day_of_week: dayOfWeek } });

    if (!businessHour) {
      return 0; // Return 0 if not found
    }

    // Delete associated breaks
    await BusinessBreakHour.destroy({ where: { business_hour_id: businessHour.id } });

    // Delete the business hour itself
    const result = await BusinessHour.destroy({ where: { day_of_week: dayOfWeek } });

    return result; // Return number of rows deleted
  }
}

module.exports = new BusinessHourRepository();
