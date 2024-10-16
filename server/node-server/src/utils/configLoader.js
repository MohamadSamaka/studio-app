const fs = require('fs');
const path = require('path');

// Define the path to the config.json file
const configPath = path.resolve(__dirname, '../../../frontend_backend_shared.json');

let configData;
try {
    const configFile = fs.readFileSync(configPath, 'utf-8');
    configData = JSON.parse(configFile);
} catch (err) {
    console.error(`Error reading or parsing config.json: ${err.message}`);
    configData = {};
}

// Fallback to default values if not found in the JSON file
module.exports = {
    RESERVATIONS_CANCELLATION_REFUND_THRESHOLD_TIME: configData.reservations?.['cancelation-refund-threshold-time'] || "6:00",
    RESERVATIONS_MAX_USERS_PER_RESERVATION: configData.reservations?.['max-users-per-reservation'] || 6,
    RESERVATIONS_TIMESLOTS_DURATION: configData.reservations?.['timeslots-duration'] || "1:30"
};
