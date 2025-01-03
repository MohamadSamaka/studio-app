const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");
const AvailableReservations = require("./availableReservations");
const User = require("./user");

class ReservationsGhosts extends Model {}

ReservationsGhosts.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    reservationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: AvailableReservations,
        key: "id",
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    cancellationTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    punished: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "reservationsghosts",
    modelName: "ReservationsGhosts",
    timestamps: false,
  }
);

module.exports = ReservationsGhosts;
