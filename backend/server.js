require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const taskRoutes = require("./routes/taskRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// CORS configuration (API key is NEVER sent to client, client only calls backend)
app.use(cors());
app.use(express.json());
app.use(logger);

// Root route info
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Practical 13: AI API Integration into a Web Application (Express + OpenAI/Gemini + MongoDB)",
    version: "2.0.0",
    endpoints: {
      tasks: {
        getTasks: "GET /api/tasks (or /tasks)",
        createTask: "POST /api/tasks (or /tasks)",
        updateTask: "PUT /api/tasks/:id (or /tasks/:id)",
        deleteTask: "DELETE /api/tasks/:id (or /tasks/:id)"
      },
      ai: {
        generateDescription: "POST /api/ai/generate-description",
        aiStatus: "GET /api/ai/status"
      }
    }
  });
});

// Mount Task CRUD routes
app.use("/api/tasks", taskRoutes);
app.use("/tasks", taskRoutes);

// Practical 13 Step 3: Mount AI route at /api/ai
app.use("/api/ai", aiRoutes);

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
  console.log(`[Server] Practical 13 Express Backend running on http://localhost:${PORT}`);
  console.log(`[AI Endpoint] POST http://localhost:${PORT}/api/ai/generate-description`);
});

process.on("unhandledRejection", (err) => {
  console.error(`[Unhandled Rejection] ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
