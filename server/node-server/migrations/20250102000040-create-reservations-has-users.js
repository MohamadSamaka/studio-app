"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("ReservationsHasUsers", {
      reservationId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: "AvailableReservations", // Matches the table name for AvailableReservations
          key: "id",
        },
        onDelete: "CASCADE", // Ensures entries are removed when a reservation is deleted
        onUpdate: "CASCADE",
      },
      userId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: "Users", // Matches the table name for Users
          key: "id",
        },
        onDelete: "CASCADE", // Ensures entries are removed when a user is deleted
        onUpdate: "CASCADE",
      },
    });

    // Add a unique constraint for the combination of reservationId and userId
    await queryInterface.addConstraint("ReservationsHasUsers", {
      fields: ["reservationId", "userId"],
      type: "unique",
      name: "unique_reservation_user",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("ReservationsHasUsers");
  },
};
