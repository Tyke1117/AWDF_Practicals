/**
 * Input Validation Middleware Pipeline
 * Intercepts incoming requests and validates payloads BEFORE reaching controllers
 */

const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;

/**
 * Validation for User Registration (POST /api/auth/register)
 */
const validateRegister = (req, res, next) => {
  const { email, password, name } = req.body;
  const errors = [];

  if (!email || typeof email !== "string" || !email.trim()) {
    errors.push("Email address is required.");
  } else if (!emailRegex.test(email.trim())) {
    errors.push("A valid email address is required (e.g. user@example.com).");
  }

  if (!password || typeof password !== "string") {
    errors.push("Password is required.");
  } else if (password.length < 6) {
    errors.push("Password must be at least 6 characters long.");
  }

  if (name !== undefined && typeof name !== "string") {
    errors.push("Name must be a valid string.");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors.join(" "),
      errors
    });
  }

  next();
};

/**
 * Validation for User Login (POST /api/auth/login)
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || typeof email !== "string" || !email.trim()) {
    errors.push("Email address is required.");
  }

  if (!password || typeof password !== "string") {
    errors.push("Password is required.");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors.join(" "),
      errors
    });
  }

  next();
};

/**
 * Validation for Task Creation (POST /api/tasks)
 * Rejects malformed requests (e.g. missing or empty title) before reaching database
 */
const validateTaskCreate = (req, res, next) => {
  const { title, priority, completed } = req.body;
  const errors = [];

  if (!title || typeof title !== "string" || !title.trim()) {
    errors.push("Task title is required and cannot be empty.");
  } else if (title.trim().length > 120) {
    errors.push("Task title cannot exceed 120 characters.");
  }

  if (priority !== undefined) {
    const validPriorities = ["low", "medium", "high"];
    if (typeof priority !== "string" || !validPriorities.includes(priority.toLowerCase())) {
      errors.push("Priority must be one of: 'low', 'medium', or 'high'.");
    }
  }

  if (completed !== undefined && typeof completed !== "boolean") {
    errors.push("Completed status must be a boolean (true or false).");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors.join(" "),
      errors
    });
  }

  next();
};

/**
 * Validation for Task Updates (PUT /api/tasks/:id)
 */
const validateTaskUpdate = (req, res, next) => {
  const { title, priority, completed, description } = req.body;
  const errors = [];

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      error: "At least one field must be provided to update the task."
    });
  }

  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim()) {
      errors.push("Task title cannot be empty if provided.");
    } else if (title.trim().length > 120) {
      errors.push("Task title cannot exceed 120 characters.");
    }
  }

  if (priority !== undefined) {
    const validPriorities = ["low", "medium", "high"];
    if (typeof priority !== "string" || !validPriorities.includes(priority.toLowerCase())) {
      errors.push("Priority must be one of: 'low', 'medium', or 'high'.");
    }
  }

  if (completed !== undefined && typeof completed !== "boolean") {
    errors.push("Completed status must be a boolean (true or false).");
  }

  if (description !== undefined && typeof description !== "string") {
    errors.push("Description must be a string.");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors.join(" "),
      errors
    });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateTaskCreate,
  validateTaskUpdate
};
