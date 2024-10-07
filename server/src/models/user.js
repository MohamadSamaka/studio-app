// const { DataTypes, Model } = require('sequelize');
// const sequelize = require('../config/database');

// const Role = require('./role');

// class User extends Model {}

// User.init({
//   id: {
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     primaryKey: true,
//   },
//   username: {
//     type: DataTypes.STRING,
//     unique: true,
//     allowNull: false,
//   },
//   password: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   role_id: { // Corrected reference
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//       model: Role,
//       key: 'role_id', // Changed from 'id' to 'role_id'
//     },
//     onDelete: 'CASCADE',
//     onUpdate: 'CASCADE',
//   },
//   token: {
//     type: DataTypes.STRING,
//     allowNull: true,
//   },
//   refreshToken: {
//     type: DataTypes.STRING,
//     allowNull: true,
//   },
//   active: {
//     type: DataTypes.BOOLEAN,
//     allowNull: false,
//   },
//   default_lang: {
//     type: DataTypes.ENUM('AR', 'EN', 'HE'),
//     defaultValue: 'EN',
//   },
//   phone_num: {
//     type: DataTypes.STRING,
//     unique: true,
//     allowNull: false,
//   },
//   credits: {
//     type: DataTypes.INTEGER,
//     defaultValue: 0,
//   },
// }, {
//   sequelize,
//   modelName: 'User',
//   timestamps: false,
// });

// User.belongsTo(Role, { foreignKey: 'role_id' });

// module.exports = User;



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
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role_id: { // Corrected reference
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Role,
        key: 'role_id',
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
    },
    default_lang: {
      type: DataTypes.ENUM('AR', 'EN', 'HE'),
      defaultValue: 'EN',
    },
    phone_num: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    credits: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'User',
    timestamps: false,
    defaultScope: {
      attributes: { exclude: ['token', 'refreshToken'] }, // Exclude sensitive fields by default
    },
  }
);

// Define associations
User.belongsTo(Role, { foreignKey: 'role_id' });
Role.hasMany(User, { foreignKey: 'role_id' });

module.exports = User;
