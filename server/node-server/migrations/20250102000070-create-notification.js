"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Notifications", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users", // Matches the table name for Users
          key: "id",
        },
        onDelete: "CASCADE", // Ensures notifications are removed when a user is deleted
        onUpdate: "CASCADE",
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      content: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      icon: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      read: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add an index on userId for efficient lookups
    await queryInterface.addIndex("Notifications", ["userId"]);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the index
    await queryInterface.removeIndex("Notifications", ["userId"]);

    // Drop the table
    await queryInterface.dropTable("Notifications");
  },
};
