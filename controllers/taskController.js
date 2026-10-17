const Task = require("../models/Task");
const cache = require("../config/cache");

/**
 * @desc    Get all tasks (with Node-Cache in-memory caching)
 * @route   GET /tasks & GET /api/tasks
 * @access  Public
 */
exports.getAllTasks = async (req, res, next) => {
  try {
    const bypassCache = req.query.nocache === "true" || req.headers["cache-control"] === "no-cache";
    const cacheKey = "all_tasks";

    // 1. Check cache first if not explicitly bypassed
    if (!bypassCache) {
      const cached = cache.get(cacheKey);
      if (cached) {
        cache.recordHit(cacheKey);
        res.setHeader("X-Cache", "HIT");
        return res.status(200).json(cached);
      }
    }

    // 2. Cache MISS: Query MongoDB database
    cache.recordMiss(cacheKey);
    res.setHeader("X-Cache", "MISS");

    const tasks = await Task.find().sort({ createdAt: -1 });

    // 3. Store in cache for subsequent reads (TTL configured in config/cache.js)
    if (!bypassCache) {
      cache.set(cacheKey, tasks);
      cache.metrics.sets++;
    }

    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single task by ID (with individual key caching)
 * @route   GET /tasks/:id & GET /api/tasks/:id
 * @access  Public
 */
exports.getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bypassCache = req.query.nocache === "true" || req.headers["cache-control"] === "no-cache";
    const cacheKey = `task_${id}`;

    // 1. Check individual task cache
    if (!bypassCache) {
      const cached = cache.get(cacheKey);
      if (cached) {
        cache.recordHit(cacheKey);
        res.setHeader("X-Cache", "HIT");
        return res.status(200).json(cached);
      }
    }

    // 2. Cache MISS: Query MongoDB by ID
    cache.recordMiss(cacheKey);
    res.setHeader("X-Cache", "MISS");

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task not found with id: ${id}`
      });
    }

    // 3. Store single task in cache
    if (!bypassCache) {
      cache.set(cacheKey, task);
      cache.metrics.sets++;
    }

    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create a new task & invalidate all_tasks cache
 * @route   POST /tasks & POST /api/tasks
 * @access  Public
 */
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, completed, priority, dueDate, tags } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: "Task title is required"
      });
    }

    // Write to persistent MongoDB storage
    const task = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : "",
      completed: Boolean(completed),
      priority: priority || "medium",
      dueDate: dueDate || null,
      tags: Array.isArray(tags) ? tags : []
    });

    // Invalidate the cache after successful write to avoid stale data
    cache.del("all_tasks");
    cache.invalidate("all_tasks");

    res.status(201).json({
      success: true,
      message: "Task created successfully. Cache invalidated.",
      data: task
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update task & invalidate both all_tasks and single task cache
 * @route   PUT /tasks/:id & PUT /api/tasks/:id
 * @access  Public
 */
exports.updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task not found with id: ${id}`
      });
    }

    // Invalidate both all_tasks collection and this specific task key
    const keysToInvalidate = ["all_tasks", `task_${id}`];
    cache.del(keysToInvalidate);
    cache.invalidate(keysToInvalidate);

    res.status(200).json({
      success: true,
      message: `Task updated successfully. Keys invalidated: ${keysToInvalidate.join(", ")}`,
      data: task
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete task & invalidate both all_tasks and single task cache
 * @route   DELETE /tasks/:id & DELETE /api/tasks/:id
 * @access  Public
 */
exports.deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task not found with id: ${id}`
      });
    }

    // Invalidate both all_tasks and the specific task key
    const keysToInvalidate = ["all_tasks", `task_${id}`];
    cache.del(keysToInvalidate);
    cache.invalidate(keysToInvalidate);

    res.status(200).json({
      success: true,
      message: `Task deleted successfully. Keys invalidated: ${keysToInvalidate.join(", ")}`,
      data: task
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get cache-hit / cache-miss counter & debug statistics
 * @route   GET /tasks/cache/stats & GET /api/cache/stats
 * @access  Public (Debug / Lab Evaluation)
 */
exports.getCacheStats = (req, res) => {
  const stats = cache.getDetailedStats();
  res.status(200).json({
    success: true,
    data: stats
  });
};

/**
 * @desc    Manually clear/flush cache keys for testing and resetting
 * @route   POST /tasks/cache/clear & DELETE /tasks/cache
 * @access  Public (Debug / Lab Evaluation)
 */
exports.clearCache = (req, res) => {
  cache.resetMetrics();
  res.status(200).json({
    success: true,
    message: "All cache keys flushed and metrics reset successfully."
  });
};
