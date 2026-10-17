const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Not authorized to access this route. No bearer token provided."
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "prac9_super_secret_jwt_key_2026");
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(401).json({ success: false, error: "User not found" });
    }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: "Invalid or expired authorization token" });
  }
};

// Optional auth: sets req.user if token present, proceeds if not
exports.optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "prac9_super_secret_jwt_key_2026");
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (err) {
    req.user = null;
    next();
  }
};
