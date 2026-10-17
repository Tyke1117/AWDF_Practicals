const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"]
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    completed: {
      type: Boolean,
      default: false
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    },
    dueDate: {
      type: Date,
      default: null
    },
    tags: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Query Optimization: Compound and single-field indexes for fast MongoDB lookups
TaskSchema.index({ completed: 1, priority: 1 });
TaskSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Task", TaskSchema);
