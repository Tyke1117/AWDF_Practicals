const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// GET /tasks - list all tasks
router.get('/', async (req, res, next) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
});

// GET /tasks/:id - get a single task, 404 if it doesn't exist
router.get('/:id', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json(task);
  } catch (err) {
    // Malformed ObjectId also lands here (CastError) - treat as not found
    if (err.name === 'CastError') {
      return res.status(404).json({ error: 'Task not found' });
    }
    next(err);
  }
});

// POST /tasks - create a new task
router.post('/', async (req, res, next) => {
  try {
    const task = await Task.create(req.body);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

// PUT /tasks/:id - update a task
router.put('/:id', async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json(task);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ error: 'Task not found' });
    }
    next(err);
  }
});

// DELETE /tasks/:id - delete a task
router.delete('/:id', async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json({ message: 'Task deleted', task });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ error: 'Task not found' });
    }
    next(err);
  }
});

module.exports = router;
