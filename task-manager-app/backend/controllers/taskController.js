const Task = require("../models/Task");
const { cache, recordHit, recordMiss, recordInvalidation } = require("../config/cache");
const taskEvents = require("../events/taskEvents");

// Step 3: Check cache first in GET /tasks
exports.getAllTasks = async (req, res, next) => {
  try {
    const start = process.hrtime();
    const bypassCache = req.query.nocache === "true" || req.headers["cache-control"] === "no-cache";
    const userId = req.user ? (req.user._id || req.user.id) : null;
    const cacheKey = userId ? `tasks_${userId}` : "all_tasks";

    if (!bypassCache) {
      const cachedData = cache.get(cacheKey);
      if (cachedData !== undefined) {
        recordHit();
        res.setHeader("X-Cache", "HIT");
        const diff = process.hrtime(start);
        const responseTime = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2) + "ms";
        return res.status(200).json({
          success: true,
          source: "cache",
          cacheHit: true,
          responseTime,
          count: cachedData.length,
          data: cachedData
        });
      }
    }

    // Cache MISS: Query database and populate cache
    recordMiss();
    const query = userId ? { user: userId } : {};
    const tasks = await Task.find(query).sort({ createdAt: -1 });
    
    if (!bypassCache) {
      cache.set(cacheKey, tasks, 60);
    }

    const diff = process.hrtime(start);
    const responseTime = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2) + "ms";

    res.setHeader("X-Cache", "MISS");
    res.status(200).json({
      success: true,
      source: "database",
      cacheHit: false,
      responseTime,
      count: tasks.length,
      data: tasks
    });
  } catch (err) {
    next(err);
  }
};

// GET /tasks/:id
exports.getTaskById = async (req, res, next) => {
  try {
    const start = process.hrtime();
    const singleCacheKey = `task_${req.params.id}`;
    const cachedTask = cache.get(singleCacheKey);

    if (cachedTask !== undefined) {
      recordHit();
      res.setHeader("X-Cache", "HIT");
      const diff = process.hrtime(start);
      const responseTime = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2) + "ms";
      return res.status(200).json({
        success: true,
        source: "cache",
        cacheHit: true,
        responseTime,
        data: cachedTask
      });
    }

    // Cache MISS -> Query MongoDB
    recordMiss();
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    cache.set(singleCacheKey, task, 60);

    const diff = process.hrtime(start);
    const responseTime = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2) + "ms";

    res.setHeader("X-Cache", "MISS");
    res.status(200).json({
      success: true,
      source: "database",
      cacheHit: false,
      responseTime,
      data: task
    });
  } catch (err) {
    next(err);
  }
};

// Step 3: backend/controllers/taskController.js (createTask)
// Immediately responds 201 Created and asynchronously emits 'task-created'
exports.createTask = async (req, res, next) => {
  try {
    const userId = req.user ? (req.user._id || req.user.id) : null;
    const task = await Task.create({
      ...req.body,
      user: userId
    });

    // Invalidate cache
    if (userId) {
      cache.del(`tasks_${userId}`);
    }
    cache.del("all_tasks");
    recordInvalidation();

    // Record timestamp and respond immediately (HTTP 201 Created)
    const apiResponseTime = new Date().toISOString();
    console.log(`[API] Response sent for task "${task.title}" at ${apiResponseTime}`);

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      apiResponseTime,
      data: task
    });

    // Asynchronously emit event after response is sent (non-blocking)
    taskEvents.emit("task-created", {
      task,
      responseTime: apiResponseTime,
      delayMs: 2000
    });
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const userId = req.user ? (req.user._id || req.user.id) : null;
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!task) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    const singleCacheKey = `task_${req.params.id}`;
    const keysToDel = [singleCacheKey, "all_tasks"];
    if (userId) keysToDel.push(`tasks_${userId}`);
    cache.del(keysToDel);
    recordInvalidation();

    res.status(200).json({
      success: true,
      cacheInvalidated: true,
      message: "Task updated successfully. Cache invalidated.",
      data: task
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /tasks/:id: Immediately responds 200 OK and emits 'task-deleted'
exports.deleteTask = async (req, res, next) => {
  try {
    const userId = req.user ? (req.user._id || req.user.id) : null;
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    const singleCacheKey = `task_${req.params.id}`;
    const keysToDel = [singleCacheKey, "all_tasks"];
    if (userId) keysToDel.push(`tasks_${userId}`);
    cache.del(keysToDel);
    recordInvalidation();

    const responseTime = new Date().toISOString();
    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      apiResponseTime: responseTime,
      data: task
    });

    // Emit task-deleted event after response
    taskEvents.emit("task-deleted", { task, responseTime });
  } catch (err) {
    next(err);
  }
};
