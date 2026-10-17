const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${err.message}`, err.stack);
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || "Internal Server Error";

  if (err.name === "CastError") {
    statusCode = 400;
    message = `Resource not found with invalid ID: ${err.value}`;
  }

  res.status(statusCode).json({
    success: false,
    error: message
  });
};

module.exports = errorHandler;
