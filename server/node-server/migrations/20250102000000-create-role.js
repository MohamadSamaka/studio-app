"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Roles", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Roles");
  },
};
