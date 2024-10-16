const { sequelize } = require('../models');

async function dropAllTables() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // Drop all tables
    await sequelize.drop();
    console.log('All tables have been dropped successfully.');
  } catch (error) {
    console.error('Unable to connect to the database or drop tables:', error);
  } finally {
    await sequelize.close();
    console.log('Connection closed.');
  }
}

dropAllTables();
