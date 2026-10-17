require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const taskRoutes = require("./routes/taskRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Step 1: Install and configure CORS on the Express backend
app.use(cors());
app.use(express.json());
app.use(logger);

// Root route info
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Practical 6 Task Manager API (Express + MongoDB)",
    version: "1.0.0",
    endpoints: {
      getTasks: "GET /api/tasks (or /tasks)",
      createTask: "POST /api/tasks (or /tasks)",
      updateTask: "PUT /api/tasks/:id (or /tasks/:id)",
      deleteTask: "DELETE /api/tasks/:id (or /tasks/:id)"
    }
  });
});

// Mount routes at both /api/tasks and /tasks for maximum client compatibility
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

const server = app.listen(PORT, () => {
  console.log(`[Server] Practical 6 Express Backend running on http://localhost:${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.error(`[Unhandled Rejection] ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
