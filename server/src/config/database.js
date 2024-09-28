const { Sequelize } = require('sequelize');
const { DATABASE_URL} = require('../config/env');

// require('dotenv').config(); // This will automatically look for the .env file in the current directory

// Check if DATABASE_URL is defined in your environment variables
// const databaseUrl = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not defined');
}

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'mysql',
  // logging: console.log, // Enable logging to monitor query execution
  logging: false, // Enable logging to monitor query execution

  pool: {
    max: 20, // Increase the pool size to allow more concurrent connections
    min: 0,
    acquire: 60000, // Increase the acquire timeout to 60 seconds
    idle: 10000,
  },
});


module.exports = sequelize;