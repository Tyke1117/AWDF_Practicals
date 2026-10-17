require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const cacheRoutes = require("./routes/cacheRoutes");

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

// Compatibility aliases
app.use("/tasks", taskRoutes);
app.use("/cache", cacheRoutes);

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Practical 9: Task Management API with In-Memory Caching (node-cache)",
    ttl: process.env.CACHE_TTL ? `${process.env.CACHE_TTL}s` : "60s",
    endpoints: {
      auth: "/api/auth (login, register, me)",
      tasks: "/api/tasks (GET, POST, PUT, DELETE)",
      cacheStats: "GET /api/cache/stats",
      cacheFlush: "POST /api/cache/flush"
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
  console.log(`[Server] Practical 9 backend running on http://localhost:${PORT}`);
  console.log(`[Cache] node-cache initialized with stdTTL: ${process.env.CACHE_TTL || 60} seconds`);
});

module.exports = app;
