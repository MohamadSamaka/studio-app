const Subscription = require('../models/subscription'); // Import the Sequelize model

class SubscriptionRepository {
  async findAll() {
    return await Subscription.findAll();
  }

  async findAllActive() {
    return await Subscription.findAll({
      where:{
        active: true,
      }
    });
  }

  async findOne(condition) {
    return await Subscription.findOne(condition);
  }

  async findById(id) {
    return await Subscription.findByPk(id); // Sequelize equivalent of `findUnique` using primary key
  }

  async create(data) {
    return await Subscription.create(data);
  }

  async update(id, data) {
    return await Subscription.update(data, { where: { id } });
  }

  async delete(id) {
    return await Subscription.destroy({ where: { id } });
  }
}

module.exports = new SubscriptionRepository();
