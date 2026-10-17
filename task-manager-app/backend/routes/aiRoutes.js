const express = require("express");
const router = express.Router();
const { generateDescription, simulateFailure, getAIStatus } = require("../controllers/aiController");
const { aiRateLimiter } = require("../middleware/rateLimiter");

// GET /api/ai/status - Service Health & Model Configuration
router.get("/status", getAIStatus);

// POST /api/ai/generate-description - Main AI Task Auto-Generation (Protected by Rate Limiter)
router.post("/generate-description", aiRateLimiter, generateDescription);

// POST /api/ai/test-failure - Graceful Degradation Verification Route
router.post("/test-failure", simulateFailure);

module.exports = router;
