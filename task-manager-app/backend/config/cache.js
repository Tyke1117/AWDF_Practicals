const NodeCache = require("node-cache");

// Step 2: Initialize a cache instance in a shared module
const defaultTTL = parseInt(process.env.CACHE_TTL, 10) || 60;

const cache = new NodeCache({
  stdTTL: defaultTTL,      // 60 Seconds Time-To-Live
  checkperiod: 120,        // Automatic expired key sweep
  useClones: false
});

// Telemetry & stats tracking for Supplementary Problem 2
const stats = { hits: 0, misses: 0, invalidations: 0 };

const recordHit = () => { stats.hits++; };
const recordMiss = () => { stats.misses++; };
const recordInvalidation = () => { stats.invalidations++; };

const getStats = () => {
  const total = stats.hits + stats.misses;
  const hitRatio = total > 0 ? ((stats.hits / total) * 100).toFixed(1) + "%" : "0.0%";
  return {
    hits: stats.hits,
    misses: stats.misses,
    invalidations: stats.invalidations,
    hitRatio,
    keys: cache.keys().length,
    ttl: defaultTTL
  };
};

module.exports = { cache, stats, recordHit, recordMiss, recordInvalidation, getStats };
