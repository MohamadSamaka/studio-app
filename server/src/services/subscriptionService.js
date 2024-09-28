const subscriptionRepository = require('../repositories/subscriptionRepository');

class SubscriptionService {
  async getAllSubscriptions() {
    return await subscriptionRepository.findAll();
  }

  async getSubscriptionById(id) {
    return await subscriptionRepository.findById(id);
  }

  async createSubscription(data) {
    try {
      // Validate unique constraints or other combinations here
      const existingSubscription = await subscriptionRepository.findOne({
        where: {
          // Example condition: Assuming `meetings_num` and `price` combination must be unique
          meetings_num: Math.floor(data.meetings_num),
          price: data.price,
        },
      });
  
      if (existingSubscription) {
        throw new Error('A subscription with the same number of meetings and price already exists.');
      }
  
      // Proceed to create a new subscription
      return await subscriptionRepository.create(data);
    } catch (error) {
      // Re-throw the error to be handled by the controller
      throw error;
    }
  }

  async updateSubscription(id, data) {
    return await subscriptionRepository.update(id, data);
  }

  async deleteSubscription(id) {
    return await subscriptionRepository.delete(id);
  }
}

module.exports = new SubscriptionService();
