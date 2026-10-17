const express = require('express');
const router = express.Router();
const taskEvents = require('../events/taskEvents');

// @route   GET /api/events/activity
// @desc    Retrieve background event activity log and statistics for EventModal.jsx
router.get('/activity', (req, res) => {
  const activities = taskEvents.getActivities();
  const eventCounts = {
    'task-created': activities.filter(a => a.event === 'task-created').length,
    'task-deleted': activities.filter(a => a.event === 'task-deleted').length,
    'error': activities.filter(a => a.event === 'error').length,
  };

  res.json({
    success: true,
    totalEvents: activities.length,
    activeListeners: taskEvents.eventNames().length,
    registeredEvents: taskEvents.eventNames(),
    eventCounts,
    activities,
  });
});

// @route   POST /api/events/test-error
// @desc    Supplementary Problem 2: Safely trigger custom error event without crashing server
router.post('/test-error', (req, res) => {
  const testError = new Error('Simulated background service failure (Triggered via API)');
  
  // Emit 'error' event to TaskEvents singleton
  taskEvents.emit('error', testError);

  res.json({
    success: true,
    message: 'Test error event emitted safely. Handled by TaskEvents error listener.',
    errorSample: testError.message,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
