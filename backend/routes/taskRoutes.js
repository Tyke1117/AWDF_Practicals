const express = require("express");
const router = express.Router();

const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} = require("../controllers/taskController");

const { protect } = require("../middleware/auth");
const {
  validateTaskCreate,
  validateTaskUpdate
} = require("../middleware/validator");

// Step 6: Apply the auth middleware to ALL task routes
router.use(protect);

// Task Collection Routes
router
  .route("/")
  .get(getAllTasks)
  .post(validateTaskCreate, createTask); // Step 7: Validation middleware before controller

// Individual Task Routes
router
  .route("/:id")
  .get(getTaskById)
  .put(validateTaskUpdate, updateTask)
  .delete(deleteTask);

module.exports = router;
