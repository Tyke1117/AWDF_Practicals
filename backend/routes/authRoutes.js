const express = require("express");
const router = express.Router();

const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { validateRegister, validateLogin } = require("../middleware/validator");

// Public authentication routes with input validation middleware
router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);

// Protected user profile route (Supplementary Problem 1)
router.get("/me", protect, getMe);

module.exports = router;
