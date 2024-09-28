const businessBreakHourRepository = require('../repositories/businessBreakHourRepository');

class BusinessBreakHourService {
  async getAllBusinessBreakHours() {
    try {
      return await businessBreakHourRepository.findAll();
    } catch (error) {
      console.error('Error fetching all business break hours:', error);
      throw new Error('Could not fetch business break hours');
    }
  }

  async getBusinessBreakHourById(id) {
    try {
      const breakHour = await businessBreakHourRepository.findById(id);
      if (!breakHour) {
        throw new Error(`Business break hour with id ${id} not found`);
      }
      return breakHour;
    } catch (error) {
      console.error(`Error fetching business break hour with id ${id}:`, error);
      throw new Error(`Could not fetch business break hour with id ${id}`);
    }
  }
  

  async createBusinessBreakHour(data) {
    try {
      return await businessBreakHourRepository.create(data);
    } catch (error) {
      console.error('Error creating business break hour:', error);
      throw new Error('Could not create business break hour');
    }
  }

  async updateBusinessBreakHour(id, data) {
    try {
      const [updated] = await businessBreakHourRepository.update(id, data); // Update returns [number of affected rows]
      if (!updated) {
        throw new Error(`Business break hour with id ${id} not found`);
      }
      return updated;
    } catch (error) {
      console.error(`Error updating business break hour with id ${id}:`, error);
      throw new Error(`Could not update business break hour with id ${id}`);
    }
  }

  async deleteBusinessBreakHour(id) {
    try {
      const deleted = await businessBreakHourRepository.delete(id);
      if (!deleted) {
        throw new Error(`Business break hour with id ${id} not found`);
      }
      return deleted;
    } catch (error) {
      console.error(`Error deleting business break hour with id ${id}:`, error);
      throw new Error(`Could not delete business break hour with id ${id}`);
    }
  }
}

module.exports = new BusinessBreakHourService();
