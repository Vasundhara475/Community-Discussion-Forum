// server/middleware/authMiddleware.js
// ─────────────────────────────────────────────────
// JWT AUTHENTICATION MIDDLEWARE
// Protects routes — only logged-in users can access them
// ─────────────────────────────────────────────────

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // JWT tokens are sent in the Authorization header as:
  // Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // Verify token using our secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database (without password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      // Call next() to proceed to the actual route handler
      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized — invalid token' 
      });
    }
  }

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized — no token provided' 
    });
  }
};

module.exports = { protect };