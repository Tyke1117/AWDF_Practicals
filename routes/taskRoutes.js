const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const taskEvents = require('../events');

// @route   POST /tasks
// @desc    Create a new task, respond immediately, and emit 'task-created' event
router.post('/', async (req, res, next) => {
  try {
    const { title, description, assignedUser, completed } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, error: 'Task title is required' });
    }

    // 1. Save task to MongoDB
    const task = await Task.create({
      title,
      description,
      assignedUser: assignedUser || 'Pari (Team Lead)',
      completed: completed || false,
    });

    const responseTimestamp = new Date().toISOString();
    console.log(`\n================================================================================`);
    console.log(`[API] Response 201 Created sent to client at: ${responseTimestamp}`);
    console.log(`[API] Task ID: ${task._id}, Title: "${task.title}"`);
    console.log(`================================================================================`);

    // 2. Respond immediately to the client (instant response)
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
      apiResponseTimestamp: responseTimestamp,
    });

    // 3. Emit asynchronous event AFTER responding
    taskEvents.emit('task-created', task);
  } catch (error) {
    next(error);
  }
});

// @route   GET /tasks
// @desc    Retrieve all tasks
router.get('/', async (req, res, next) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /tasks/:id
// @desc    Retrieve single task by ID
router.get('/:id', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /tasks/:id
// @desc    Update an existing task
router.put('/:id', async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /tasks/:id
// @desc    Delete task, respond immediately, and emit 'task-deleted' event
router.delete('/:id', async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    const responseTimestamp = new Date().toISOString();
    console.log(`\n================================================================================`);
    console.log(`[API] Response 200 OK (Delete) sent to client at: ${responseTimestamp}`);
    console.log(`[API] Deleted Task ID: ${task._id}, Title: "${task.title}"`);
    console.log(`================================================================================`);

    // Respond immediately
    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: task,
      apiResponseTimestamp: responseTimestamp,
    });

    // Emit 'task-deleted' event asynchronously
    taskEvents.emit('task-deleted', task);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
