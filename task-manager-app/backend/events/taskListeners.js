// Step 2: backend/events/taskListeners.js
const taskEvents = require('./taskEvents');

// ==========================================
// 1. Primary Event: 'task-created' Listener
// ==========================================
taskEvents.on('task-created', (payload) => {
  const { task, responseTime, delayMs = 2000 } = payload;
  console.log(`[Notification] Task "${task.title}" created at ${new Date().toISOString()}`);

  taskEvents.recordActivity({
    event: 'task-created',
    status: 'IN_PROGRESS',
    taskTitle: task.title,
    assignedUser: task.assignedUser || task.user,
    responseTime,
    delayMs,
  });

  // Simulate asynchronous background notification (non-blocking)
  setTimeout(() => {
    const finishTime = new Date().toISOString();
    console.log(`[Notification Finished] Dispatch complete at ${finishTime}`);
    taskEvents.recordActivity({
      event: 'task-created',
      status: 'COMPLETED_ASYNC',
      taskTitle: task.title,
      assignedUser: task.assignedUser || task.user,
      finishedAt: finishTime,
    });
  }, delayMs);
});

// ==========================================
// 2. Supplementary Problem 1: 'task-deleted' Listener
// ==========================================
taskEvents.on('task-deleted', (payload) => {
  const { task, responseTime } = payload;
  const deleteTime = new Date().toISOString();
  console.log(`[Audit Log] Task "${task.title}" was deleted at ${deleteTime} by user ${task.user || task.assignedUser}`);
  taskEvents.recordActivity({
    event: 'task-deleted',
    status: 'COMPLETED_ASYNC',
    taskTitle: task.title,
    finishedAt: deleteTime,
  });
});

// ==========================================
// 3. Supplementary Problem 2: Custom Error Event Listener
// ==========================================
// In Node.js, an unhandled 'error' event throws and crashes the entire process.
// Registering an explicit 'error' handler safely catches and logs errors.
taskEvents.on('error', (err) => {
  const errorTimestamp = new Date().toISOString();
  console.error(`[TaskEvents ERROR] Error caught safely at ${errorTimestamp}: ${err.message}`);
  taskEvents.recordActivity({
    event: 'error',
    status: 'ERROR_HANDLED_SAFELY',
    message: `Safe Error Catch: ${err.message}`,
    timestamp: errorTimestamp,
  });
});

module.exports = taskEvents;
