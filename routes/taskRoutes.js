const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

// Debug & Cache Monitoring Routes (Registered before :id parameter)
router.get("/cache/stats", taskController.getCacheStats);
router.post("/cache/clear", taskController.clearCache);
router.delete("/cache", taskController.clearCache);

// Core CRUD Task Routes
router.route("/")
  .get(taskController.getAllTasks)
  .post(taskController.createTask);

router.route("/:id")
  .get(taskController.getTaskById)
  .put(taskController.updateTask)
  .delete(taskController.deleteTask);

module.exports = router;
