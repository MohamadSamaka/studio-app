const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const Role = require('./role');

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Role,
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    defaultLang: {
      type: DataTypes.ENUM('AR', 'EN', 'HE'),
      defaultValue: 'EN',
    },
    phoneNum: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isNumeric: true,
      },
    },
    credits: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
  },
  {
    sequelize,
    tableName:"users",
    modelName: 'User',
    timestamps: false,
    defaultScope: {
      attributes: { exclude: ['token', 'refreshToken'] }, // Exclude sensitive fields by default
    },
    scopes: {
      withTokens: {
        attributes: { include: ['token', 'refreshToken'] }, // Include sensitive fields if needed
      },
    },
  }
);

module.exports = User;
