const sequelize = require("../config/database");
const User = require("./user");
const Role = require("./role");
const AvailableReservations = require("./availableReservations");
const ReservationsHasUsers = require("./reservationsHasUsers");
const ReservationsGhosts = require("./reservationsGhosts");
const Subscription = require("./subscription");
const RechargeCreditRequest = require("./rechargeCreditRequest");
const Notification = require("./notification");
const Device = require("./device");

// User-Role: One-to-Many relationship
Role.hasMany(User, {
  foreignKey: "roleId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
User.belongsTo(Role, { foreignKey: "roleId" });

// User-AvailableReservations: One-to-Many relationship (Trainer)
User.hasMany(AvailableReservations, {
  foreignKey: "trainerId",
  as: "TrainedReservations",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
AvailableReservations.belongsTo(User, {
  foreignKey: "trainerId",
  as: "Trainer",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// User-ReservationsHasUsers: Many-to-Many relationship
User.belongsToMany(AvailableReservations, {
  through: ReservationsHasUsers,
  foreignKey: "userId",
  as: "Reservations",
});
AvailableReservations.belongsToMany(User, {
  through: ReservationsHasUsers,
  foreignKey: "reservationId",
  as: "Participants",
});

// AvailableReservations-ReservationsGhosts: One-to-Many relationship
AvailableReservations.hasMany(ReservationsGhosts, {
  foreignKey: "reservationId",
  as: "GhostLogs",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
ReservationsGhosts.belongsTo(AvailableReservations, {
  foreignKey: "reservationId",
  as: "Reservation",
});

// User-ReservationsGhosts: One-to-Many relationship
User.hasMany(ReservationsGhosts, {
  foreignKey: "userId",
  as: "GhostEntries",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
ReservationsGhosts.belongsTo(User, { foreignKey: "userId", as: "User" });

// User-RechargeCreditRequest: One-to-Many relationship
User.hasMany(RechargeCreditRequest, {
  foreignKey: "userId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
RechargeCreditRequest.belongsTo(User, { foreignKey: "userId" });

// Subscription-RechargeCreditRequest: One-to-Many relationship
Subscription.hasMany(RechargeCreditRequest, {
  foreignKey: "subscriptionTypeId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
RechargeCreditRequest.belongsTo(Subscription, {
  foreignKey: "subscriptionTypeId",
});

// User-Notification: One-to-Many relationship
User.hasMany(Notification, {
  foreignKey: "userId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Notification.belongsTo(User, { foreignKey: "userId" });

// User-Device: One-to-Many relationship
User.hasMany(Device, {
  foreignKey: "userId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Device.belongsTo(User, { foreignKey: "userId" });

// Export models and sequelize instance
module.exports = {
  sequelize,
  User,
  Role,
  AvailableReservations,
  ReservationsHasUsers,
  ReservationsGhosts,
  Subscription,
  RechargeCreditRequest,
  Notification,
  Device,
};
