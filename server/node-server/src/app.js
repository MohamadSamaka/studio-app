const express = require("express");
const cors = require("cors"); // Import the cors package

// Import your route handlers
const adminConfigRoutes = require("./routes/api/admin/configRoutes");
const userConfigRoutes = require("./routes/api/user/configRoutes");
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

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:8081', // Replace with your frontend's origin if different
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-refresh-token'],
  credentials: true, // Allow cookies and authentication headers
};

// Use CORS middleware before defining routes
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(express.json());

// Public routes
app.use("/api/auth", authRoutes);

// Admin routes (require authentication and admin check)
app.use("/api/admin", authenticateToken, checkAdmin);
app.use("/api/admin/roles", roleRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/reservations", adminReservationRoutes);
app.use("/api/admin/subscriptions", adminSubscriptionRoutes);
app.use("/api/admin/recharge-credit-requests", adminRechargeCreditRequestRoutes);
app.use("/api/admin/config", adminConfigRoutes);

// User routes (require authentication)
app.use("/api/user", authenticateToken);
app.use("/api/user", userUserRoutes);
app.use("/api/user/reservations", userReservationRoutes);
app.use("/api/user/subscriptions", userSubscriptionRoutes);
app.use("/api/user/recharge-credit-requests", userRechargeCreditRequestRoutes);
app.use("/api/user/config", userConfigRoutes);

// Export the app instance for use in index.js
module.exports = app;
