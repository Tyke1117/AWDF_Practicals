// Step 1: backend/events/taskEvents.js
const EventEmitter = require('events');

class TaskEvents extends EventEmitter {
  constructor() {
    super();
    this.activities = [];
  }

  recordActivity(activity) {
    this.activities.unshift({
      ...activity,
      timestamp: activity.timestamp || new Date().toISOString(),
      id: Date.now() + Math.random().toString(36).substr(2, 4),
    });
    if (this.activities.length > 50) this.activities.pop();
  }

  getActivities() {
    return this.activities;
  }
}

module.exports = new TaskEvents();
