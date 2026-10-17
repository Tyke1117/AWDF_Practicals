const express = require('express');
const cors = require('cors');

const app = express();

// Core Middleware
app.use(cors());
app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  // Only log in non-test environment to keep test logs clean
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  }
  next();
});

// In-memory Task dataset
let tasks = [
  { id: 1, title: 'Learn CI/CD Fundamentals', completed: true },
  { id: 2, title: 'Write Automated Tests with Jest', completed: true },
  { id: 3, title: 'Deploy GitHub Actions Pipeline', completed: false }
];

// Helper reset function for deterministic test runs
app.resetTasks = () => {
  tasks = [
    { id: 1, title: 'Learn CI/CD Fundamentals', completed: true },
    { id: 2, title: 'Write Automated Tests with Jest', completed: true },
    { id: 3, title: 'Deploy GitHub Actions Pipeline', completed: false }
  ];
};

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'Task Management API with GitHub Actions CI/CD Pipeline',
    version: '1.0.0',
    documentation: '/tasks'
  });
});

// GET /tasks - Return all tasks
app.get('/tasks', (req, res) => {
  res.status(200).json(tasks);
});

// GET /tasks/:id - Return single task by ID
app.get('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Task ID must be a numeric integer' });
  }

  const task = tasks.find(t => t.id === id);
  if (!task) {
    return res.status(404).json({ error: `Task with ID ${id} not found` });
  }

  res.status(200).json(task);
});

// POST /tasks - Create a new task
app.post('/tasks', (req, res) => {
  const { title, completed } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Task title is required and cannot be empty' });
  }

  const nextId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
  const newTask = {
    id: nextId,
    title: title.trim(),
    completed: typeof completed === 'boolean' ? completed : false
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// PUT /tasks/:id - Update task by ID
app.put('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Task ID must be a numeric integer' });
  }

  const task = tasks.find(t => t.id === id);
  if (!task) {
    return res.status(404).json({ error: `Task with ID ${id} not found` });
  }

  if (req.body.title !== undefined) {
    if (typeof req.body.title !== 'string' || req.body.title.trim() === '') {
      return res.status(400).json({ error: 'Updated title cannot be empty' });
    }
    task.title = req.body.title.trim();
  }

  if (req.body.completed !== undefined) {
    task.completed = Boolean(req.body.completed);
  }

  res.status(200).json(task);
});

// DELETE /tasks/:id - Delete task by ID
app.delete('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Task ID must be a numeric integer' });
  }

  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: `Task with ID ${id} not found` });
  }

  const removed = tasks.splice(index, 1);
  res.status(200).json({
    message: 'Task deleted successfully',
    task: removed[0]
  });
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}` });
});

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

module.exports = app;
