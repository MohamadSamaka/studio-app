const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Role extends Model {}



Role.init({
  role_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Role',
  timestamps: false,
});

module.exports = Role;
