"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("reservationsghosts", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      reservationId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "availablereservations", // Matches the table name for AvailableReservations
          key: "id",
        },
        onDelete: "SET NULL", // Allows the reservation to be removed while retaining the ghost log
        onUpdate: "CASCADE",
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users", // Matches the table name for Users
          key: "id",
        },
        onDelete: "CASCADE", // Ensures ghost logs are removed when a user is deleted
        onUpdate: "CASCADE",
      },
      cancellationTime: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      punished: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("reservationsghosts");
  },
};
