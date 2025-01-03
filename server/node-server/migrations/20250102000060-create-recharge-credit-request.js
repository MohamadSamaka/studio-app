"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("RechargeCreditRequests", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      subscriptionTypeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Subscriptions",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      time: {
        type: Sequelize.TIME,
        allowNull: false, // Remove default value
      },
      status: {
        type: Sequelize.ENUM("pending", "awaiting_payment", "success", "failed"),
        allowNull: false,
        defaultValue: "pending",
      },
    });

    // Add indexes for optimization
    await queryInterface.addIndex("RechargeCreditRequests", ["userId"]);
    await queryInterface.addIndex("RechargeCreditRequests", [
      "subscriptionTypeId",
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes
    await queryInterface.removeIndex("RechargeCreditRequests", ["userId"]);
    await queryInterface.removeIndex("RechargeCreditRequests", [
      "subscriptionTypeId",
    ]);

    // Drop table
    await queryInterface.dropTable("RechargeCreditRequests");
  },
};
