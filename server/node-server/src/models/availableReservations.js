const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");
const { trimString } = require("../utils/helpers");
const moment = require("moment");
const User = require("./user");

class AvailableReservations extends Model {}

AvailableReservations.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue("title", trimString(value, 100)); // Trim title to max 100 characters
      },
    },
    trainerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    duration: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    maxParticipants: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: 6,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "AvailableReservations",
    modelName: "AvailableReservations",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["date", "startTime", "trainerId"],
      },
    ],
    hooks: {
      beforeValidate: (reservation) => {
        const currentDateTime = moment();
        const reservationDateTime = moment(
          `${reservation.date} ${reservation.startTime}`,
          "YYYY-MM-DD HH:mm:ss"
        );

        if (!reservationDateTime.isValid()) {
          throw new Error("Invalid date or start time.");
        }

        if (reservationDateTime.isBefore(currentDateTime)) {
          throw new Error("Reservation start time must be in the future.");
        }
      },
    },
  }
);

module.exports = AvailableReservations;
