const {
  sequelize,
  User,
  Role,
} = require('../models');
const { hashPassword } = require('../utils/hashUtils'); // Ensure this utility exists and works correctly

async function seedDatabase() {
  const transaction = await sequelize.transaction();

  try {
    // 1. Create Roles
    const [adminRole, trainerRole, userRole] = await Role.bulkCreate(
      [{ name: "admin" }, { name: "trainer" }, { name: "user" }],
      { transaction, returning: true }
    );

    // 2. Create Users (Adding more users with easy passwords)
    const predefinedUsers = [];

    // Predefined Users
    predefinedUsers.push({
      username: "admin",
      password: await hashPassword("Admin"), // Use a secure password
      role_id: adminRole.role_id,
      phone_num: "1234567890",
      active: true,
      default_lang: "EN",
      credits: 0,
    });

    predefinedUsers.push({
      username: "trainer",
      password: await hashPassword("Trainer"),
      role_id: trainerRole.role_id,
      phone_num: "1234562929",
      active: true,
      default_lang: "EN",
      credits: 0,
    });

    await User.bulkCreate(predefinedUsers, {
      transaction,
      returning: true,
    });
    await transaction.commit();
    console.log('Database seeding successful.');
  } catch (error) {
    await transaction.rollback();
    console.error("Database seeding failed:", error);
  }
}


seedDatabase()