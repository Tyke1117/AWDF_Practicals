/**
 * Global Express error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${err.message}`, err.stack);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || "Internal Server Error";

  // Mongoose CastError (e.g. invalid ObjectId format)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Resource not found or invalid ID format: ${err.value}`;
  }

  // Mongoose ValidationError
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack
  });
};

module.exports = errorHandler;
