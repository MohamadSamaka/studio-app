const sequelize = require('../config/database');
const User = require('./user');
const Reservation = require('./reservation');
const ReservationsHasUsers = require('./reservationsHasUsers');
const Role = require('./role');
const Subscription = require('./subscription');
const RechargeCreditRequest = require('./rechargeCreditRequest');
const BusinessHour = require('./businessHour');
const BusinessBreakHour = require('./businessBreakHour');
const AvailabilityException = require('./availabilityException');
const AvailabilityExceptionBreaks = require('./availabilityExceptionBreaks');
const Notification = require('./notification');
const Device = require('./device');


// Many-to-Many relationship between Users and Reservations through ReservationsHasUsers
User.belongsToMany(Reservation, { through: ReservationsHasUsers, foreignKey: 'users_id' });
Reservation.belongsToMany(User, { through: ReservationsHasUsers, foreignKey: 'reservations_id' });
Reservation.belongsToMany(User, { 
  through: ReservationsHasUsers, 
  foreignKey: 'reservations_id',
  as: 'CurrentUser'
});

// Role has many Users (One-to-Many)
Role.hasMany(User, { foreignKey: 'role_id' });
User.belongsTo(Role, { foreignKey: 'role_id' });

// Subscription has many RechargeCreditRequest (One-to-Many)
Subscription.hasMany(RechargeCreditRequest, { foreignKey: 'subscription_type' });
RechargeCreditRequest.belongsTo(Subscription, { foreignKey: 'subscription_type', allowNull: false });

// User has many RechargeCreditRequest (One-to-Many)
User.hasMany(RechargeCreditRequest, { foreignKey: 'users_id' });
RechargeCreditRequest.belongsTo(User, { foreignKey: 'users_id' });

// BusinessHour has many BusinessBreakHour (One-to-Many)
BusinessHour.hasMany(BusinessBreakHour, { 
  foreignKey: 'business_hour_id',
  as: 'breaks', // Alias for the relation
});
BusinessBreakHour.belongsTo(BusinessHour, { foreignKey: 'business_hour_id' });

// AvailabilityException has many AvailabilityExceptionBreaks (One-to-Many)
AvailabilityException.hasMany(AvailabilityExceptionBreaks, {
  foreignKey: 'availability_exception_id',
  as: 'AvailabilityExceptionBreaks',
});
AvailabilityExceptionBreaks.belongsTo(AvailabilityException, { foreignKey: 'availability_exception_id', allowNull: false });

// User has many Notifications (One-to-Many)
User.hasMany(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(User, { foreignKey: 'user_id' });



Device.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Device, { foreignKey: 'user_id' });


// Sync database
// sequelize.sync();

module.exports = {
  sequelize,
  User,
  Reservation,
  ReservationsHasUsers,
  Role,
  Subscription,
  RechargeCreditRequest,
  BusinessHour,
  BusinessBreakHour,
  AvailabilityException,
  AvailabilityExceptionBreaks,
  Notification,
};
