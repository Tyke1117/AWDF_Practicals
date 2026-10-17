/**
 * Request Logger Middleware
 * Logs incoming HTTP method, URL, status code, and latency
 */
const logger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const userTag = req.user ? `[User:${req.user.id.slice(-6)}]` : "[Guest]";
    console.log(
      `[${timestamp}] ${req.method.padEnd(6)} ${req.originalUrl} -> ${res.statusCode} (${duration}ms) ${userTag}`
    );
  });

  next();
};

module.exports = logger;
