const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const taskRoutes = require('./routes/tasks');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/practical5';

// Middlewares
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(MONGO_URI)
  .then((conn) => {
    console.log(`========================================`);
    console.log(`MongoDB Connected successfully!`);
    console.log(`Host: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    console.log(`Compass URI: mongodb://localhost:27017`);
    console.log(`Database Name in Compass: ${conn.connection.name}`);
    console.log(`Collection Name in Compass: tasks`);
    console.log(`========================================`);
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });

// API Routes
app.use('/tasks', taskRoutes);

// Health check & Interactive Test Dashboard
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Practical 5 - Task Management & MongoDB Compass</title>
  <style>
    * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background-color: #f4f6f8; margin: 0; padding: 24px; color: #2d3748; }
    .container { max-width: 900px; margin: 0 auto; }
    .card { background: white; border-radius: 10px; padding: 24px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    h1, h2, h3 { margin-top: 0; color: #1a202c; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
    .badge-success { background-color: #c6f6d5; color: #22543d; }
    .badge-info { background-color: #e2e8f0; color: #2d3748; }
    .badge-low { background-color: #feebc8; color: #7b341e; }
    .badge-medium { background-color: #bee3f8; color: #2b6cb0; }
    .badge-high { background-color: #fed7d7; color: #9b2c2c; }
    .compass-info { background: #ebf8fa; border-left: 4px solid #00ed64; padding: 16px; border-radius: 6px; margin: 16px 0; }
    code { background: #edf2f7; padding: 3px 6px; border-radius: 4px; font-family: Consolas, monospace; font-size: 14px; }
    .form-group { margin-bottom: 12px; }
    label { display: block; font-size: 14px; font-weight: 600; margin-bottom: 4px; }
    input, select, textarea { width: 100%; padding: 10px; border: 1px solid #cbd5e0; border-radius: 6px; font-size: 14px; }
    button { background: #00ed64; color: #001e2b; font-weight: 700; border: none; padding: 10px 18px; border-radius: 6px; cursor: pointer; transition: 0.2s; }
    button:hover { background: #00c653; }
    .btn-delete { background: #e53e3e; color: white; padding: 6px 12px; font-size: 12px; }
    .btn-delete:hover { background: #c53030; }
    .btn-toggle { background: #4a5568; color: white; padding: 6px 12px; font-size: 12px; margin-right: 6px; }
    .btn-toggle:hover { background: #2d3748; }
    .task-item { display: flex; justify-content: space-between; align-items: center; padding: 14px; border-bottom: 1px solid #edf2f7; }
    .task-item:last-child { border-bottom: none; }
    .task-title { font-weight: 600; font-size: 16px; }
    .task-title.completed { text-decoration: line-through; color: #a0aec0; }
    .task-meta { font-size: 13px; color: #718096; margin-top: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h1>Practical 5: MongoDB & Mongoose Task API</h1>
        <span class="badge badge-success">API Online</span>
      </div>
      <p>Welcome! This backend is connected to MongoDB and ready to be used with MongoDB Compass and any React/Frontend app.</p>

      <div class="compass-info">
        <h3>🍃 MongoDB Compass Connection Instructions</h3>
        <ol style="margin-bottom: 0; padding-left: 20px; line-height: 1.6;">
          <li>Open <strong>MongoDB Compass</strong> on your computer.</li>
          <li>In the <strong>New Connection</strong> box, paste: <code>mongodb://localhost:27017</code></li>
          <li>Click <strong>Connect</strong>.</li>
          <li>Look for the database named: <code>practical5</code></li>
          <li>Click into the collection: <code>tasks</code> to view, edit, or filter your documents in real-time!</li>
        </ol>
      </div>
    </div>

    <!-- Quick Add Task Form -->
    <div class="card">
      <h2>Add New Task</h2>
      <form id="taskForm">
        <div class="form-group">
          <label for="title">Task Title *</label>
          <input type="text" id="title" placeholder="e.g., Complete Practical 5 submission" required />
        </div>
        <div class="form-group">
          <label for="description">Description</label>
          <input type="text" id="description" placeholder="Optional details..." />
        </div>
        <div class="form-group">
          <label for="priority">Priority</label>
          <select id="priority">
            <option value="low">Low</option>
            <option value="medium" selected>Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <button type="submit">+ Create Task in MongoDB</button>
      </form>
    </div>

    <!-- Live Task List -->
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h2>Tasks in Database (<code>practical5.tasks</code>)</h2>
        <button onclick="loadTasks()" style="background: #e2e8f0; color: #2d3748; font-size: 13px;">Refresh</button>
      </div>
      <div id="taskList">Loading tasks...</div>
    </div>
  </div>

  <script>
    async function loadTasks() {
      const listEl = document.getElementById('taskList');
      try {
        const res = await fetch('/tasks');
        const tasks = await res.json();
        if (tasks.length === 0) {
          listEl.innerHTML = '<p style="color: #718096;">No tasks yet. Create one above!</p>';
          return;
        }
        listEl.innerHTML = tasks.map(t => \`
          <div class="task-item">
            <div>
              <div class="task-title \${t.completed ? 'completed' : ''}">\${t.title}</div>
              <div class="task-meta">
                <span class="badge badge-\${t.priority}">\${t.priority}</span>
                \${t.description ? ' &bull; ' + t.description : ''}
                &bull; <small>ID: \${t._id}</small>
              </div>
            </div>
            <div>
              <button class="btn-toggle" onclick="toggleTask('\${t._id}', \${!t.completed})">
                \${t.completed ? 'Mark Incomplete' : 'Mark Completed'}
              </button>
              <button class="btn-delete" onclick="deleteTask('\${t._id}')">Delete</button>
            </div>
          </div>
        \`).join('');
      } catch (err) {
        listEl.innerHTML = '<p style="color: red;">Failed to load tasks: ' + err.message + '</p>';
      }
    }

    document.getElementById('taskForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('title').value;
      const description = document.getElementById('description').value;
      const priority = document.getElementById('priority').value;

      try {
        const res = await fetch('/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description, priority })
        });
        if (res.ok) {
          document.getElementById('title').value = '';
          document.getElementById('description').value = '';
          loadTasks();
        } else {
          const err = await res.json();
          alert('Error: ' + JSON.stringify(err));
        }
      } catch (err) {
        alert('Request failed: ' + err.message);
      }
    });

    async function toggleTask(id, completed) {
      await fetch('/tasks/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
      });
      loadTasks();
    }

    async function deleteTask(id) {
      if (confirm('Delete this task?')) {
        await fetch('/tasks/' + id, { method: 'DELETE' });
        loadTasks();
      }
    }

    loadTasks();
  </script>
</body>
</html>`);
});

// Global error handler (must be registered last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
