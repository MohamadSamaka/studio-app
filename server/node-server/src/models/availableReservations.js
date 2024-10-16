const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");
const { trimString } = require("../utils/helpers");
const moment = require("moment");
const User = require("./user"); // Import the User model for associations


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
        // Trim title to 100 characters
        this.setDataValue("title", trimString(value));
      },
    },
    trainer_id: {
      type: DataTypes.INTEGER,
      allowNull: false, // Set to true if a reservation can exist without a trainer
      references: {
        model: User, // Ensure this matches the table name of the User model
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    duration: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    max_participants: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: 6,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    duration: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    max_participants: {
      type: DataTypes.INTEGER.UNSIGNED, // Specify UNSIGNED here
      allowNull: true,
      defaultValue: 6,
    },
  },
  {
    sequelize,
    modelName: "AvailableReservations",
    timestamps: false,
    indexes: [{ unique: true, fields: ["date", "start_time"] }], // Ensures no duplicate date/time slots
    hooks: {
      beforeValidate: (reservation) => {
        const currentDateTime = moment();
        const reservationDateTime = moment(
          `${reservation.date} ${reservation.start_time}`,
          "YYYY-MM-DD HH:mm:ss"
        );
        const duration = moment(
          `${reservation.date} ${reservation.end_time}`,
          "YYYY-MM-DD HH:mm:ss"
        );

        if (
          !/^(2[0-3]|[01]?[0-9]):[0-5]?[0-9]:[0-5]?[0-9]$/.test(
            reservation.start_time
          ) ||
          !/^(2[0-3]|[01]?[0-9]):[0-5]?[0-9]:[0-5]?[0-9]$/.test(
            reservation.duration
          )
        ) {
          throw new Error(
            "Invalid time format. Use HH:mm:ss in 24-hour format."
          );
        }
        if (
          !reservationDateTime.isValid() ||
          !duration.isValid()
        ) {
          throw new Error("Invalid date or duration.");
        }

        // Check if reservation start time is in the future
        if (reservationDateTime.isBefore(currentDateTime)) {
          throw new Error("Reservation start time must be in the future.");
        }
      },
    },
  }
);

module.exports = AvailableReservations;
