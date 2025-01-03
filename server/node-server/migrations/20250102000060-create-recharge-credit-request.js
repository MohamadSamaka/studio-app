"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("rechargecreditrequests", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      subscriptionTypeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "subscriptions",
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
    await queryInterface.addIndex("rechargecreditrequests", ["userId"]);
    await queryInterface.addIndex("rechargecreditrequests", [
      "subscriptionTypeId",
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes
    await queryInterface.removeIndex("rechargecreditrequests", ["userId"]);
    await queryInterface.removeIndex("rechargecreditrequests", [
      "subscriptionTypeId",
    ]);

    // Drop table
    await queryInterface.dropTable("rechargecreditrequests");
  },
};
