// controllers/pushTokenController.js
const Device = require('../models/device');
const { Expo } = require('expo-server-sdk');
let expo = new Expo();


class PushTokenController {
  // Register or update a device's push token
  async registerToken(req, res) {
    const userId = req.user.id;
    const {token} = req.body
    try {
      // Check if the token already exists
      let device = await Device.findOne({ where: { expoPushToken: token } });

      if (device) {
        // Update the userId if necessary
        if (device.userId !== userId) {
          device.userId = userId;
          await device.save();
        }
      } else {
        // Create a new device entry
        device = await Device.create({ userId: userId, expoPushToken: token });
      }

      return res.status(200).json({ message: 'Push token registered successfully.' });
    } catch (error) {
      console.error('[ERROR] Failed to register push token:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  }

}

module.exports = new PushTokenController();
