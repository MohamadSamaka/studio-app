// const { Model, DataTypes } = require('sequelize');
// const sequelize = require('../config/database');

// class BusinessHour extends Model { }

// BusinessHour.init({
//     id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//     },
//     day_of_week: {
//         type: DataTypes.ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
//         allowNull: false,
//         unique: true,
//     },
//     open_time: {
//         type: DataTypes.TIME,
//         allowNull: false,
//     },
//     close_time: {
//         type: DataTypes.TIME,
//         allowNull: false,
//     }
// }, {
//     sequelize,
//     modelName: 'BusinessHour',
//     timestamps: false,
// });

// BusinessHour.associate = (models) => {
//     BusinessHour.hasMany(models.BusinessBreakHour, {
//         foreignKey: 'business_hour_id',
//         as: 'breaks'
//     });
// };

// module.exports = BusinessHour;

const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class BusinessHour extends Model {}

BusinessHour.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    day_of_week: {
        type: DataTypes.ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
        allowNull: false,
        unique: true,
    },
    open_time: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    close_time: {
        type: DataTypes.TIME,
        allowNull: false,
    }
}, {
    sequelize,
    modelName: 'BusinessHour',
    timestamps: false,
    validate: {
        openTimeBeforeCloseTime() {
            const openTime = new Date(`1970-01-01T${this.open_time}`);
            const closeTime = new Date(`1970-01-01T${this.close_time}`);
            if (openTime >= closeTime) {
                throw new Error('Open time must be earlier than close time.');
            }
        }
    }
});

BusinessHour.associate = (models) => {
    BusinessHour.hasMany(models.BusinessBreakHour, {
        foreignKey: 'business_hour_id',
        as: 'breaks'
    });
};

module.exports = BusinessHour;
