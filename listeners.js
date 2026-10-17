const taskEvents = require('./events');

/**
 * Register Event Listeners for Task Events
 * This module is imported once at application startup to register all listeners.
 */

// ==========================================
// 1. Primary Event: 'task-created'
// ==========================================
taskEvents.on('task-created', (task) => {
  const triggerTime = new Date().toISOString();
  console.log(`--------------------------------------------------------------------------------`);
  console.log(`[Notification Listener] 'task-created' event RECEIVED at: ${triggerTime}`);
  console.log(`[Notification Listener] Task Title    : "${task.title}"`);
  console.log(`[Notification Listener] Assigned User : "${task.assignedUser || 'Unassigned'}"`);
  console.log(`[Notification Listener] Status        : Simulating asynchronous background notification (2s delay)...`);

  // Step 5 & Supplementary Problem: Artificial 2-second delay simulating slow notification (e.g., sending email/SMS)
  setTimeout(() => {
    try {
      // Supplementary Problem: Simulate error handling when requested
      if (task.title && task.title.toLowerCase().includes('simulate-error')) {
        throw new Error(`Failed to deliver email notification to user "${task.assignedUser}" for task "${task.title}"`);
      }

      const finishTime = new Date().toISOString();
      console.log(`[Notification Listener] 'task-created' COMPLETED at: ${finishTime}`);
      console.log(`[Notification Listener] Notification successfully delivered to "${task.assignedUser || 'Unassigned'}" for "${task.title}".`);
      console.log(`--------------------------------------------------------------------------------`);
    } catch (err) {
      // Trigger error event listener to handle without crashing process
      taskEvents.emit('error', err);
    }
  }, 2000); // 2000ms delay demonstrates non-blocking execution
});

// ==========================================
// 2. Supplementary Problem: 'task-deleted'
// ==========================================
taskEvents.on('task-deleted', (task) => {
  const triggerTime = new Date().toISOString();
  console.log(`--------------------------------------------------------------------------------`);
  console.log(`[Notification Listener] 'task-deleted' event RECEIVED at: ${triggerTime}`);
  console.log(`[Notification Listener] Deleted Task ID   : ${task._id}`);
  console.log(`[Notification Listener] Deleted Task Title: "${task.title}"`);
  console.log(`[Notification Listener] Status            : Dispatching task deletion audit log (1s delay)...`);

  setTimeout(() => {
    const finishTime = new Date().toISOString();
    console.log(`[Notification Listener] 'task-deleted' AUDIT LOGGED at: ${finishTime}`);
    console.log(`[Notification Listener] Task "${task.title}" audit records archived successfully.`);
    console.log(`--------------------------------------------------------------------------------`);
  }, 1000);
});

// ==========================================
// 3. Supplementary Problem: 'error' Listener
// ==========================================
// Node.js EventEmitter has special handling for 'error' event:
// If no listener is registered, it will throw an unhandled exception and crash the Node process!
taskEvents.on('error', (err) => {
  const errorTime = new Date().toISOString();
  console.error(`--------------------------------------------------------------------------------`);
  console.error(`[TaskEvents ERROR LISTENER] Caught background event error at: ${errorTime}`);
  console.error(`[TaskEvents ERROR LISTENER] Error Message: ${err.message}`);
  console.error(`[TaskEvents ERROR LISTENER] Handled gracefully without crashing the server!`);
  console.error(`--------------------------------------------------------------------------------`);
});

console.log('[TaskEvents] All event listeners registered successfully.');
