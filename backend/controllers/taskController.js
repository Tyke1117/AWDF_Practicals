const Task = require("../models/Task");

/**
 * @desc    Get all tasks for the authenticated user
 * @route   GET /api/tasks & GET /tasks
 * @access  Private (Protected by JWT)
 */
exports.getAllTasks = async (req, res, next) => {
  try {
    const { completed, priority, search } = req.query;

    // Filter tasks strictly belonging to the authenticated user
    const filter = { user: req.user.id };

    if (completed !== undefined && completed !== "") {
      filter.completed = completed === "true";
    }

    if (priority) {
      filter.priority = priority.toLowerCase();
    }

    if (search) {
      filter.$and = [
        { user: req.user.id },
        {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } }
          ]
        }
      ];
      delete filter.user; // Filter handled in $and
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
 * @desc    Get single task by ID for authenticated user
 * @route   GET /api/tasks/:id & GET /tasks/:id
 * @access  Private (Protected by JWT)
 */
exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id
    });

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
 * @desc    Create a new task belonging to the authenticated user
 * @route   POST /api/tasks & POST /tasks
 * @access  Private (Protected by JWT + Validation Middleware)
 */
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, completed, priority } = req.body;

    const task = await Task.create({
      user: req.user.id,
      title: title.trim(),
      description: description ? description.trim() : "",
      completed: Boolean(completed),
      priority: priority ? priority.toLowerCase() : "medium"
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
 * @desc    Update task details or status for authenticated user
 * @route   PUT /api/tasks/:id & PUT /tasks/:id
 * @access  Private (Protected by JWT + Validation Middleware)
 */
exports.updateTask = async (req, res, next) => {
  try {
    // Find task and verify ownership
    let task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task not found with id: ${req.params.id}`
      });
    }

    // Apply updates
    const updates = req.body;
    if (updates.title !== undefined) task.title = updates.title.trim();
    if (updates.description !== undefined) task.description = updates.description.trim();
    if (updates.completed !== undefined) task.completed = Boolean(updates.completed);
    if (updates.priority !== undefined) task.priority = updates.priority.toLowerCase();

    await task.save();

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
 * @desc    Delete task for authenticated user
 * @route   DELETE /api/tasks/:id & DELETE /tasks/:id
 * @access  Private (Protected by JWT)
 */
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

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
