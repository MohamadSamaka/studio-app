const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class RechargeCreditRequest extends Model {}

RechargeCreditRequest.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    subscriptionTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false,
      defaultValue: () => {
        const now = new Date();
        return now.toTimeString().split(" ")[0]; // Format: "HH:mm:ss"
      },
    },
    status: {
      type: DataTypes.ENUM("pending", "awaiting_payment", "success", "failed"),
      allowNull: false,
      defaultValue: "pending",
    },
  },
  {
    sequelize,
    tableName: "RechargeCreditRequests",
    modelName: "RechargeCreditRequest",
    timestamps: false,
    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["subscriptionTypeId"],
      },
    ],
  }
);

module.exports = RechargeCreditRequest;
