/**
 * Centralized error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error(`[Server Error] ${err.stack || err.message}`);

  // Mongoose Bad ObjectId (CastError)
  if (err.name === "CastError") {
    const message = `Resource not found with invalid ID format: ${err.value}`;
    return res.status(404).json({ success: false, error: message });
  }

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message).join(", ");
    return res.status(400).json({ success: false, error: message });
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    return res.status(400).json({ success: false, error: message });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Internal Server Error"
  });
};

module.exports = errorHandler;
