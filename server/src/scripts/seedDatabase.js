// // // // const { sequelize, User, Role, Reservation, ReservationsHasUsers, AvailabilityException, AvailabilityExceptionBreaks, BusinessHour, BusinessBreakHour, Notification, RechargeCreditRequest, Subscription } = require('../models');
// // // // const { hashPassword } = require('../utils/hashUtils');

// // // // async function seedDatabase() {
// // // //   const transaction = await sequelize.transaction();

// // // //   try {
// // // //     // Create Roles
// // // //     const adminRole = await Role.create({ name: 'admin' }, { transaction });
// // // //     const userRole = await Role.create({ name: 'user' }, { transaction });

// // // //     // Create predefined users
// // // //     const predefinedUsers = [
// // // //       { username: 'admin', password: await hashPassword('Admin'), role_id: adminRole.role_id, phone_num: '1234567890', active: true, default_lang: 'EN' },
// // // //       { username: 'user', password: await hashPassword('User'), role_id: userRole.role_id, phone_num: '0987654321', active: true, default_lang: 'AR' },
// // // //       { username: 'user1', password: await hashPassword('user1'), role_id: userRole.role_id, phone_num: '1122334455', active: true, default_lang: 'HR' },
// // // //       { username: 'user2', password: await hashPassword('user2'), role_id: userRole.role_id, phone_num: '5566778899', active: true, default_lang: 'EN' },
// // // //     ];

// // // //     const users = await User.bulkCreate(predefinedUsers, { transaction });

// // // //     // Create Reservations
// // // //     const reservations = [];
// // // //     for (let i = 0; i < 10; i++) {
// // // //       reservations.push({
// // // //         date: `2024-09-${String(i + 1).padStart(2, '0')}`,
// // // //         time: `10:0${i}:00`,
// // // //       });
// // // //     }
// // // //     const createdReservations = await Reservation.bulkCreate(reservations, { transaction });

// // // //     // Create ReservationsHasUsers (Many-to-Many)
// // // //     const reservationsHasUsers = [];
// // // //     createdReservations.forEach((reservation, index) => {
// // // //       users.forEach((user) => {
// // // //         reservationsHasUsers.push({
// // // //           reservations_id: reservation.id,
// // // //           users_id: user.id,
// // // //         });
// // // //       });
// // // //     });
// // // //     await ReservationsHasUsers.bulkCreate(reservationsHasUsers, { transaction });

// // // //     // Create AvailabilityExceptions
// // // //     const availabilityExceptions = [
// // // //       {
// // // //         date: '2024-08-24',
// // // //         start_time: '09:00:00',
// // // //         end_time: '12:00:00',
// // // //         is_closed: false,
// // // //       },
// // // //       {
// // // //         date: '2024-08-25',
// // // //         start_time: '14:00:00',
// // // //         end_time: '16:00:00',
// // // //         is_closed: true,
// // // //       },
// // // //     ];
// // // //     const createdAvailabilityExceptions = await AvailabilityException.bulkCreate(availabilityExceptions, { transaction });

// // // //     // Create AvailabilityExceptionBreaks
// // // //     const availabilityExceptionBreaks = [
// // // //       {
// // // //         availability_exception_id: createdAvailabilityExceptions[0].id,
// // // //         start_time: '10:00:00',
// // // //         end_time: '10:30:00',
// // // //       },
// // // //       {
// // // //         availability_exception_id: createdAvailabilityExceptions[1].id,
// // // //         start_time: '15:00:00',
// // // //         end_time: '15:15:00',
// // // //       },
// // // //     ];
// // // //     await AvailabilityExceptionBreaks.bulkCreate(availabilityExceptionBreaks, { transaction });

// // // //     // Create BusinessHours
// // // //     const businessHours = [
// // // //       {
// // // //         day_of_week: 'Monday',
// // // //         open_time: '08:00:00',
// // // //         close_time: '18:00:00',
// // // //       },
// // // //       {
// // // //         day_of_week: 'Tuesday',
// // // //         open_time: '08:00:00',
// // // //         close_time: '18:00:00',
// // // //       },
// // // //     ];
// // // //     const createdBusinessHours = await BusinessHour.bulkCreate(businessHours, { transaction });

// // // //     // Create BusinessBreakHours
// // // //     const businessBreakHours = [
// // // //       {
// // // //         business_hour_id: createdBusinessHours[0].id,
// // // //         start_time: '12:00:00',
// // // //         end_time: '13:00:00',
// // // //       },
// // // //       {
// // // //         business_hour_id: createdBusinessHours[1].id,
// // // //         start_time: '12:00:00',
// // // //         end_time: '13:00:00',
// // // //       },
// // // //     ];
// // // //     await BusinessBreakHour.bulkCreate(businessBreakHours, { transaction });

// // // //     // Create Notifications
// // // //     const notifications = users.map((user) => ({
// // // //       user_id: user.id,
// // // //       title: 'Welcome!',
// // // //       content: `Welcome ${user.username}!`,
// // // //       icon: 'welcome.png',
// // // //     }));
// // // //     await Notification.bulkCreate(notifications, { transaction });

// // // //     // Create Subscriptions
// // // //     const subscriptions = [
// // // //       {
// // // //         meetings_num: 10,
// // // //         price: 100.0,
// // // //       },
// // // //       {
// // // //         meetings_num: 20,
// // // //         price: 180.0,
// // // //       },
// // // //     ];
// // // //     const createdSubscriptions = await Subscription.bulkCreate(subscriptions, { transaction });

// // // //     // Create RechargeCreditRequests
// // // //     const rechargeCreditRequests = users.map((user, index) => ({
// // // //       users_id: user.id,
// // // //       subscription_type: createdSubscriptions[index % createdSubscriptions.length].id,
// // // //       date: '2024-08-24',
// // // //       time: '14:00:00',
// // // //     }));
// // // //     await RechargeCreditRequest.bulkCreate(rechargeCreditRequests, { transaction });

// // // //     // Commit transaction
// // // //     await transaction.commit();
// // // //     console.log('Database seeding successful.');
// // // //   } catch (error) {
// // // //     await transaction.rollback();
// // // //     console.error('Database seeding failed: ', error);
// // // //   }
// // // // }

// // // // seedDatabase();





































// // // // const { sequelize, User, Role, Reservation, ReservationsHasUsers, AvailabilityException, AvailabilityExceptionBreaks, BusinessHour, BusinessBreakHour, Notification, RechargeCreditRequest, Subscription } = require('../models');
// // // // const { hashPassword } = require('../utils/hashUtils');
// // // // const { Op } = require('sequelize');

// // // // function getRandomInt(min, max) {
// // // //   return Math.floor(Math.random() * (max - min + 1)) + min;
// // // // }

// // // // function generateRandomDate(daysOffset = 0) {
// // // //   const date = new Date();
// // // //   date.setDate(date.getDate() + daysOffset);
// // // //   return date.toISOString().split('T')[0];
// // // // }

// // // // function generateRandomTime(startHour = 0, endHour = 23) {
// // // //   const hour = getRandomInt(startHour, endHour).toString().padStart(2, '0');
// // // //   const minute = getRandomInt(0, 59).toString().padStart(2, '0');
// // // //   const second = getRandomInt(0, 59).toString().padStart(2, '0');
// // // //   return `${hour}:${minute}:${second}`;
// // // // }

// // // // async function seedDatabase() {
// // // //   const transaction = await sequelize.transaction();

// // // //   try {
// // // //     // Create Roles
// // // //     const adminRole = await Role.create({ name: 'admin' }, { transaction });
// // // //     const userRole = await Role.create({ name: 'user' }, { transaction });

// // // //     // Create predefined users
// // // //     const predefinedUsers = [
// // // //       { username: 'admin', password: await hashPassword('Admin'), role_id: adminRole.role_id, phone_num: '1234567890', active: true, default_lang: 'EN' },
// // // //       { username: 'user', password: await hashPassword('User'), role_id: userRole.role_id, phone_num: '0987654321', active: true, default_lang: 'AR' },
// // // //       { username: 'user1', password: await hashPassword('user1'), role_id: userRole.role_id, phone_num: '1122334455', active: true, default_lang: 'HR' },
// // // //       { username: 'user2', password: await hashPassword('user2'), role_id: userRole.role_id, phone_num: '5566778899', active: true, default_lang: 'EN' },
// // // //     ];

// // // //     const users = await User.bulkCreate(predefinedUsers, { transaction });

// // // //     // Create Reservations
// // // //     const reservations = [];
// // // //     for (let i = 0; i < 20; i++) {
// // // //       reservations.push({
// // // //         date: generateRandomDate(i),
// // // //         time: generateRandomTime(9, 17),
// // // //       });
// // // //     }
// // // //     const createdReservations = await Reservation.bulkCreate(reservations, { transaction });

// // // //     // Create ReservationsHasUsers (Many-to-Many)
// // // //     const reservationsHasUsers = [];
// // // //     createdReservations.forEach((reservation) => {
// // // //       const randomUser = users[getRandomInt(0, users.length - 1)];
// // // //       reservationsHasUsers.push({
// // // //         reservations_id: reservation.id,
// // // //         users_id: randomUser.id,
// // // //       });
// // // //     });
// // // //     await ReservationsHasUsers.bulkCreate(reservationsHasUsers, { transaction });

// // // //     // Create AvailabilityExceptions
// // // //     const availabilityExceptions = [];
// // // //     for (let i = 1; i <= 5; i++) {
// // // //       availabilityExceptions.push({
// // // //         date: generateRandomDate(i),
// // // //         start_time: generateRandomTime(8, 10),
// // // //         end_time: generateRandomTime(14, 17),
// // // //         is_closed: i % 2 === 0, // Alternate between open and closed
// // // //       });
// // // //     }
// // // //     const createdAvailabilityExceptions = await AvailabilityException.bulkCreate(availabilityExceptions, { transaction });

// // // //     // Create AvailabilityExceptionBreaks
// // // //     const availabilityExceptionBreaks = [];
// // // //     createdAvailabilityExceptions.forEach((exception) => {
// // // //       if (!exception.is_closed) {
// // // //         availabilityExceptionBreaks.push({
// // // //           availability_exception_id: exception.id,
// // // //           start_time: generateRandomTime(10, 11),
// // // //           end_time: generateRandomTime(11, 12),
// // // //         });
// // // //       }
// // // //     });
// // // //     await AvailabilityExceptionBreaks.bulkCreate(availabilityExceptionBreaks, { transaction });

// // // //     // Create BusinessHours
// // // //     const businessHours = [
// // // //       'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
// // // //     ].map(day => ({
// // // //       day_of_week: day,
// // // //       open_time: '08:00:00',
// // // //       close_time: '18:00:00',
// // // //     }));
// // // //     const createdBusinessHours = await BusinessHour.bulkCreate(businessHours, { transaction });

// // // //     // Create BusinessBreakHours
// // // //     const businessBreakHours = [];
// // // //     createdBusinessHours.forEach((hour) => {
// // // //       businessBreakHours.push({
// // // //         business_hour_id: hour.id,
// // // //         start_time: '12:00:00',
// // // //         end_time: '13:00:00',
// // // //       });
// // // //       businessBreakHours.push({
// // // //         business_hour_id: hour.id,
// // // //         start_time: '15:00:00',
// // // //         end_time: '15:30:00',
// // // //       });
// // // //     });
// // // //     await BusinessBreakHour.bulkCreate(businessBreakHours, { transaction });

// // // //     // Create Notifications
// // // //     const notifications = users.map((user) => ({
// // // //       user_id: user.id,
// // // //       title: 'Welcome!',
// // // //       content: `Welcome ${user.username}!`,
// // // //       icon: 'welcome.png',
// // // //     }));
// // // //     await Notification.bulkCreate(notifications, { transaction });

// // // //     // Create Subscriptions
// // // //     const subscriptions = [
// // // //       {
// // // //         meetings_num: 10,
// // // //         price: 100.0,
// // // //       },
// // // //       {
// // // //         meetings_num: 20,
// // // //         price: 180.0,
// // // //       },
// // // //     ];
// // // //     const createdSubscriptions = await Subscription.bulkCreate(subscriptions, { transaction });

// // // //     // Create RechargeCreditRequests
// // // //     const rechargeCreditRequests = users.map((user, index) => ({
// // // //       users_id: user.id,
// // // //       subscription_type: createdSubscriptions[index % createdSubscriptions.length].id,
// // // //       date: generateRandomDate(),
// // // //       time: generateRandomTime(13, 15),
// // // //     }));
// // // //     await RechargeCreditRequest.bulkCreate(rechargeCreditRequests, { transaction });

// // // //     // Commit transaction
// // // //     await transaction.commit();
// // // //     console.log('Database seeding successful.');
// // // //   } catch (error) {
// // // //     await transaction.rollback();
// // // //     console.error('Database seeding failed: ', error);
// // // //   }
// // // // }

// // // // seedDatabase();





















// // // const { sequelize, User, Role, Reservation, ReservationsHasUsers, AvailabilityException, AvailabilityExceptionBreaks, BusinessHour, BusinessBreakHour, Notification, RechargeCreditRequest, Subscription } = require('../models');
// // // const { hashPassword } = require('../utils/hashUtils');
// // // const { Op } = require('sequelize');

// // // function getRandomInt(min, max) {
// // //   return Math.floor(Math.random() * (max - min + 1)) + min;
// // // }

// // // function generateRandomDate(daysOffset = 0) {
// // //   const date = new Date();
// // //   date.setDate(date.getDate() + daysOffset);
// // //   return date.toISOString().split('T')[0];
// // // }

// // // function generateRandomTime(startHour = 0, endHour = 23) {
// // //   const hour = getRandomInt(startHour, endHour).toString().padStart(2, '0');
// // //   const minute = (getRandomInt(0, 5) * 10).toString().padStart(2, '0');
// // //   const second = '00'; // Keep seconds at 00 for 10-minute intervals
// // //   return `${hour}:${minute}:${second}`;
// // // }

// // // async function seedDatabase() {
// // //   const transaction = await sequelize.transaction();

// // //   try {
// // //     // Create Roles
// // //     const adminRole = await Role.create({ name: 'admin' }, { transaction });
// // //     const userRole = await Role.create({ name: 'user' }, { transaction });

// // //     // Create predefined users
// // //     const predefinedUsers = [
// // //       { username: 'admin', password: await hashPassword('Admin'), role_id: adminRole.role_id, phone_num: '1234567890', active: true, default_lang: 'EN' },
// // //       { username: 'user', password: await hashPassword('User'), role_id: userRole.role_id, phone_num: '0987654321', active: true, default_lang: 'AR' },
// // //       { username: 'user1', password: await hashPassword('user1'), role_id: userRole.role_id, phone_num: '1122334455', active: true, default_lang: 'HR' },
// // //       { username: 'user2', password: await hashPassword('user2'), role_id: userRole.role_id, phone_num: '5566778899', active: true, default_lang: 'EN' },
// // //     ];

// // //     const users = await User.bulkCreate(predefinedUsers, { transaction });

// // //     // Create Reservations
// // //     const reservations = [];
// // //     for (let i = 0; i < 20; i++) {
// // //       reservations.push({
// // //         date: generateRandomDate(i),
// // //         time: generateRandomTime(9, 17),
// // //       });
// // //     }
// // //     const createdReservations = await Reservation.bulkCreate(reservations, { transaction });

// // //     // Create ReservationsHasUsers (Many-to-Many)
// // //     const reservationsHasUsers = [];

// // //     createdReservations.forEach((reservation) => {
// // //       // Determine the number of users for this reservation (between 1 and 6)
// // //       const numberOfUsers = getRandomInt(1, 6);

// // //       // Shuffle the users array and take the first `numberOfUsers` users
// // //       const selectedUsers = users.sort(() => 0.5 - Math.random()).slice(0, numberOfUsers);

// // //       // Assign these users to the current reservation
// // //       selectedUsers.forEach((user) => {
// // //         reservationsHasUsers.push({
// // //           reservations_id: reservation.id,
// // //           users_id: user.id,
// // //         });
// // //       });
// // //     });

// // //     await ReservationsHasUsers.bulkCreate(reservationsHasUsers, { transaction });

// // //     // Create AvailabilityExceptions
// // //     const availabilityExceptions = [];
// // //     for (let i = 1; i <= 5; i++) {
// // //       const availabilityException = await AvailabilityException.create({
// // //         date: generateRandomDate(i),
// // //         start_time: generateRandomTime(8, 10),
// // //         end_time: generateRandomTime(14, 17),
// // //         is_closed: i % 2 === 0, // Alternate between open and closed
// // //       }, { transaction });

// // //       if (!availabilityException.is_closed) {
// // //         // Create AvailabilityExceptionBreaks only if the exception is not fully closed
// // //         const breaks = [
// // //           {
// // //             availability_exception_id: availabilityException.id,
// // //             start_time: generateRandomTime(10, 11),
// // //             end_time: generateRandomTime(11, 12),
// // //           },
// // //           {
// // //             availability_exception_id: availabilityException.id,
// // //             start_time: generateRandomTime(13, 14),
// // //             end_time: generateRandomTime(14, 15),
// // //           },
// // //         ];
// // //         await AvailabilityExceptionBreaks.bulkCreate(breaks, { transaction });
// // //       }

// // //       availabilityExceptions.push(availabilityException);
// // //     }

// // //     // Create BusinessHours
// // //     const businessHours = [
// // //       'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
// // //     ].map(day => ({
// // //       day_of_week: day,
// // //       open_time: '08:00:00',
// // //       close_time: '18:00:00',
// // //     }));
// // //     const createdBusinessHours = await BusinessHour.bulkCreate(businessHours, { transaction });

// // //     // Create BusinessBreakHours
// // //     const businessBreakHours = [];
// // //     createdBusinessHours.forEach((hour) => {
// // //       businessBreakHours.push({
// // //         business_hour_id: hour.id,
// // //         start_time: '12:00:00',
// // //         end_time: '13:00:00',
// // //       });
// // //       businessBreakHours.push({
// // //         business_hour_id: hour.id,
// // //         start_time: '15:00:00',
// // //         end_time: '15:30:00',
// // //       });
// // //     });
// // //     await BusinessBreakHour.bulkCreate(businessBreakHours, { transaction });

// // //     // Create Notifications
// // //     const notifications = users.map((user) => ({
// // //       user_id: user.id,
// // //       title: 'Welcome!',
// // //       content: `Welcome ${user.username}!`,
// // //       icon: 'welcome.png',
// // //     }));
// // //     await Notification.bulkCreate(notifications, { transaction });

// // //     // Create Subscriptions
// // //     const subscriptions = [
// // //       {
// // //         meetings_num: 10,
// // //         subscription_name: "monthly",
// // //         price: 100.0,
// // //       },
// // //       {
// // //         meetings_num: 20,
// // //         subscription_name: "daily",
// // //         price: 180.0,
// // //       },
// // //     ];
// // //     const createdSubscriptions = await Subscription.bulkCreate(subscriptions, { transaction });

// // //     // Create RechargeCreditRequests
// // //     const rechargeCreditRequests = users.map((user, index) => ({
// // //       users_id: user.id,
// // //       subscription_type: createdSubscriptions[index % createdSubscriptions.length].id,
// // //       date: generateRandomDate(),
// // //       time: generateRandomTime(13, 15),
// // //     }));
// // //     await RechargeCreditRequest.bulkCreate(rechargeCreditRequests, { transaction });

// // //     // Commit transaction
// // //     await transaction.commit();
// // //     console.log('Database seeding successful.');
// // //   } catch (error) {
// // //     await transaction.rollback();
// // //     console.error('Database seeding failed: ', error);
// // //   }
// // // }

// // // seedDatabase();


// // const { sequelize, User, Role, Reservation, ReservationsHasUsers, AvailabilityException, AvailabilityExceptionBreaks, BusinessHour, BusinessBreakHour, Notification, RechargeCreditRequest, Subscription } = require('../models');
// // const { hashPassword } = require('../utils/hashUtils');
// // const { Op } = require('sequelize');

// // /**
// //  * Generates a random integer between min and max (inclusive)
// //  */
// // function getRandomInt(min, max) {
// //   return Math.floor(Math.random() * (max - min + 1)) + min;
// // }

// // /**
// //  * Generates a random date string with an optional offset in days
// //  */
// // function generateRandomDate(daysOffset = 0) {
// //   const date = new Date();
// //   date.setDate(date.getDate() + daysOffset);
// //   return date.toISOString().split('T')[0];
// // }

// // /**
// //  * Generates a valid time pair ensuring start_time < end_time
// //  * @param {number} startHour - Minimum hour for start_time
// //  * @param {number} endHour - Maximum hour for end_time
// //  * @param {number} minDuration - Minimum duration in minutes
// //  * @returns {Object} - { start_time: 'HH:MM:SS', end_time: 'HH:MM:SS' }
// //  */
// // function generateValidTimePair(startHour = 0, endHour = 23, minDuration = 30) {
// //   // Ensure that end_hour is at least start_hour + minDuration
// //   const possibleStartHours = [];
// //   for (let hour = startHour; hour <= endHour; hour++) {
// //     possibleStartHours.push(hour);
// //   }

// //   const startHourSelected = possibleStartHours[getRandomInt(0, possibleStartHours.length - 1)];
// //   const startMinute = getRandomInt(0, 59);
// //   const startTime = new Date();
// //   startTime.setHours(startHourSelected, startMinute, 0);

// //   // Calculate end time ensuring it's after start time by at least minDuration
// //   const endTime = new Date(startTime.getTime() + minDuration * 60000);
// //   endTime.setHours(endTime.getHours(), endTime.getMinutes(), 0);

// //   // If endTime exceeds endHour, adjust it
// //   if (endTime.getHours() > endHour || (endTime.getHours() === endHour && endTime.getMinutes() > 59)) {
// //     // Set end_time to endHour:59:00
// //     endTime.setHours(endHour, 59, 0);
// //   }

// //   // Format to 'HH:MM:SS'
// //   const formatTime = (date) => date.toTimeString().split(' ')[0];

// //   return {
// //     start_time: formatTime(startTime),
// //     end_time: formatTime(endTime),
// //   };
// // }

// // async function seedDatabase() {
// //   const transaction = await sequelize.transaction();

// //   try {
// //     // Create Roles
// //     const adminRole = await Role.create({ name: 'admin' }, { transaction });
// //     const userRole = await Role.create({ name: 'user' }, { transaction });

// //     // Create predefined users
// //     const predefinedUsers = [
// //       { username: 'admin', password: await hashPassword('Admin'), role_id: adminRole.id, phone_num: '1234567890', active: true, default_lang: 'EN' },
// //       { username: 'user', password: await hashPassword('User'), role_id: userRole.id, phone_num: '0987654321', active: true, default_lang: 'AR' },
// //       { username: 'user1', password: await hashPassword('user1'), role_id: userRole.id, phone_num: '1122334455', active: true, default_lang: 'HR' },
// //       { username: 'user2', password: await hashPassword('user2'), role_id: userRole.id, phone_num: '5566778899', active: true, default_lang: 'EN' },
// //     ];

// //     const users = await User.bulkCreate(predefinedUsers, { transaction });

// //     // Create Reservations
// //     const reservations = [];
// //     for (let i = 0; i < 20; i++) {
// //       reservations.push({
// //         date: generateRandomDate(i),
// //         time: generateValidTimePair(9, 17).start_time, // Assuming 'time' is a single time field; adjust as needed
// //       });
// //     }
// //     const createdReservations = await Reservation.bulkCreate(reservations, { transaction });

// //     // Create ReservationsHasUsers (Many-to-Many)
// //     const reservationsHasUsers = [];

// //     createdReservations.forEach((reservation) => {
// //       // Determine the number of users for this reservation (between 1 and 6)
// //       const numberOfUsers = getRandomInt(1, Math.min(6, users.length));

// //       // Shuffle the users array and take the first `numberOfUsers` users
// //       const shuffledUsers = [...users].sort(() => 0.5 - Math.random());
// //       const selectedUsers = shuffledUsers.slice(0, numberOfUsers);

// //       // Assign these users to the current reservation
// //       selectedUsers.forEach((user) => {
// //         reservationsHasUsers.push({
// //           reservations_id: reservation.id,
// //           users_id: user.id,
// //         });
// //       });
// //     });

// //     await ReservationsHasUsers.bulkCreate(reservationsHasUsers, { transaction });

// //     // Create AvailabilityExceptions
// //     const availabilityExceptions = [];
// //     for (let i = 1; i <= 5; i++) {
// //       const isClosed = i % 2 === 0; // Alternate between open and closed
// //       let availabilityData = {
// //         date: generateRandomDate(i),
// //         is_closed: isClosed,
// //       };

// //       if (!isClosed) {
// //         // Ensure start_time < end_time
// //         const { start_time, end_time } = generateValidTimePair(8, 17, 180); // At least 3 hours duration
// //         availabilityData.start_time = start_time;
// //         availabilityData.end_time = end_time;
// //       }

// //       const availabilityException = await AvailabilityException.create(availabilityData, { transaction });

// //       if (!availabilityException.is_closed) {
// //         // Create AvailabilityExceptionBreaks only if the exception is not fully closed
// //         const { start_time: break1Start, end_time: break1End } = generateValidTimePair(
// //           parseInt(availabilityException.start_time.split(':')[0]),
// //           parseInt(availabilityException.end_time.split(':')[0]),
// //           30
// //         );
// //         const { start_time: break2Start, end_time: break2End } = generateValidTimePair(
// //           parseInt(availabilityException.start_time.split(':')[0]),
// //           parseInt(availabilityException.end_time.split(':')[0]),
// //           30
// //         );

// //         const breaks = [
// //           {
// //             availability_exception_id: availabilityException.id,
// //             start_time: break1Start,
// //             end_time: break1End,
// //           },
// //           {
// //             availability_exception_id: availabilityException.id,
// //             start_time: break2Start,
// //             end_time: break2End,
// //           },
// //         ];

// //         await AvailabilityExceptionBreaks.bulkCreate(breaks, { transaction });
// //       }

// //       availabilityExceptions.push(availabilityException);
// //     }

// //     // Create BusinessHours
// //     const businessHours = [
// //       'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
// //     ].map(day => ({
// //       day_of_week: day,
// //       ...generateValidTimePair(8, 18, 30), // Ensure open_time < close_time with at least 30 minutes duration
// //     }));
// //     const createdBusinessHours = await BusinessHour.bulkCreate(businessHours, { transaction });

// //     // Create BusinessBreakHours
// //     const businessBreakHours = [];
// //     createdBusinessHours.forEach((hour) => {
// //       const { start_time: break1Start, end_time: break1End } = generateValidTimePair(
// //         parseInt(hour.open_time.split(':')[0]),
// //         parseInt(hour.close_time.split(':')[0]),
// //         30
// //       );
// //       const { start_time: break2Start, end_time: break2End } = generateValidTimePair(
// //         parseInt(hour.open_time.split(':')[0]),
// //         parseInt(hour.close_time.split(':')[0]),
// //         30
// //       );

// //       businessBreakHours.push({
// //         business_hour_id: hour.id,
// //         start_time: break1Start,
// //         end_time: break1End,
// //       });
// //       businessBreakHours.push({
// //         business_hour_id: hour.id,
// //         start_time: break2Start,
// //         end_time: break2End,
// //       });
// //     });
// //     await BusinessBreakHour.bulkCreate(businessBreakHours, { transaction });

// //     // Create Notifications
// //     const notifications = users.map((user) => ({
// //       user_id: user.id,
// //       title: 'Welcome!',
// //       content: `Welcome ${user.username}!`,
// //       icon: 'welcome.png',
// //     }));
// //     await Notification.bulkCreate(notifications, { transaction });

// //     // Create Subscriptions
// //     const subscriptions = [
// //       {
// //         meetings_num: 10,
// //         subscription_name: "monthly",
// //         price: 100.0,
// //       },
// //       {
// //         meetings_num: 20,
// //         subscription_name: "daily",
// //         price: 180.0,
// //       },
// //     ];
// //     const createdSubscriptions = await Subscription.bulkCreate(subscriptions, { transaction });

// //     // Create RechargeCreditRequests
// //     const rechargeCreditRequests = users.map((user, index) => ({
// //       users_id: user.id,
// //       subscription_type: createdSubscriptions[index % createdSubscriptions.length].id,
// //       date: generateRandomDate(),
// //       time: generateValidTimePair(13, 15).start_time,
// //     }));
// //     await RechargeCreditRequest.bulkCreate(rechargeCreditRequests, { transaction });

// //     // Commit transaction
// //     await transaction.commit();
// //     console.log('Database seeding successful.');
// //   } catch (error) {
// //     await transaction.rollback();
// //     console.error('Database seeding failed: ', error);
// //   }
// // }

// // seedDatabase();


// // src/scripts/seedDatabase.js

// const {
//   sequelize,
//   User,
//   Role,
//   Reservation,
//   ReservationsHasUsers,
//   AvailabilityException,
//   AvailabilityExceptionBreaks,
//   BusinessHour,
//   BusinessBreakHour,
//   Notification,
//   RechargeCreditRequest,
//   Subscription,
// } = require('../models/index');
// const { hashPassword } = require('../utils/hashUtils'); // Ensure this utility exists and works correctly

// /**
//  * Generates a random integer between min and max (inclusive)
//  */
// function getRandomInt(min, max) {
//   return Math.floor(Math.random() * (max - min + 1)) + min;
// }

// /**
//  * Generates a random date string with an optional offset in days
//  */
// function generateRandomDate(daysOffset = 0) {
//   const date = new Date();
//   date.setDate(date.getDate() + daysOffset);
//   return date.toISOString().split('T')[0]; // Returns 'YYYY-MM-DD'
// }

// /**
//  * Generates a valid time pair ensuring start_time < end_time
//  * @param {number} startHour - Minimum hour for start_time (0-23)
//  * @param {number} endHour - Maximum hour for end_time (0-23)
//  * @param {number} minDuration - Minimum duration in minutes between start_time and end_time
//  * @returns {Object} - { start_time: 'HH:MM:SS', end_time: 'HH:MM:SS' }
//  */
// function generateValidTimePair(startHour = 0, endHour = 23, minDuration = 30) {
//   // Ensure that end_hour is at least start_hour + minDuration
//   const possibleStartHours = [];
//   for (let hour = startHour; hour <= endHour; hour++) {
//     possibleStartHours.push(hour);
//   }

//   const startHourSelected = possibleStartHours[getRandomInt(0, possibleStartHours.length - 1)];
//   const startMinute = getRandomInt(0, 59);
//   const startTime = new Date();
//   startTime.setHours(startHourSelected, startMinute, 0);

//   // Calculate end time ensuring it's after start time by at least minDuration
//   const endTime = new Date(startTime.getTime() + minDuration * 60000);
//   endTime.setHours(endTime.getHours(), endTime.getMinutes(), 0);

//   // If endTime exceeds endHour, adjust it to be within bounds
//   if (endTime.getHours() > endHour || (endTime.getHours() === endHour && endTime.getMinutes() > 59)) {
//     // Set end_time to endHour:59:00
//     endTime.setHours(endHour, 59, 0);
//   }

//   // Format to 'HH:MM:SS'
//   const formatTime = (date) => date.toTimeString().split(' ')[0];

//   return {
//     start_time: formatTime(startTime),
//     end_time: formatTime(endTime),
//   };
// }

// async function seedDatabase() {
//   const transaction = await sequelize.transaction();

//   try {
//     // 1. Create Roles
//     const adminRole = await Role.create({ name: 'admin' }, { transaction });
//     const userRole = await Role.create({ name: 'user' }, { transaction });

//     // 2. Create Predefined Users
//     const predefinedUsers = [
//       {
//         username: 'admin',
//         password: await hashPassword('Admin'),
//         role_id: adminRole.id, // Corrected from role_id to id
//         phone_num: '1234567890',
//         active: true,
//         default_lang: 'EN',
//       },
//       {
//         username: 'user',
//         password: await hashPassword('User'),
//         role_id: userRole.id,
//         phone_num: '0987654321',
//         active: true,
//         default_lang: 'AR',
//       },
//       {
//         username: 'user1',
//         password: await hashPassword('user1'),
//         role_id: userRole.id,
//         phone_num: '1122334455',
//         active: true,
//         default_lang: 'HR',
//       },
//       {
//         username: 'user2',
//         password: await hashPassword('user2'),
//         role_id: userRole.id,
//         phone_num: '5566778899',
//         active: true,
//         default_lang: 'EN',
//       },
//     ];

//     const users = await User.bulkCreate(predefinedUsers, { transaction });

//     // 3. Create Reservations
//     const reservations = [];
//     for (let i = 0; i < 20; i++) {
//       const { start_time, end_time } = generateValidTimePair(9, 17, 30); // 9 AM to 5 PM with at least 30 minutes
//       reservations.push({
//         date: generateRandomDate(i), // Spread reservations over the next 20 days
//         time: start_time, // Assuming 'time' is a single time field; adjust if necessary
//       });
//     }
//     const createdReservations = await Reservation.bulkCreate(reservations, { transaction });

//     // 4. Associate Users with Reservations (Many-to-Many)
//     const reservationsHasUsers = [];

//     createdReservations.forEach((reservation) => {
//       // Determine the number of users for this reservation (between 1 and 4)
//       const numberOfUsers = getRandomInt(1, Math.min(4, users.length));

//       // Shuffle the users array and take the first `numberOfUsers` users
//       const shuffledUsers = [...users].sort(() => 0.5 - Math.random());
//       const selectedUsers = shuffledUsers.slice(0, numberOfUsers);

//       // Assign these users to the current reservation
//       selectedUsers.forEach((user) => {
//         reservationsHasUsers.push({
//           reservations_id: reservation.id,
//           users_id: user.id,
//         });
//       });
//     });

//     await ReservationsHasUsers.bulkCreate(reservationsHasUsers, { transaction });

//     // 5. Create Subscriptions
//     const subscriptions = [
//       {
//         subscription_name: 'Monthly',
//         meetings_num: 10,
//         price: 100.0,
//         active: true,
//       },
//       {
//         subscription_name: 'Daily',
//         meetings_num: 20,
//         price: 180.0,
//         active: true,
//       },
//       {
//         subscription_name: 'Weekly',
//         meetings_num: 5,
//         price: 50.0,
//         active: true,
//       },
//     ];
//     const createdSubscriptions = await Subscription.bulkCreate(subscriptions, { transaction });

//     // 6. Create RechargeCreditRequests
//     const rechargeCreditRequests = users.map((user, index) => ({
//       users_id: user.id,
//       subscription_type: createdSubscriptions[index % createdSubscriptions.length].id, // Assign subscriptions in a round-robin fashion
//       date: generateRandomDate(getRandomInt(0, 10)), // Random date within next 10 days
//       time: generateValidTimePair(10, 16, 30).start_time, // Random time between 10 AM and 4 PM
//       status: 'pending', // Default status
//     }));
//     await RechargeCreditRequest.bulkCreate(rechargeCreditRequests, { transaction });

//     // 7. Create BusinessHours
//     const businessDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
//     const businessHours = businessDays.map((day) => ({
//       day_of_week: day,
//       ...generateValidTimePair(8, 18, 480), // 8 AM to 6 PM with at least 8 hours duration
//     }));
//     const createdBusinessHours = await BusinessHour.bulkCreate(businessHours, { transaction });

//     // 8. Create BusinessBreakHours
//     const businessBreakHours = [];
//     createdBusinessHours.forEach((hour) => {
//       // Create two breaks per business hour
//       const { start_time: break1Start, end_time: break1End } = generateValidTimePair(
//         parseInt(hour.open_time.split(':')[0]),
//         parseInt(hour.close_time.split(':')[0]),
//         30
//       );
//       const { start_time: break2Start, end_time: break2End } = generateValidTimePair(
//         parseInt(hour.open_time.split(':')[0]),
//         parseInt(hour.close_time.split(':')[0]),
//         30
//       );

//       businessBreakHours.push({
//         business_hour_id: hour.id,
//         start_time: break1Start,
//         end_time: break1End,
//       });
//       businessBreakHours.push({
//         business_hour_id: hour.id,
//         start_time: break2Start,
//         end_time: break2End,
//       });
//     });
//     await BusinessBreakHour.bulkCreate(businessBreakHours, { transaction });

//     // 9. Create AvailabilityExceptions
//     const availabilityExceptions = [];
//     for (let i = 1; i <= 5; i++) {
//       const isClosed = i % 2 === 0; // Alternate between open and closed
//       let availabilityData = {
//         date: generateRandomDate(i), // Spread exceptions over the next 5 days
//         is_closed: isClosed,
//       };

//       if (!isClosed) {
//         // Ensure start_time < end_time
//         const { start_time, end_time } = generateValidTimePair(8, 17, 180); // At least 3 hours duration
//         availabilityData.start_time = start_time;
//         availabilityData.end_time = end_time;
//       }

//       const availabilityException = await AvailabilityException.create(availabilityData, { transaction });

//       if (!availabilityException.is_closed) {
//         // Create AvailabilityExceptionBreaks only if the exception is not fully closed
//         const { start_time: break1Start, end_time: break1End } = generateValidTimePair(
//           parseInt(availabilityException.start_time.split(':')[0]),
//           parseInt(availabilityException.end_time.split(':')[0]),
//           30
//         );
//         const { start_time: break2Start, end_time: break2End } = generateValidTimePair(
//           parseInt(availabilityException.start_time.split(':')[0]),
//           parseInt(availabilityException.end_time.split(':')[0]),
//           30
//         );

//         const breaks = [
//           {
//             availability_exception_id: availabilityException.id,
//             start_time: break1Start,
//             end_time: break1End,
//           },
//           {
//             availability_exception_id: availabilityException.id,
//             start_time: break2Start,
//             end_time: break2End,
//           },
//         ];

//         await AvailabilityExceptionBreaks.bulkCreate(breaks, { transaction });
//       }

//       availabilityExceptions.push(availabilityException);
//     }

//     // 10. Create Notifications
//     const notifications = users.map((user) => ({
//       user_id: user.id,
//       title: 'Welcome!',
//       content: `Welcome ${user.username}! Thank you for joining us.`,
//       icon: 'welcome.png',
//       read: false,
//       createdAt: new Date(),
//     }));
//     await Notification.bulkCreate(notifications, { transaction });

//     // 11. Commit Transaction
//     await transaction.commit();
//     console.log('Database seeding successful.');
//   } catch (error) {
//     await transaction.rollback();
//     console.error('Database seeding failed:', error);
//   }
// }

// seedDatabase();


// src/scripts/seedDatabase.js

const {
  sequelize,
  User,
  Role,
  Reservation,
  ReservationsHasUsers,
  AvailabilityException,
  AvailabilityExceptionBreaks,
  BusinessHour,
  BusinessBreakHour,
  Notification,
  RechargeCreditRequest,
  Subscription,
} = require('../models');
const { hashPassword } = require('../utils/hashUtils'); // Ensure this utility exists and works correctly
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
  return date.toTimeString().split(' ')[0];
}

/**
 * Generates a valid time pair ensuring start_time < end_time
 * @param {number} startHour - Minimum hour for start_time (0-23)
 * @param {number} endHour - Maximum hour for end_time (0-23)
 * @param {number} minDuration - Minimum duration in minutes between start_time and end_time
 * @returns {Object} - { start_time: 'HH:MM:SS', end_time: 'HH:MM:SS' }
 */
function generateValidTimePair(startHour = 0, endHour = 23, minDuration = 10) {
  // Generate start time
  const startHourSelected = getRandomInt(startHour, endHour);
  const startMinute = getRandomInt(0, 59);
  const startTime = new Date();
  startTime.setHours(startHourSelected, startMinute, 0);

  // Generate end time ensuring it's after start time by at least minDuration
  const endTime = new Date(startTime.getTime() + minDuration * 60000);

  // If endTime exceeds endHour, adjust it to be within bounds
  if (endTime.getHours() > endHour || (endTime.getHours() === endHour && endTime.getMinutes() > 59)) {
    endTime.setHours(endHour, 59, 0);
  }

  return {
    start_time: formatTime(startTime),
    end_time: formatTime(endTime),
  };
}

/**
 * Generates all 10-minute increment time slots between open and close times, excluding breaks
 * @param {string} open_time - 'HH:MM:SS'
 * @param {string} close_time - 'HH:MM:SS'
 * @param {Array} breaks - Array of break objects with start_time and end_time
 * @returns {Array} - Array of available time slot start_times
 */
function generateTimeSlots(open_time, close_time, breaks = []) {
  const slots = [];
  let current = new Date(`1970-01-01T${open_time}`);
  const end = new Date(`1970-01-01T${close_time}`);

  while (current < end) {
    const slotStart = new Date(current);
    const slotEnd = new Date(current.getTime() + 10 * 60000); // 10-minute slots

    // Check if slot overlaps with any break
    const overlapsBreak = breaks.some((brk) => {
      const breakStart = new Date(`1970-01-01T${brk.start_time}`);
      const breakEnd = new Date(`1970-01-01T${brk.end_time}`);
      return slotStart < breakEnd && slotEnd > breakStart;
    });

    if (!overlapsBreak && slotEnd <= end) {
      slots.push(formatTime(slotStart));
    }

    // Increment by 10 minutes
    current.setMinutes(current.getMinutes() + 10);
  }

  return slots;
}

async function seedDatabase() {
  const transaction = await sequelize.transaction();

  try {
    // 1. Create Roles
    const adminRole = await Role.create({ name: 'admin' }, { transaction });
    const userRole = await Role.create({ name: 'user' }, { transaction });

    // 2. Create Users (Adding more users with easy passwords)
    const predefinedUsers = [];
    const numAdditionalUsers = 20; // Total users: 4 predefined + 20 = 24

    // Predefined Users
    predefinedUsers.push({
      username: 'admin',
      password: await hashPassword('Admin'),
      role_id: adminRole.role_id,
      phone_num: '1234567890',
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
      password: await hashPassword('User1'),
      role_id: userRole.role_id,
      phone_num: '1122334455',
      active: true,
      default_lang: 'HE',
      credits: 30,
    });
    predefinedUsers.push({
      username: 'user2',
      password: await hashPassword('User2'),
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

    const users = await User.bulkCreate(predefinedUsers, { transaction });

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
    const createdSubscriptions = await Subscription.bulkCreate(subscriptions, { transaction });

    // 4. Create RechargeCreditRequests
    const rechargeCreditRequests = users.map((user, index) => ({
      users_id: user.id,
      subscription_type: createdSubscriptions[index % createdSubscriptions.length].id, // Round-robin
      date: generateRandomDate(getRandomInt(0, 10)), // Within next 10 days
      time: generateValidTimePair(10, 16, 10).start_time, // 10 AM to 4 PM
      status: 'pending',
    }));
    await RechargeCreditRequest.bulkCreate(rechargeCreditRequests, { transaction });

    // 5. Create BusinessHours
    const businessDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const businessHours = businessDays.map((day) => {
      const { start_time, end_time } = generateValidTimePair(8, 18, 480); // 8 AM to 6 PM, 8 hours
      return {
        day_of_week: day,
        open_time: start_time,
        close_time: end_time,
      };
    });
    const createdBusinessHours = await BusinessHour.bulkCreate(businessHours, { transaction });

    // 6. Create BusinessBreakHours
    const businessBreakHours = [];
    createdBusinessHours.forEach((hour) => {
      // Create two 30-minute breaks per business hour
      const break1 = generateValidTimePair(
        parseInt(hour.open_time.split(':')[0]),
        parseInt(hour.close_time.split(':')[0]),
        30
      );
      const break2 = generateValidTimePair(
        parseInt(hour.open_time.split(':')[0]),
        parseInt(hour.close_time.split(':')[0]),
        30
      );

      businessBreakHours.push({
        business_hour_id: hour.id,
        start_time: break1.start_time,
        end_time: break1.end_time,
      });
      businessBreakHours.push({
        business_hour_id: hour.id,
        start_time: break2.start_time,
        end_time: break2.end_time,
      });
    });
    await BusinessBreakHour.bulkCreate(businessBreakHours, { transaction });

    // 7. Create AvailabilityExceptions
    const availabilityExceptions = [
      // Example: Closed on Sunday
      {
        date: generateRandomDate(getRandomInt(7, 14)), // Within next two weeks
        is_closed: true,
      },
      // Example: Half-day open with breaks
      {
        date: generateRandomDate(getRandomInt(0, 7)),
        is_closed: false,
        start_time: '09:00:00',
        end_time: '13:00:00',
      },
      // Add more exceptions as needed
    ];

    const createdAvailabilityExceptions = await AvailabilityException.bulkCreate(availabilityExceptions, { transaction });

    // 8. Create AvailabilityExceptionBreaks
    const availabilityExceptionBreaks = [];
    createdAvailabilityExceptions.forEach((exception) => {
      if (!exception.is_closed) {
        // Create two 30-minute breaks within availability exception
        const break1 = generateValidTimePair(
          parseInt(exception.start_time.split(':')[0]),
          parseInt(exception.end_time.split(':')[0]),
          30
        );
        const break2 = generateValidTimePair(
          parseInt(exception.start_time.split(':')[0]),
          parseInt(exception.end_time.split(':')[0]),
          30
        );

        availabilityExceptionBreaks.push({
          availability_exception_id: exception.id,
          start_time: break1.start_time,
          end_time: break1.end_time,
        });
        availabilityExceptionBreaks.push({
          availability_exception_id: exception.id,
          start_time: break2.start_time,
          end_time: break2.end_time,
        });
      }
    });
    await AvailabilityExceptionBreaks.bulkCreate(availabilityExceptionBreaks, { transaction });

    // 9. Generate Reservations for the Next 7 Days
    const totalDaysToSeed = 7;
    const reservationsToCreate = [];

    for (let dayOffset = 0; dayOffset < totalDaysToSeed; dayOffset++) {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + dayOffset);
      const dateStr = currentDate.toISOString().split('T')[0]; // 'YYYY-MM-DD'
      const dayOfWeek = currentDate.toLocaleString('en-US', { weekday: 'long' });

      // Check for AvailabilityException
      const exception = createdAvailabilityExceptions.find((ex) => ex.date === dateStr);

      let openTime, closeTime, breaks = [];

      if (exception) {
        if (exception.is_closed) {
          // No reservations on closed days
          continue;
        } else {
          openTime = exception.start_time;
          closeTime = exception.end_time;
          // Get breaks from AvailabilityExceptionBreaks
          const exceptionBreaks = availabilityExceptionBreaks.filter(
            (brk) => brk.availability_exception_id === exception.id
          );
          breaks = exceptionBreaks.map((brk) => ({
            start_time: brk.start_time,
            end_time: brk.end_time,
          }));
        }
      } else {
        // Use BusinessHour
        const businessHour = createdBusinessHours.find((bh) => bh.day_of_week === dayOfWeek);
        if (!businessHour) {
          // No business hours defined for this day (e.g., weekend)
          continue;
        }
        openTime = businessHour.open_time;
        closeTime = businessHour.close_time;
        // Get breaks from BusinessBreakHour
        const businessBreaks = businessBreakHours.filter(
          (brk) => brk.business_hour_id === businessHour.id
        );
        breaks = businessBreaks.map((brk) => ({
          start_time: brk.start_time,
          end_time: brk.end_time,
        }));
      }

      // Generate available time slots
      const availableSlots = generateTimeSlots(openTime, closeTime, breaks);

      // Shuffle users to randomize assignment
      const shuffledUsers = [...users].sort(() => 0.5 - Math.random());

      availableSlots.forEach((slot) => {
        const numReservations = getRandomInt(1, 6); // Up to 6 people per slot
        const assignedUsers = shuffledUsers.slice(0, numReservations);

        // Create Reservation
        reservationsToCreate.push({
          date: dateStr,
          time: slot,
        });

        // Associate Users with Reservation
        // Note: We'll handle Associations after creating all reservations
      });
    }

    // Bulk create Reservations
    const createdReservationsList = await Reservation.bulkCreate(reservationsToCreate, { transaction });

    // Now associate users with reservations
    const reservationsHasUsersToCreate = [];

    createdReservationsList.forEach((reservation, index) => {
      // Retrieve the corresponding slot's assigned users
      const slotIndex = index;
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

    // 10. Create Notifications
    const notifications = users.map((user) => ({
      user_id: user.id,
      title: 'Welcome!',
      content: `Welcome ${user.username}! Thank you for joining us.`,
      icon: 'welcome.png',
      read: false,
      createdAt: new Date(),
    }));
    await Notification.bulkCreate(notifications, { transaction });

    // 11. Commit Transaction
    await transaction.commit();
    console.log('Database seeding successful.');
  } catch (error) {
    await transaction.rollback();
    console.error('Database seeding failed:', error);
  }
}

seedDatabase();