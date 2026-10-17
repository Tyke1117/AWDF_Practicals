/**
 * In-Memory Sliding-Window Rate Limiter Middleware for AI Generation Endpoints
 * Supplementary Problem 2: Max 5 requests/minute per client IP to protect API quotas.
 */

const requestCounts = new Map();

/**
 * Creates a rate limiter middleware
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds (default: 60,000ms = 1 min)
 * @param {number} options.max - Max requests allowed per window per IP (default: 5)
 */
function createRateLimiter(options = {}) {
  const windowMs = options.windowMs || 60 * 1000; // 1 minute
  const max = options.max || parseInt(process.env.AI_RATE_LIMIT_PER_MINUTE, 10) || 5;

  // Periodic cleanup of stale IP records every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of requestCounts.entries()) {
      if (now - record.startTime > windowMs) {
        requestCounts.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref();

  return (req, res, next) => {
    const clientKey = req.ip || req.connection.remoteAddress || "localhost";
    const now = Date.now();

    let record = requestCounts.get(clientKey);

    if (!record || now - record.startTime > windowMs) {
      record = {
        count: 1,
        startTime: now
      };
      requestCounts.set(clientKey, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, max - record.count);
    const resetTime = Math.ceil((record.startTime + windowMs - now) / 1000);

    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", resetTime);

    if (record.count > max) {
      return res.status(429).json({
        success: false,
        error: `Rate limit exceeded: Max ${max} AI requests per minute. Retry in ${resetTime}s.`,
        retryAfter: resetTime,
        fallback: false
      });
    }

    next();
  };
}

module.exports = {
  aiRateLimiter: createRateLimiter({ windowMs: 60 * 1000, max: 5 }),
  createRateLimiter
};
