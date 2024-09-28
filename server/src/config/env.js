require('dotenv').config(); // Load the default .env file
const configManager = require('../utils/configManager');

// Load the configuration from the JSON file
configManager.loadConfig();

// Fetch the loaded configuration
const CONFIG = configManager.getConfig();
const RESERVATIONS_CONFIG = CONFIG.reservations;

// Export merged configurations with preference given to .env variables
module.exports = {
    DATABASE_URL: process.env.DATABASE_URL,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || "",
    PASSWORD_HASHING_SEED: Number(process.env.PASSWORD_HASHING_SEED),
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || "",
    TOKEN_EXPIRATION: process.env.TOKEN_EXPIRATION || "1h",
    REFRESH_TOKEN_EXPIRATION: process.env.REFRESH_TOKEN_EXPIRATION || "7d",

    // Merge .env variables with JSON config values (give precedence to .env)
    RESERVATIONS_CANCELLATION_REFUND_THRESHOLD_TIME: RESERVATIONS_CONFIG['cancelation-refund-threshold-time'],
    RESERVATIONS_MAX_USERS_PER_RESERVATION: RESERVATIONS_CONFIG['max-users-per-reservation'],
    RESERVATIONS_TIMESLOTS_DURATION: RESERVATIONS_CONFIG['timeslots-duration']
};
