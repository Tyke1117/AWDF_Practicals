const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const { optionalAuth } = require("../middleware/auth");

router.use(optionalAuth);

router.route("/")
  .get(taskController.getAllTasks)
  .post(taskController.createTask);

router.route("/:id")
  .get(taskController.getTaskById)
  .put(taskController.updateTask)
  .delete(taskController.deleteTask);

module.exports = router;
