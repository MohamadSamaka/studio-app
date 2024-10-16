// scripts/migrate.js
const { sequelize } = require('../models/index'); // Adjust the path if necessary

async function migrate() {
  try {
    await sequelize.sync({ alter: true }); // Sync models with the database, adjusting tables as necessary
    console.log('Database migrated successfully.');
  } catch (error) {
    console.error('Error migrating database:', error);
  } finally {
    await sequelize.close();
  }
}

migrate();
