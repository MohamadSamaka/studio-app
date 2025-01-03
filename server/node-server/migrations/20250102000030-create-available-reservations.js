"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("AvailableReservations", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      trainerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users", // Matches the table name for Users
          key: "id",
        },
        onDelete: "CASCADE", // Ensures reservations are removed if the trainer is deleted
        onUpdate: "CASCADE",
      },
      duration: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      maxParticipants: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        defaultValue: 6,
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      startTime: {
        type: Sequelize.TIME,
        allowNull: false,
      },
    });

    // Add a unique index for date, startTime, and trainerId
    await queryInterface.addIndex("AvailableReservations", {
      fields: ["date", "startTime", "trainerId"],
      unique: true,
      name: "unique_date_startTime_trainerId",
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the unique index
    await queryInterface.removeIndex(
      "AvailableReservations",
      "unique_date_startTime_trainerId"
    );

    // Drop the table
    await queryInterface.dropTable("AvailableReservations");
  },
};
