const { sequelize } = require('../models');
const { exec } = require('child_process');
const path = require('path');

async function dropAllTables() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // Drop all tables
    await sequelize.drop();
    console.log('All tables have been dropped successfully.');
  } catch (error) {
    console.error('Unable to connect to the database or drop tables:', error);
    throw error;
  }
}

async function runMigrations() {
  return new Promise((resolve, reject) => {
    const migrateScript = path.resolve(__dirname, '../migrations/migrate.js');
    exec(`node ${migrateScript}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Migration failed: ${stderr}`);
        reject(error);
      } else {
        console.log(`Migration output:\n${stdout}`);
        resolve();
      }
    });
  });
}

async function seedDatabase() {
  return new Promise((resolve, reject) => {
    const seedScript = path.resolve(__dirname, './seedDatabase.js');
    exec(`node ${seedScript}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Seeding failed: ${stderr}`);
        reject(error);
      } else {
        console.log(`Seeding output:\n${stdout}`);
        resolve();
      }
    });
  });
}

async function dropMigrateSeed() {
  try {
    console.log('Starting drop-migrate-seed process...');

    // Step 1: Drop all tables
    await dropAllTables();

    // Step 2: Run migrations
    await runMigrations();

    // Step 3: Seed database
    await seedDatabase();

    console.log('Drop-migrate-seed process completed successfully.');
  } catch (error) {
    console.error('Drop-migrate-seed process failed:', error);
  } finally {
    await sequelize.close();
    console.log('Connection closed.');
  }
}

dropMigrateSeed();

