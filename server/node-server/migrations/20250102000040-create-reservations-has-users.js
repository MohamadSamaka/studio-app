"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("reservationshasusers", {
      reservationId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: "availablereservations", // Matches the table name for availablereservations
          key: "id",
        },
        onDelete: "CASCADE", // Ensures entries are removed when a reservation is deleted
        onUpdate: "CASCADE",
      },
      userId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: "users", // Matches the table name for Users
          key: "id",
        },
        onDelete: "CASCADE", // Ensures entries are removed when a user is deleted
        onUpdate: "CASCADE",
      },
    });

    // Add a unique constraint for the combination of reservationId and userId
    await queryInterface.addConstraint("reservationshasusers", {
      fields: ["reservationId", "userId"],
      type: "unique",
      name: "unique_reservation_user",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("reservationshasusers");
  },
};
