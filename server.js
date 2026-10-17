const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// IMPORTANT: Register event listeners at server startup before any events are emitted
require('./listeners');

const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/practical10';

// Global Middleware
app.use(cors());
app.use(express.json());

// Request Logger with Timestamp
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  next();
});

// Root Route - Practical Information
app.get('/', (req, res) => {
  res.json({
    practical: 'Practical 10: Asynchronous Processing with Event-Driven Architecture',
    objective: 'Implement asynchronous background processing using Node.js native EventEmitter without external dependencies',
    endpoints: {
      'POST /tasks': 'Create new task (emits task-created event asynchronously)',
      'GET /tasks': 'List all tasks',
      'GET /tasks/:id': 'Get task by ID',
      'PUT /tasks/:id': 'Update task by ID',
      'DELETE /tasks/:id': 'Delete task (emits task-deleted event asynchronously)',
    },
    status: 'Server and Event Listeners active',
  });
});

// Routes
app.use('/tasks', taskRoutes);

// 404 Not Found Middleware
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Central Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(`[SERVER ERROR] ${err.stack || err.message}`);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// Connect to MongoDB and Start Server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(`[Database] Connected successfully to MongoDB at ${MONGO_URI}`);
    app.listen(PORT, () => {
      console.log(`[Server] Running on port ${PORT}`);
      console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`[Server] Event-Driven Notification System Ready.`);
    });
  })
  .catch((err) => {
    console.error(`[Database Error] Failed to connect to MongoDB: ${err.message}`);
    process.exit(1);
  });

module.exports = app;
