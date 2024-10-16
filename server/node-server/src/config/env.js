if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
  }
  
  const configManager = require('../utils/configManager');
  
  // Load the configuration from the JSON file
  configManager.loadConfig();
  
  // Fetch the loaded configuration
  const CONFIG = configManager.getConfig();
  const RESERVATIONS_CONFIG = CONFIG.reservations;
  
  // Construct DATABASE_URL if not provided
  let DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    const dbUser = process.env.DB_USER;
    const dbPassword = process.env.DB_PASSWORD;
    const dbHost = process.env.DB_HOST;
    const dbName = process.env.DB_NAME;
    if (dbUser && dbPassword && dbHost && dbName) {
      DATABASE_URL = `mysql://${dbUser}:${dbPassword}@${dbHost}:3306/${dbName}`;
    } else {
      throw new Error('Database configuration is missing. Please provide DATABASE_URL or DB_USER, DB_PASSWORD, DB_HOST, and DB_NAME.');
    }
  }
  
  module.exports = {
    DATABASE_URL,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || "",
    PASSWORD_HASHING_SEED: Number(process.env.PASSWORD_HASHING_SEED),
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || "",
    TOKEN_EXPIRATION: process.env.TOKEN_EXPIRATION || "1h",
    REFRESH_TOKEN_EXPIRATION: process.env.REFRESH_TOKEN_EXPIRATION || "7d",
  
    // Merge environment variables with JSON config values (give precedence to environment variables)
    RESERVATIONS_CANCELLATION_REFUND_THRESHOLD_TIME:
      process.env.RESERVATIONS_CANCELLATION_REFUND_THRESHOLD_TIME ||
      RESERVATIONS_CONFIG['cancelation-refund-threshold-time'],
    RESERVATIONS_MAX_USERS_PER_RESERVATION:
      process.env.RESERVATIONS_MAX_USERS_PER_RESERVATION ||
      RESERVATIONS_CONFIG['max-users-per-reservation'],
    RESERVATIONS_TIMESLOTS_DURATION:
      process.env.RESERVATIONS_TIMESLOTS_DURATION ||
      RESERVATIONS_CONFIG['timeslots-duration'],
  };
  