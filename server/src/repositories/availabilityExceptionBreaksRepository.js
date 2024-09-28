const  AvailabilityExceptionBreaks = require('../models/availabilityExceptionBreaks');

class AvailabilityExceptionBreaksRepository {
  async create(data) {
    return AvailabilityExceptionBreaks.create(data);
  }

  async findById(id){
    return AvailabilityExceptionBreaks.findById(id)
  }

  async findByAvailabilityExceptionId(availabilityExceptionId) {
    return AvailabilityExceptionBreaks.findAll({
      where: { availability_exception_id: availabilityExceptionId },
    });
  }

  async update(id, data) {
    return AvailabilityExceptionBreaks.update(data, {
      where: { id },
    });
  }

  async delete(id) {
    return AvailabilityExceptionBreaks.destroy({
      where: { id },
    });
  }
}

module.exports = new AvailabilityExceptionBreaksRepository();
