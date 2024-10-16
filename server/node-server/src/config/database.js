const { Sequelize } = require('sequelize');
const { DATABASE_URL } = require('./env');

// Check if DATABASE_URL is defined in your environment variables
if (!DATABASE_URL) {
  throw new Error(
    'DATABASE_URL environment variable is not defined, given current DATABASE_URL: ',
    DATABASE_URL
  );
}

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'mysql',
  logging: false, // Disable logging; set to console.log to enable
  pool: {
    max: 20, // Increase the pool size to allow more concurrent connections
    min: 0,
    acquire: 60000, // Increase the acquire timeout to 60 seconds
    idle: 10000,
  },
});

module.exports = sequelize;
