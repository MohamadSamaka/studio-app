const {
  sequelize,
  User,
  Role,
  AvailableReservations,
  ReservationsHasUsers,
  Notification,
  RechargeCreditRequest,
  Subscription,
} = require('../models');
const { hashPassword } = require('../utils/hashUtils'); // Ensure this utility exists and works correctly
const { trimString } = require("../utils/helpers"); // Ensure this utility exists and works correctly
const moment = require("moment");

/**
 * Generates a random integer between min and max (inclusive)
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a random date string with an optional offset in days
 */
function generateRandomDate(daysOffset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0]; // Returns 'YYYY-MM-DD'
}

/**
 * Converts a Date object to 'HH:MM:SS' format
 */
function formatTime(date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

async function seedDatabase() {
  const transaction = await sequelize.transaction();

  try {
    // 1. Create Roles
    const [adminRole, trainerRole, userRole] = await Role.bulkCreate(
      [
        { name: 'admin' },
        { name: 'trainer' },
        { name: 'user' },
      ],
      { transaction, returning: true }
    );

    // 2. Create Users (Adding more users with easy passwords)
    const predefinedUsers = [];
    const numAdditionalUsers = 20; // Total users: 5 predefined + 20 = 25

    // Predefined Users
    predefinedUsers.push({
      username: 'admin',
      password: await hashPassword('Admin'), // Use a secure password
      role_id: adminRole.role_id,
      phone_num: '1234567890',
      active: true,
      default_lang: 'EN',
      credits: 100,
    });

    predefinedUsers.push({
      username: 'trainer',
      password: await hashPassword('Trainer'),
      role_id: trainerRole.role_id,
      phone_num: '1234562929',
      active: true,
      default_lang: 'EN',
      credits: 100,
    });

    predefinedUsers.push({
      username: 'user',
      password: await hashPassword('User'),
      role_id: userRole.role_id,
      phone_num: '0987654321',
      active: true,
      default_lang: 'AR',
      credits: 50,
    });

    predefinedUsers.push({
      username: 'user1',
      password: await hashPassword('User1Pass'),
      role_id: userRole.role_id,
      phone_num: '1122334455',
      active: true,
      default_lang: 'HE',
      credits: 30,
    });

    predefinedUsers.push({
      username: 'user2',
      password: await hashPassword('User2Pass'),
      role_id: userRole.role_id,
      phone_num: '5566778899',
      active: true,
      default_lang: 'EN',
      credits: 20,
    });

    // Additional Users
    for (let i = 3; i < numAdditionalUsers + 4; i++) {
      predefinedUsers.push({
        username: `user${i}`,
        password: await hashPassword(`password${i}`),
        role_id: userRole.role_id,
        phone_num: `555000${i.toString().padStart(4, '0')}`,
        active: true,
        default_lang: 'EN',
        credits: getRandomInt(10, 100),
      });
    }

    const users = await User.bulkCreate(predefinedUsers, { transaction, returning: true });

    // 3. Create Subscriptions
    const subscriptions = [
      {
        subscription_name: 'Monthly',
        meetings_num: 10,
        price: 100.0,
        active: true,
      },
      {
        subscription_name: 'Daily',
        meetings_num: 20,
        price: 180.0,
        active: true,
      },
      {
        subscription_name: 'Weekly',
        meetings_num: 5,
        price: 50.0,
        active: true,
      },
    ];
    const createdSubscriptions = await Subscription.bulkCreate(subscriptions, { transaction, returning: true });

    // 4. Create RechargeCreditRequests
    const rechargeCreditRequests = users.map((user, index) => ({
      users_id: user.id,
      subscription_type: createdSubscriptions[index % createdSubscriptions.length].id, // Round-robin
      date: generateRandomDate(getRandomInt(0, 10)), // Within next 10 days
      time: "00:00:00", // Placeholder, adjust as needed or remove if not used
      status: 'pending',
    }));
    await RechargeCreditRequest.bulkCreate(rechargeCreditRequests, { transaction });

    // 5. Create AvailableReservations with trainer_id
    const levels = ["Beginner", "Advanced"];
    const reservationsToCreate = [
      {
        date: "2024-10-10",
        title: trimString(levels[getRandomInt(0, levels.length - 1)]), // Ensure title is trimmed
        start_time: "09:00:00",
        duration: "01:30:00",
        trainer_id: users.find(u => u.role_id === trainerRole.role_id).id, // Assign first trainer
        max_participants: 6,
      },
      {
        date: "2024-10-10",
        title: trimString(levels[getRandomInt(0, levels.length - 1)]),
        start_time: "10:20:00",
        duration: "01:30:00",
        trainer_id: users.find(u => u.role_id === trainerRole.role_id).id, // Assign first trainer
        max_participants: 6,
      },
      {
        date: "2024-10-11",
        title: trimString(levels[getRandomInt(0, levels.length - 1)]),
        start_time: "09:00:00",
        duration: "01:30:00",
        trainer_id: users.find(u => u.role_id === trainerRole.role_id).id, // Assign first trainer
        max_participants: 6,
      },
      {
        date: "2024-10-11",
        title: trimString(levels[getRandomInt(0, levels.length - 1)]),
        start_time: "10:20:00",
        duration: "01:30:00",
        trainer_id: users.find(u => u.role_id === trainerRole.role_id).id, // Assign first trainer
        max_participants: 6,
      },
    ];

    // Alternatively, if you have multiple trainers, assign randomly
    const trainerUsers = users.filter(u => u.role_id === trainerRole.role_id);
    function getRandomTrainer() {
      return trainerUsers[getRandomInt(0, trainerUsers.length - 1)];
    }

    // Update reservationsToCreate to assign random trainers
    const reservationsToCreateWithTrainers = reservationsToCreate.map(reservation => ({
      ...reservation,
      trainer_id: getRandomTrainer().id,
    }));

    // Bulk create Reservations
    const createdReservationsList = await AvailableReservations.bulkCreate(reservationsToCreateWithTrainers, { transaction, returning: true });

    // 6. Associate Users with Reservations (Many-to-Many)
    const reservationsHasUsersToCreate = [];

    createdReservationsList.forEach((reservation) => {
      // Retrieve the corresponding slot's assigned users
      const numUsers = getRandomInt(1, 6);
      const selectedUsers = users.sort(() => 0.5 - Math.random()).slice(0, numUsers);

      selectedUsers.forEach((user) => {
        reservationsHasUsersToCreate.push({
          reservations_id: reservation.id,
          users_id: user.id,
        });
      });
    });

    await ReservationsHasUsers.bulkCreate(reservationsHasUsersToCreate, { transaction });

    // 7. Create Notifications
    const notifications = users.map((user) => ({
      user_id: user.id,
      title: 'Welcome!',
      content: `Welcome ${user.username}! Thank you for joining us.`,
      icon: 'welcome.png',
      read: false,
      createdAt: new Date(),
    }));
    await Notification.bulkCreate(notifications, { transaction });

    // 8. Commit Transaction
    await transaction.commit();
    console.log('Database seeding successful.');
  } catch (error) {
    await transaction.rollback();
    console.error('Database seeding failed:', error);
  }
}

seedDatabase();
