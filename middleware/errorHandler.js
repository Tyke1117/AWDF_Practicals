// Converts raw Mongoose/Express errors into a clean, structured JSON response.
function errorHandler(err, req, res, next) {
  console.error(err);

  // Mongoose validation error (e.g. missing required field, bad enum value)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      error: 'Validation failed',
      details: messages,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      error: 'Duplicate field value',
      details: err.keyValue,
    });
  }

  // Mongoose invalid ObjectId format
  if (err.name === 'CastError') {
    return res.status(404).json({
      error: 'Task not found (invalid ID format)',
    });
  }

  // Fallback: generic 500
  res.status(500).json({
    error: 'Internal server error',
  });
}

module.exports = errorHandler;
