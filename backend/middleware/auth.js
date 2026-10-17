const jwt = require("jsonwebtoken");

/**
 * Authentication Middleware
 * Validates the JWT token from the Authorization header (Bearer <token>)
 * Attaches decoded payload (user id, etc.) to req.user
 */
const protect = (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;

  // Check if Authorization header exists and follows 'Bearer <token>' format
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // Reject if token is missing
  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Access denied. No token provided. Include 'Authorization: Bearer <token>' header."
    });
  }

  try {
    // Verify token using secret key stored in environment variables
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded user information (e.g. { id, iat, exp }) to req.user
    req.user = decoded;
    next();
  } catch (err) {
    // Gracefully handle invalid, tampered, or expired tokens without crashing the server
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token has expired. Please log in again to continue."
      });
    }

    return res.status(401).json({
      success: false,
      error: "Invalid or malformed token. Authentication failed."
    });
  }
};

module.exports = { protect };
