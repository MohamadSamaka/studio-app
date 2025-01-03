"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Devices", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      expoPushToken: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users", // Matches the table name for Users
          key: "id",
        },
        onDelete: "CASCADE", // Ensures devices are removed when a user is deleted
        onUpdate: "CASCADE",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        onUpdate: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Add an index on userId for efficient lookups
    await queryInterface.addIndex("Devices", ["userId"]);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the index
    await queryInterface.removeIndex("Devices", ["userId"]);

    // Drop the table
    await queryInterface.dropTable("Devices");
  },
};
