/**
 * Custom request logger that tracks request method, URL, status, and duration
 */
const logger = (req, res, next) => {
  const start = process.hrtime();

  res.on("finish", () => {
    const diff = process.hrtime(start);
    const durationMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
    const cacheHeader = res.getHeader("X-Cache") || "NONE";

    console.log(
      `[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl} | Status: ${res.statusCode} | Time: ${durationMs}ms | Cache: ${cacheHeader}`
    );
  });

  next();
};

module.exports = logger;
