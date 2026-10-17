require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Core Middleware Pipeline
app.use(cors());
app.use(express.json());
app.use(logger);

// Root route - API overview & health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Practical 7: Authentication & Middleware Pipeline API",
    version: "1.0.0",
    pipelineArchitecture: [
      "Client Request -> cors() -> express.json() -> logger",
      "Auth Routes: /api/auth/register, /api/auth/login, /api/auth/me",
      "Protected Task Routes: [Auth Middleware] -> [Validation Middleware] -> Controller"
    ],
    endpoints: {
      auth: {
        register: "POST /api/auth/register (public, validated)",
        login: "POST /api/auth/login (public, validated)",
        me: "GET /api/auth/me (private, requires Bearer token)"
      },
      tasks: {
        getAll: "GET /api/tasks (private, user-scoped)",
        getById: "GET /api/tasks/:id (private)",
        create: "POST /api/tasks (private, validated)",
        update: "PUT /api/tasks/:id (private, validated)",
        delete: "DELETE /api/tasks/:id (private)"
      }
    }
  });
});

// Mount Routes (supporting both /api/* and root aliases for convenience)
app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);

app.use("/api/tasks", taskRoutes);
app.use("/tasks", taskRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized Error Handling Middleware (must be registered last)
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`[Server] Practical 7 Backend running on http://localhost:${PORT}`);
  console.log(`[Server] Environment: ${process.env.NODE_ENV || "development"}`);
});

process.on("unhandledRejection", (err) => {
  console.error(`[Unhandled Rejection] ${err.message}`);
});

module.exports = app;
