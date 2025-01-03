const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class Subscription extends Model {}

Subscription.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    subscriptionName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    meetingsNum: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1, // Minimum number of meetings must be 1
      },
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0, // Price must be non-negative
      },
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "subscriptions",
    modelName: "Subscription",
    timestamps: false, // No timestamps needed for static subscription data
  }
);

module.exports = Subscription;
