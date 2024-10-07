const RechargeCreditRequest = require("../models/rechargeCreditRequest");
const User = require("../models/user");
const Subscription = require("../models/subscription");
const { Op } = require("sequelize");

class RechargeCreditRequestRepository {
  async findAll() {
    return await RechargeCreditRequest.findAll({
      include: [
        { model: User, attributes: ["username"] },
        { model: Subscription, attributes: ["subscription_name"] },
      ],
      order: [
        ["date", "DESC"], // Orders by date descending (newest first)
        ["time", "DESC"], // Orders by time descending within the same date
      ],
    });
  }

  async findById(id) {
    return await RechargeCreditRequest.findByPk(id, {
      include: [
        { model: User, attributes: ["username"] },
        { model: Subscription, attributes: ["subscription_name"] },
      ],
    });
  }

  async findUserById(userId, transaction) {
    return await User.findByPk(userId, { transaction });
  }

  async findRequestsByUserId(userId) {
    return await RechargeCreditRequest.findAll({
      where: {
        users_id: userId,
        [Op.or]: [{ status: "pending" }, { status: "awaiting_payment" }],
      },
      include: [{ model: Subscription, attributes: ["subscription_name"] }],
    });
  }

  async findSubscriptionById(subscriptionId, transaction) {
    return await Subscription.findByPk(subscriptionId, { transaction });
  }

  async create(data) {
    return await RechargeCreditRequest.create({
      users_id: data.userId,
      subscription_type: data.subscriptionType,
      date: data.date,
      time: data.time,
    });
  }

  async update(id, status) {
    const rechargeRequest = await RechargeCreditRequest.findByPk(id);
    if (rechargeRequest) {
      rechargeRequest.status = status; // Set the new status
      return await rechargeRequest.save(); // Save the updated status to the database
    }
    return null;
  }

  async updateStatus(id, status, transaction) {
    const rechargeRequest = await RechargeCreditRequest.findByPk(id, {
      transaction,
    });
    if (rechargeRequest) {
      rechargeRequest.status = status;
      await rechargeRequest.save({ transaction });
      return rechargeRequest;
    }
    return null;
  }

  async updateUserCredits(user, credits, transaction) {
    user.credits = credits;
    return await user.save({ transaction });
  }

  async delete(id) {
    return await RechargeCreditRequest.destroy({ where: { id } });
  }
}

module.exports = new RechargeCreditRequestRepository();
