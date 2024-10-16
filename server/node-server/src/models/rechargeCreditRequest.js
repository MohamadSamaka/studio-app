const { Model, DataTypes } = require('sequelize');

const sequelize = require('../config/database');

class RechargeCreditRequest extends Model { }

RechargeCreditRequest.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    users_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    subscription_type: {
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
        defaultValue: () => new Date().toLocaleTimeString('en-GB', { hour12: false }),
    },
    status: {
        type: DataTypes.ENUM('pending', 'awaiting_payment', 'success', 'failed'),
        allowNull: false,
        defaultValue: 'pending', // Default to pending
    },
}, {
    sequelize,
    modelName: 'RechargeCreditRequest',
    timestamps: false,
    indexes: [
        {
            fields: ['users_id'],
            // name: "fk_recharge_credit_requests_users1_idx"
        },
        {
            fields: ['subscription_type'],
            // name: "fk_recharge_credit_requests_subscriptions1_idx"
        },
    ],
});

module.exports = RechargeCreditRequest;