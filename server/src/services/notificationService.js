const notificationRepository = require("../repositories/notificationRepository");

const { Expo } = require("expo-server-sdk");
const Device = require("../models/device");
const moment = require("moment");

// Create a new Expo SDK client
let expo = new Expo();

class NotificationService {
  async getNotifications(userId) {
    try {
      return await notificationRepository.findAll(userId);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw new Error("Could not fetch notifications");
    }
  }

  async createNotification(notificationData) {
    try {
      return await notificationRepository.create(notificationData);
    } catch (error) {
      console.log("failed to save notificaiton", error);
      throw new Error("Could not create notification");
    }
  }

  async markNotificationsAsRead(notificationIds) {
    try {
      const result = await notificationRepository.markAsRead(notificationIds);
      return result; // { affectedCount: numberOfAffectedRows }
    } catch (error) {
      console.error("Error in service markNotificationsAsRead:", error);
      throw new Error("Could not mark notifications as read");
    }
  }

  async sendUsersRemovedNotification(userIds, reservationDetails) {
    try {
      let messages = [];
      userIds = userIds.map((id) => Number(id));

      // Loop through each user ID
      for (const userId of userIds) {
        // Format the reservation date and time
        const formattedDate = moment(reservationDetails.date).format(
          "YYYY-MM-DD"
        );
        const formattedTime = moment(
          reservationDetails.start_time,
          "HH:mm:ss"
        ).format("hh:mm A");

        const notificationTitle = "❌ Reservation Update";
        const notificationContent = `Your reservation scheduled on ${formattedDate} at ${formattedTime} has been cancelled.`;

        // Fetch Expo push tokens for the user
        const devices = await Device.findAll({
          where: {
            user_id: userId,
          },
        });
        devices.forEach((device) => {
          if (!Expo.isExpoPushToken(device.expoPushToken)) {
            console.error(
              `Push token ${device.expoPushToken} is not a valid Expo push token`
            );
            return;
          }

          // Build the push notification message
          const message = {
            to: device.expoPushToken,
            sound: "default",
            title: notificationTitle,
            body: notificationContent,
            data: {
              reservationId: reservationDetails.reservationId, // Assuming reservationId comes from reservationDetails
              status: "cancelled",
            },
          };

          messages.push(message);
        });
        // Create notification record in your database for each user
        this.createNotification({
          user_id: userId,
          title: notificationTitle,
          content: notificationContent,
          icon: "alert-circle-outline",
        });
      }

      // Chunk and send push notifications
      let chunks = expo.chunkPushNotifications(messages);
      let tickets = [];

      for (let chunk of chunks) {
        try {
          let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          console.log("[INFO] Push notification tickets:", ticketChunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error("[ERROR] Error sending push notifications:", error);
        }
      }
    } catch (error) {
      console.error(
        "[ERROR] Failed to send user removed notifications:",
        error
      );
    }
  }
}

module.exports = new NotificationService();
