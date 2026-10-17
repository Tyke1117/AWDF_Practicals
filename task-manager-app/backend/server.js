require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");

// IMPORTANT: Register Event Listeners at server startup before handling requests
require("./events/taskListeners");

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const cacheRoutes = require("./routes/cacheRoutes");
const eventRoutes = require("./routes/eventRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Core Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// Mount API Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/cache", cacheRoutes);
app.use("/api/events", eventRoutes);

// Compatibility aliases
app.use("/tasks", taskRoutes);
app.use("/cache", cacheRoutes);
app.use("/events", eventRoutes);

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    practical: "Practical 10: Asynchronous Processing with Event-Driven Architecture",
    architecture: "Native Node.js EventEmitter without external dependencies",
    endpoints: {
      auth: "/api/auth (login, register, me)",
      tasks: "/api/tasks (GET, POST, PUT, DELETE)",
      events: "/api/events/activity (GET live feed, POST test-error)",
      cacheStats: "/api/cache/stats"
    }
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Error Handler
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`[Server] Practical 10 backend running on http://localhost:${PORT}`);
  console.log(`[Events] TaskEvents initialized and listeners active.`);
});

module.exports = app;
