"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Subscriptions", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      subscriptionName: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
      meetingsNum: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1, // Ensure at least 1 meeting
        },
      },
      price: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: {
          min: 0, // Ensure non-negative price
        },
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Subscriptions");
  },
};
