const notificationService = require("../services/notificationService");
// Controller to handle config.json operations
class NotificationsController {
  async getNotificaions(req, res) {
    const userId = req.user.id;
    try {
      const notificationsData = await notificationService.getNotifications(
        userId
      );
      res.status(200).json(notificationsData);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ error: "An error occurred while fetching notifications." });
    }
  }

  async markNotificationAsRead(req, res) {
    const { notificationIds } = req.body;
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      console.log("notificationIds must be a non-empty array")
      return res.status(400).json({
        error: 'notificationIds must be a non-empty array.',
      });
    }
  
    const areAllIdsValid = notificationIds.every(id => typeof id === 'string' || typeof id === 'number');
    if (!areAllIdsValid) {
      console.log("All notificationIds must be strings or numbers.")

      return res.status(400).json({
        error: 'All notificationIds must be strings or numbers.',
      });
    }
    try {
      await notificationService.markNotificationsAsRead(notificationIds);
      return res.status(200).json({
        message: 'Notification marked as read.',
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "An error occurred while Marking notification as read." });
    }
    
  }
}

module.exports = new NotificationsController();
