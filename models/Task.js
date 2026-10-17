const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  // Supplementary problem: enum-restricted priority field
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high'],
      message: '{VALUE} is not a valid priority (must be low, medium, or high)',
    },
    default: 'medium',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Supplementary problem: pre-save hook to trim whitespace from title
taskSchema.pre('save', function (next) {
  if (this.title) {
    this.title = this.title.trim();
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);
