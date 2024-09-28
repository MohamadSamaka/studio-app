const sequelize = require("../config/database"); // Directly import Sequelize instance
const Notification = require("../models/notification");

class NotificationRepository {
  async findAll(userId) {
    return await Notification.findAll({
      where: {
        user_id: userId,
        read: false,
      },
    });
  }

  async create(data) {
    try {
      return await Notification.create(data);
    } catch (error) {
      throw error;
    }
  }

  // async markAsRead(notificationId) {
  //   return await Notification.update(
  //     { read: true },
  //     { where: { id: notificationId } }
  //   );
  // }

  async markAsRead(notificationIds) {
    const transaction = await sequelize.transaction();
    try {
      const [numberOfAffectedRows] = await Notification.update(
        { read: true },
        {
          where: {
            id: notificationIds,
          },
          transaction,
        }
      );

      await transaction.commit();
      return { affectedCount: numberOfAffectedRows };
    } catch (error) {
      await transaction.rollback();
      console.error("Error in repository markAsRead with transaction:", error);
      throw error;
    }
  }
}

module.exports = new NotificationRepository();
