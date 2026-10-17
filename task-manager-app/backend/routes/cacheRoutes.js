// Supplementary Problem 2: Cache Telemetry & Debug Endpoint (routes/cacheRoutes.js)
const express = require("express");
const router = express.Router();
const { cache, getStats } = require("../config/cache");

router.get("/stats", (req, res) => {
  res.status(200).json({
    success: true,
    message: "In-memory cache telemetry and performance statistics",
    stats: getStats() // Returns hits, misses, hitRatio, keys, and uptime
  });
});

router.post("/flush", (req, res) => {
  cache.flushAll(); // Purges all active keys in memory
  res.status(200).json({ success: true, message: "Cache flushed successfully" });
});

module.exports = router;
