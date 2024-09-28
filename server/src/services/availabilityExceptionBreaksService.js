const availabilityExceptionBreaksRepository = require('../repositories/availabilityExceptionBreaksRepository');

class AvailabilityExceptionBreaksService {
  async createBreak(data) {
    return availabilityExceptionBreaksRepository.create(data);
  }

  async getBreaksForException(availabilityExceptionId) {
    return availabilityExceptionBreaksRepository.findByAvailabilityExceptionId(availabilityExceptionId);
  }

  async updateBreak(id, data) {
    return availabilityExceptionBreaksRepository.update(id, data);
  }

  async deleteBreak(id) {
    return availabilityExceptionBreaksRepository.delete(id);
  }
}

module.exports = new AvailabilityExceptionBreaksService();
