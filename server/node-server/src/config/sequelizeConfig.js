const { DATABASE_URL } = require('./env'); // Import your environment configuration

module.exports = {
  development: {
    url: DATABASE_URL,
    dialect: 'mysql',
  },
  test: {
    url: DATABASE_URL,
    dialect: 'mysql',
  },
  production: {
    url: DATABASE_URL,
    dialect: 'mysql',
  },
};