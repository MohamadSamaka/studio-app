const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");
const AvailableReservations = require("./availableReservations");
const User = require("./user");

class ReservationsHasUsers extends Model {}

ReservationsHasUsers.init(
  {
    reservationId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: AvailableReservations,
        key: "id",
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: User,
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "ReservationsHasUsers",
    modelName: "ReservationsHasUsers",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["reservationId", "userId"],
      },
    ],
  }
);

module.exports = ReservationsHasUsers;
