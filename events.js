const EventEmitter = require('events');

/**
 * TaskEvents Custom EventEmitter
 * Inherits from Node.js native events.EventEmitter
 * Used to decouple side effects (notifications, audits, logging) from HTTP request-response flow.
 */
class TaskEvents extends EventEmitter {}

// Export a single shared instance (Singleton pattern)
module.exports = new TaskEvents();
