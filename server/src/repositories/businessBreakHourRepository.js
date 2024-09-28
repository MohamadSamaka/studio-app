const BusinessBreakHour = require('../models/businessBreakHour');
const BusinessHour = require('../models/businessHour');

class BusinessBreakHourRepository {
  async findAll() {
    return await BusinessBreakHour.findAll({
      include: {
        model: BusinessHour,
        as: 'business_hour', // Include related BusinessHour
      },
    });
  }

  async findById(id) {
    return await BusinessBreakHour.findByPk(id, {
      include: {
        model: BusinessHour,
        as: 'business_hour',
      },
    });
  }

  async findByBusinessHourId(business_hour_id) {
    return await BusinessBreakHour.findAll({
      where: { business_hour_id },
    });
  }

  async create(data) {
    return await BusinessBreakHour.create(data);
  }

  async update(id, data) {
    return await BusinessBreakHour.update(data, {
      where: { id },
    });
  }

  async delete(id) {
    return await BusinessBreakHour.destroy({
      where: { id },
    });
  }
}

module.exports = new BusinessBreakHourRepository();
