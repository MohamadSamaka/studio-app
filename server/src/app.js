const express = require("express");
const adminConfigRoutes = require("./routes/api/admin/configRoutes"); // Admin and user config routes
const userConfigRoutes = require("./routes/api/user/configRoutes"); // Admin and user config routes
const roleRoutes = require("./routes/api/admin/roleRoutes");
const adminUserRoutes = require("./routes/api/admin/userRoutes");
const adminSubscriptionRoutes = require("./routes/api/admin/subscriptionRoutes");
const userSubscriptionRoutes = require("./routes/api/user/subscriptionRoutes");
const authRoutes = require("./routes/api/inCommon/authRoutes");
const adminRechargeCreditRequestRoutes = require("./routes/api/admin/rechargeCreditRequestRoutes");
const userRechargeCreditRequestRoutes = require("./routes/api/user/rechargeCreditRequestRoutes");
const userReservationRoutes = require("./routes/api/user/reservationRoutes");
const adminReservationRoutes = require("./routes/api/admin/reservationRoutes");
const userUserRoutes = require("./routes/api/user/userRoutes");

const {
  authenticateToken,
  checkAdmin,
} = require("./middleware/authMiddleware");

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);

// Admin routes (for modifying the config)
app.use("/api/admin", authenticateToken, checkAdmin);
app.use("/api/admin/roles", roleRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/reservations", adminReservationRoutes);
app.use("/api/admin/subscriptions", adminSubscriptionRoutes);
app.use(
  "/api/admin/recharge-credit-requests",
  adminRechargeCreditRequestRoutes
);

// Admin-specific config routes (modification allowed)
app.use("/api/admin/config", adminConfigRoutes); // Allows GET and PUT for admins

// User routes (for viewing the config)
app.use("/api/user", authenticateToken);
app.use("/api/user", userUserRoutes);
app.use("/api/user/reservations", userReservationRoutes);
app.use("/api/user/subscriptions", userSubscriptionRoutes);
app.use("/api/user/recharge-credit-requests", userRechargeCreditRequestRoutes);
app.use("/api/user/config", userConfigRoutes); // Allows GET and PUT for admins

// Export the app instance for use in index.js
module.exports = app;
