const configManager = require('../utils/configManager');
const {broadcastConfigUpdate} = require('../utils/websocket');

// Controller to handle config.json operations
class ConfigController {
  // GET: Fetch the current config (from in-memory config)
  getConfig(req, res) {
    try {
      const config = configManager.getConfig();
      return res.status(200).json(config);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  updateConfig(req, res) {
    const newConfig = req.body;
    try {
      // Update the configuration in-memory and in the file
      configManager.updateConfig(newConfig);
      
      const updatedConfig = configManager.getConfig(); // Fetch updated config

      console.log('notifictying: ', req.user.id)
      // Broadcast the updated config to all WebSocket clients
      broadcastConfigUpdate(req.user.id, updatedConfig);
      
      return res.status(200).json({ message: 'Config updated successfully', updatedConfig });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ConfigController();
