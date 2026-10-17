const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Core Middleware
app.use(cors());
app.use(express.json());

// In-memory data store for tasks & activity
let tasks = [
  { id: 1, title: 'Learn CI/CD Pipeline Fundamentals', description: 'GitHub Actions concepts', status: 'done', completed: true },
  { id: 2, title: 'Configure Jest & Supertest API Tests', description: 'Write automated assertions', status: 'in-progress', completed: false },
  { id: 3, title: 'Implement PR Trigger & Status Badge', description: 'Verify CI automation', status: 'pending', completed: false }
];

let activityLogs = [
  { id: 1, event: 'API Bootstrapped', timestamp: new Date().toISOString(), status: 'success' },
  { id: 2, event: 'Task Seed Loaded', timestamp: new Date().toISOString(), status: 'success' }
];

// Request logging (muted during test runs)
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  }
  next();
});

// ==========================================
// API Endpoints
// ==========================================

// 1. Root Health Check Endpoint (Tested in CI Pipeline)
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Task Management API is running',
    version: '1.0.0',
    pipeline: 'GitHub Actions CI/CD Active',
    docs: '/api/tasks'
  });
});

// 2. GET /api/tasks - List all tasks
app.get('/api/tasks', (req, res) => {
  res.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks
  });
});

// 3. POST /api/tasks - Create task with mandatory title validation
app.post('/api/tasks', (req, res) => {
  const { title, description } = req.body;

  // Validation: Missing title returns 400 Bad Request
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Task title is required'
    });
  }

  const newTask = {
    id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
    title: title.trim(),
    description: description || '',
    status: 'pending',
    completed: false
  };

  tasks.push(newTask);
  activityLogs.unshift({
    id: activityLogs.length + 1,
    event: `Created task "${newTask.title}"`,
    timestamp: new Date().toISOString(),
    status: 'success'
  });

  res.status(201).json({
    success: true,
    data: newTask
  });
});

// 4. PUT /api/tasks/:id - Update task status/title
app.put('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const task = tasks.find(t => t.id === id);

  if (!task) {
    return res.status(404).json({ success: false, error: 'Task not found' });
  }

  if (req.body.title) task.title = req.body.title;
  if (req.body.status) task.status = req.body.status;
  if (req.body.completed !== undefined) task.completed = Boolean(req.body.completed);

  activityLogs.unshift({
    id: activityLogs.length + 1,
    event: `Updated task #${id}`,
    timestamp: new Date().toISOString(),
    status: 'success'
  });

  res.status(200).json({ success: true, data: task });
});

// 5. DELETE /api/tasks/:id - Delete task
app.delete('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = tasks.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Task not found' });
  }

  const deleted = tasks.splice(index, 1);
  activityLogs.unshift({
    id: activityLogs.length + 1,
    event: `Deleted task #${id}`,
    timestamp: new Date().toISOString(),
    status: 'success'
  });

  res.status(200).json({ success: true, data: deleted[0] });
});

// 6. GET /api/events/activity - Event logs endpoint (Tested in CI Pipeline)
app.get('/api/events/activity', (req, res) => {
  res.status(200).json({
    success: true,
    count: activityLogs.length,
    events: activityLogs
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`
  });
});

// Start listener only when run directly, not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
