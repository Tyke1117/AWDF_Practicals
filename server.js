require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const taskRoutes = require("./routes/taskRoutes");
const cache = require("./config/cache");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Core Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// Serve static frontend testing dashboard
app.use(express.static(path.join(__dirname, "public")));

// API Information Root Route
app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Practical 9: In-Memory Caching and Query Optimization API",
    cachingEngine: "node-cache",
    ttl: process.env.CACHE_TTL ? `${process.env.CACHE_TTL}s` : "60s",
    endpoints: {
      getAllTasks: "GET /tasks (or /api/tasks)",
      getTaskById: "GET /tasks/:id (or /api/tasks/:id)",
      createTask: "POST /tasks (or /api/tasks)",
      updateTask: "PUT /tasks/:id (or /api/tasks/:id)",
      deleteTask: "DELETE /tasks/:id (or /api/tasks/:id)",
      cacheStats: "GET /tasks/cache/stats (or /api/cache/stats)",
      clearCache: "POST /tasks/cache/clear"
    }
  });
});

// Mount Routes (supporting both /tasks and /api/tasks paths)
app.use("/tasks", taskRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/cache/stats", (req, res) => {
  res.status(200).json({ success: true, data: cache.getDetailedStats() });
});

// 404 Route Not Found Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`[Server] Practical 9 backend running on http://localhost:${PORT}`);
  console.log(`[Cache] node-cache active with default TTL: ${process.env.CACHE_TTL || 60} seconds`);
});

// Graceful process handling
process.on("unhandledRejection", (err) => {
  console.error(`[Unhandled Rejection] ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
