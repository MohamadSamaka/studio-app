'use strict';

const { hashPassword } = require("../src/utils/hashUtils");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Users",
      [
        {
          username: 'admin',
          password: await hashPassword('Admin'), // Use a secure password
          roleId: 1,
          phoneNum: '1234567890',
          active: true,
          defaultLang: 'EN',
          credits: 100,
        },
        {
          username: 'trainer',
          password: await hashPassword('Trainer'),
          roleId: 2,
          phoneNum: '1234562929',
          active: true,
          defaultLang: 'EN',
          credits: 100,
        },
        {
          username: 'user',
          password: await hashPassword('User'),
          roleId: 3,
          phoneNum: '0987654321',
          active: true,
          defaultLang: 'AR',
          credits: 50,
        }
      ],
      {}
    );
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
