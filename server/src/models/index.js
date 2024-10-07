const sequelize = require('../config/database');
const User = require('./user');
const AvailableReservations = require('./availableReservations');
const ReservationsHasUsers = require('./reservationsHasUsers');
const Role = require('./role');
const Subscription = require('./subscription');
const RechargeCreditRequest = require('./rechargeCreditRequest');
const Notification = require('./notification');
const Device = require('./device');

// Many-to-Many relationship between Users and AvailableReservations through ReservationsHasUsers
User.belongsToMany(AvailableReservations, { 
  through: ReservationsHasUsers, 
  foreignKey: 'users_id', 
  as: 'Reservations' 
});
AvailableReservations.belongsToMany(User, { 
  through: ReservationsHasUsers, 
  foreignKey: 'reservations_id', 
  as: 'Participants' 
});

// One-to-Many relationship: User (Trainer) has many AvailableReservations
AvailableReservations.belongsTo(User, {
  foreignKey: 'trainer_id',
  as: 'Trainer',
  onDelete: 'SET NULL', // Set to NULL if the trainer is deleted
  onUpdate: 'CASCADE',
});

User.hasMany(AvailableReservations, { 
  foreignKey: 'trainer_id', 
  as: 'TrainedReservations' 
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

// User has many Notifications (One-to-Many)
User.hasMany(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

// Device belongs to User
Device.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Device, { foreignKey: 'user_id' });

// Sync database (optional, ensure migrations are used instead in production)
// sequelize.sync();

module.exports = {
  sequelize,
  User,
  AvailableReservations,
  ReservationsHasUsers,
  Role,
  Subscription,
  RechargeCreditRequest,
  Notification,
  Device,
};
