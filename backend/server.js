const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// In-memory fallback dataset in case MongoDB is not actively running
let isMongoConnected = false;
let inMemoryTasks = [
  {
    _id: 'task-1',
    id: 'task-1',
    title: 'Implement React.lazy() and Suspense',
    description: 'Split the main bundle by dynamically loading route components.',
    status: 'completed',
    completed: true,
    priority: 'high',
    projectId: 'proj-1',
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
  },
  {
    _id: 'task-2',
    id: 'task-2',
    title: 'Measure Baseline Bundle Metrics',
    description: 'Document initial dist bundle size before code splitting.',
    status: 'completed',
    completed: true,
    priority: 'high',
    projectId: 'proj-1',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  },
  {
    _id: 'task-3',
    id: 'task-3',
    title: 'Design Skeleton Fallback UI',
    description: 'Create aesthetic pulse placeholder cards shown during chunk fetch.',
    status: 'in-progress',
    completed: false,
    priority: 'medium',
    projectId: 'proj-2',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    _id: 'task-4',
    id: 'task-4',
    title: 'Lazy Load Heavy Analytics Chart.js',
    description: 'Isolate the 150KB+ chart visualization into an on-demand chunk.',
    status: 'in-progress',
    completed: false,
    priority: 'high',
    projectId: 'proj-2',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    _id: 'task-5',
    id: 'task-5',
    title: 'Fix Unnecessary Re-renders with React.memo',
    description: 'Profile component tree and memoize TaskItem to stop re-rendering on text inputs.',
    status: 'pending',
    completed: false,
    priority: 'low',
    projectId: 'proj-3',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

let inMemoryProjects = [
  {
    id: 'proj-1',
    name: 'Frontend Core Performance',
    description: 'Vite build optimization, bundle splitting, and lazy loading routes.',
    color: '#3b82f6',
    progress: 100,
    taskCount: 2
  },
  {
    id: 'proj-2',
    name: 'UX & Fallback Polish',
    description: 'Skeleton loaders, min-delay fallback, and heavy chart deferral.',
    color: '#8b5cf6',
    progress: 50,
    taskCount: 2
  },
  {
    id: 'proj-3',
    name: 'Runtime Profiling & Memoization',
    description: 'React DevTools Profiler audits and re-render mitigation.',
    color: '#10b981',
    progress: 25,
    taskCount: 1
  }
];

let inMemoryMessages = [];

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskdb_prac8';
mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 })
  .then(async () => {
    isMongoConnected = true;
    console.log('Connected to MongoDB database: taskdb_prac8');
    try {
      const count = await Task.countDocuments();
      if (count === 0) {
        await Task.insertMany(inMemoryTasks.map(({ _id, id, ...rest }) => rest));
        console.log('Seeded MongoDB with initial Practical 8 tasks.');
      }
    } catch (e) {
      console.warn('Seed error:', e.message);
    }
  })
  .catch((err) => {
    isMongoConnected = false;
    console.warn('MongoDB connection failed. Operating with high-reliability In-Memory Store.');
  });

// Schema definition (if Mongo connected)
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  completed: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  projectId: String,
  createdAt: { type: Date, default: Date.now }
});

taskSchema.pre('save', function (next) {
  if (this.status === 'completed') {
    this.completed = true;
  } else if (this.completed === true) {
    this.status = 'completed';
  } else if (!this.status) {
    this.status = 'pending';
  }
  next();
});

const Task = mongoose.model('Task', taskSchema);

// Helper to normalize task objects
function sanitizeTask(task) {
  const isComp = task.status === 'completed' || task.completed === true;
  const stat = isComp ? 'completed' : (task.status === 'in-progress' ? 'in-progress' : 'pending');
  return {
    ...task,
    id: String(task.id || task._id),
    _id: String(task._id || task.id),
    status: stat,
    completed: isComp
  };
}

// --- ROUTES (Mount on both /api/* and root /* for full compatibility) ---

// Health & Status
app.get(['/api/status', '/status'], (req, res) => {
  res.json({
    status: 'online',
    storageMode: isMongoConnected ? 'MongoDB' : 'In-Memory Store',
    practical: 'Practical 8: Performance Optimization and Lazy Loading in React',
    timestamp: new Date().toISOString()
  });
});

// Tasks Endpoints
app.get(['/api/tasks', '/tasks'], async (req, res) => {
  try {
    if (isMongoConnected) {
      const rawTasks = await Task.find().sort({ createdAt: -1 });
      const tasks = rawTasks.map(t => sanitizeTask(t.toObject()));
      return res.json({ success: true, count: tasks.length, data: tasks });
    }
    const tasks = inMemoryTasks.map(sanitizeTask);
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post(['/api/tasks', '/tasks'], async (req, res) => {
  try {
    const { title, description, status, completed, priority, projectId } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Task title is required.' });
    }

    const isComp = status === 'completed' || completed === true;
    const resolvedStatus = isComp ? 'completed' : (status === 'in-progress' ? 'in-progress' : 'pending');

    if (isMongoConnected) {
      const newTask = await Task.create({
        title: title.trim(),
        description: description || '',
        status: resolvedStatus,
        completed: isComp,
        priority: priority || 'medium',
        projectId: projectId || 'proj-1'
      });
      return res.status(201).json({ success: true, data: sanitizeTask(newTask.toObject()) });
    }

    const newTask = {
      _id: `task-${Date.now()}`,
      id: `task-${Date.now()}`,
      title: title.trim(),
      description: description || '',
      status: resolvedStatus,
      completed: isComp,
      priority: priority || 'medium',
      projectId: projectId || 'proj-1',
      createdAt: new Date().toISOString()
    };
    inMemoryTasks.unshift(newTask);
    res.status(201).json({ success: true, data: newTask });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put(['/api/tasks/:id', '/tasks/:id'], async (req, res) => {
  try {
    const taskId = req.params.id;
    const updates = { ...req.body };

    if (updates.status !== undefined || updates.completed !== undefined) {
      const isComp = updates.status === 'completed' || updates.completed === true;
      updates.completed = isComp;
      if (updates.status !== undefined) {
        updates.status = isComp ? 'completed' : (updates.status === 'in-progress' ? 'in-progress' : 'pending');
      } else {
        updates.status = isComp ? 'completed' : 'pending';
      }
    }

    if (isMongoConnected) {
      const updated = await Task.findByIdAndUpdate(taskId, updates, { new: true });
      if (!updated) return res.status(404).json({ success: false, error: 'Task not found' });
      return res.json({ success: true, data: sanitizeTask(updated.toObject()) });
    }

    const index = inMemoryTasks.findIndex(t => t.id === taskId || t._id === taskId);
    if (index === -1) return res.status(404).json({ success: false, error: 'Task not found' });
    inMemoryTasks[index] = { ...inMemoryTasks[index], ...updates };
    inMemoryTasks[index] = sanitizeTask(inMemoryTasks[index]);
    res.json({ success: true, data: inMemoryTasks[index] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete(['/api/tasks/:id', '/tasks/:id'], async (req, res) => {
  try {
    const taskId = req.params.id;

    if (isMongoConnected) {
      const deleted = await Task.findByIdAndDelete(taskId);
      if (!deleted) return res.status(404).json({ success: false, error: 'Task not found' });
      return res.json({ success: true, message: 'Task deleted successfully' });
    }

    const index = inMemoryTasks.findIndex(t => t.id === taskId || t._id === taskId);
    if (index === -1) return res.status(404).json({ success: false, error: 'Task not found' });
    inMemoryTasks.splice(index, 1);
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Projects Endpoint
app.get(['/api/projects', '/projects'], (req, res) => {
  res.json({ success: true, count: inMemoryProjects.length, data: inMemoryProjects });
});

// Analytics & Metrics Endpoint
app.get(['/api/analytics', '/analytics'], async (req, res) => {
  let tasks = inMemoryTasks;
  if (isMongoConnected) {
    try {
      const rawTasks = await Task.find();
      tasks = rawTasks.map(t => sanitizeTask(t.toObject()));
    } catch (e) {
      tasks = inMemoryTasks;
    }
  }

  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed' || t.completed === true).length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const pending = tasks.filter(t => t.status === 'pending' || (!t.completed && t.status !== 'in-progress' && t.status !== 'completed')).length;

  res.json({
    success: true,
    data: {
      summary: {
        total,
        completed,
        inProgress,
        pending,
        completionRate: total ? Math.round((completed / total) * 100) : 0
      },
      priorityDistribution: {
        high: tasks.filter(t => t.priority === 'high').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        low: tasks.filter(t => t.priority === 'low').length
      },
      weeklyVelocity: [
        { day: 'Mon', completed: 3, created: 5 },
        { day: 'Tue', completed: 4, created: 2 },
        { day: 'Wed', completed: 6, created: 4 },
        { day: 'Thu', completed: 5, created: 3 },
        { day: 'Fri', completed: 8, created: 6 },
        { day: 'Sat', completed: 4, created: 1 },
        { day: 'Sun', completed: 2, created: 0 }
      ]
    }
  });
});

// Contact Endpoint
app.post(['/api/contact', '/contact'], (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'Name, email, and message are required.' });
  }
  const msgRecord = {
    id: `msg-${Date.now()}`,
    name,
    email,
    subject: subject || 'General Feedback',
    message,
    receivedAt: new Date().toISOString()
  };
  inMemoryMessages.push(msgRecord);
  res.status(201).json({
    success: true,
    message: 'Message delivered to Task Management Support Team.',
    data: msgRecord
  });
});

function startServer(portToTry) {
  const srv = app.listen(portToTry, () => {
    console.log(`Practical 8 API Backend running on http://localhost:${portToTry}`);
  });

  srv.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && portToTry < 5010) {
      console.warn(`Port ${portToTry} busy, attempting next port ${portToTry + 1}...`);
      startServer(portToTry + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(PORT);
