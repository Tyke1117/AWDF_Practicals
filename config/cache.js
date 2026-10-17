const NodeCache = require("node-cache");

const defaultTTL = process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL, 10) : 60;

/**
 * Shared NodeCache instance with standard TTL of 60 seconds (or from env).
 * checkperiod: automatic deletion check interval in seconds (120s).
 */
const cache = new NodeCache({
  stdTTL: defaultTTL,
  checkperiod: 120,
  useClones: true // Ensures cached objects cannot be mutated externally
});

// Custom statistics tracker for supplementary problem requirement
cache.metrics = {
  hits: 0,
  misses: 0,
  sets: 0,
  deletes: 0,
  lastInvalidationTime: null,
  history: []
};

/**
 * Increment cache hit counter and log event
 */
cache.recordHit = function (key) {
  this.metrics.hits++;
  if (this.metrics.history.length > 50) this.metrics.history.shift();
  this.metrics.history.push({
    event: "HIT",
    key,
    timestamp: new Date().toISOString()
  });
};

/**
 * Increment cache miss counter and log event
 */
cache.recordMiss = function (key) {
  this.metrics.misses++;
  if (this.metrics.history.length > 50) this.metrics.history.shift();
  this.metrics.history.push({
    event: "MISS",
    key,
    timestamp: new Date().toISOString()
  });
};

/**
 * Invalidate cache key(s) and record event
 */
cache.invalidate = function (keys) {
  const keysArray = Array.isArray(keys) ? keys : [keys];
  const count = this.del(keysArray);
  this.metrics.deletes += count;
  this.metrics.lastInvalidationTime = new Date().toISOString();
  if (this.metrics.history.length > 50) this.metrics.history.shift();
  this.metrics.history.push({
    event: "INVALIDATE",
    keys: keysArray,
    deletedCount: count,
    timestamp: new Date().toISOString()
  });
  return count;
};

/**
 * Get detailed statistics for debugging endpoint
 */
cache.getDetailedStats = function () {
  const nodeStats = this.getStats();
  const keys = this.keys();
  const totalRequests = this.metrics.hits + this.metrics.misses;
  const hitRatio = totalRequests > 0 ? ((this.metrics.hits / totalRequests) * 100).toFixed(2) + "%" : "0.00%";

  return {
    ttlSeconds: defaultTTL,
    activeKeysCount: keys.length,
    activeKeys: keys,
    metrics: {
      hits: this.metrics.hits,
      misses: this.metrics.misses,
      totalRequests,
      hitRatio,
      sets: this.metrics.sets,
      deletes: this.metrics.deletes,
      lastInvalidationTime: this.metrics.lastInvalidationTime
    },
    nodeCacheInternal: nodeStats,
    recentEvents: this.metrics.history.slice(-10).reverse()
  };
};

/**
 * Reset all tracking metrics
 */
cache.resetMetrics = function () {
  this.metrics.hits = 0;
  this.metrics.misses = 0;
  this.metrics.sets = 0;
  this.metrics.deletes = 0;
  this.metrics.lastInvalidationTime = null;
  this.metrics.history = [];
  this.flushAll();
};

module.exports = cache;
