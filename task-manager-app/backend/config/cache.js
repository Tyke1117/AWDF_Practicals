// backend/config/cache.js - In-Memory Cache configuration
const cache = new Map();

module.exports = {
  get: (key) => cache.get(key),
  set: (key, val, ttlSeconds = 60) => {
    cache.set(key, val);
    setTimeout(() => cache.delete(key), ttlSeconds * 1000);
  },
  del: (key) => cache.delete(key),
  flush: () => cache.clear()
};
