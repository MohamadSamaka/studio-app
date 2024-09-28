const fs = require('fs');
const path = require('path');

// Path to the config file
const configPath = path.resolve(__dirname, '../config/config.json');

// In-memory configuration object
let configData = {};

// Load config from file initially
const loadConfig = () => {
  try {
    const fileContent = fs.readFileSync(configPath, 'utf-8');
    configData = JSON.parse(fileContent);
    console.log('Configuration loaded:', configData);
  } catch (err) {
    console.error('Failed to load configuration:', err.message);
  }
};

// Save config to file and update in-memory object
const updateConfig = (newConfig) => {
  try {
    // Merge new config with current config
    configData = {
      ...configData,
      reservations: {
        ...configData.reservations,
        ...newConfig.reservations,
      },
    };

    // Write updated config to the file
    fs.writeFileSync(configPath, JSON.stringify(configData, null, 2), 'utf-8');
    console.log('Configuration updated:', configData);
  } catch (err) {
    console.error('Failed to update configuration:', err.message);
  }
};

// Get the in-memory config
const getConfig = () => configData;

module.exports = {
  loadConfig,
  updateConfig,
  getConfig,
};
