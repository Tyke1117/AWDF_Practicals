const Task = require("../models/Task");

/**
 * @desc    Get all tasks with optional search & filter
 * @route   GET /api/tasks & GET /tasks
 * @access  Public
 */
exports.getAllTasks = async (req, res, next) => {
  try {
    const { completed, priority, search } = req.query;
    const filter = {};

    if (completed !== undefined && completed !== "") {
      filter.completed = completed === "true";
    }

    if (priority) {
      filter.priority = priority.toLowerCase();
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single task by ID
 * @route   GET /api/tasks/:id & GET /tasks/:id
 * @access  Public
 */
exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task not found with id: ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create a new task
 * @route   POST /api/tasks & POST /tasks
 * @access  Public
 */
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, completed, priority } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: "Task title is required"
      });
    }

    const task = await Task.create({
      title,
      description,
      completed: Boolean(completed),
      priority: priority || "medium"
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update task details or status
 * @route   PUT /api/tasks/:id & PUT /tasks/:id
 * @access  Public
 */
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task not found with id: ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: task
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete task
 * @route   DELETE /api/tasks/:id & DELETE /tasks/:id
 * @access  Public
 */
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task not found with id: ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      data: task
    });
  } catch (err) {
    next(err);
  }
};
