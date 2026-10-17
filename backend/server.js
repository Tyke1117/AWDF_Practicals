require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const taskRoutes = require("./routes/taskRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB using container service name
connectDB();

// Core middleware
app.use(cors());
app.use(express.json());
app.use(logger);

// Root route - Service diagnostic info
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    service: "Practical 11 - Task Management Backend API",
    containerized: true,
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "GET /health",
      tasks: "GET /api/tasks (or /tasks)",
      createTask: "POST /api/tasks (or /tasks)",
      updateTask: "PUT /api/tasks/:id (or /tasks/:id)",
      deleteTask: "DELETE /api/tasks/:id (or /tasks/:id)"
    }
  });
});

// Container Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Mount routes at both /api/tasks and /tasks for client flexibility
app.use("/api/tasks", taskRoutes);
app.use("/tasks", taskRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use(errorHandler);

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`[Server] Practical 11 Express Backend running on port ${PORT}`);
  console.log(`[Server] Accessible at http://localhost:${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.error(`[Unhandled Rejection] ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
