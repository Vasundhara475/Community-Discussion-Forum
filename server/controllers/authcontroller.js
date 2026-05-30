// server/controllers/authController.js
// ─────────────────────────────────────────────────
// AUTHENTICATION CONTROLLER
// Handles register and login logic
// ─────────────────────────────────────────────────

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─────────────────────────────────────────────────
// HELPER: Generate JWT Token
// ─────────────────────────────────────────────────
const generateToken = (id) => {
  return jwt.sign(
    { id },                          // Payload: user ID
    process.env.JWT_SECRET,          // Secret key from .env
    { expiresIn: process.env.JWT_EXPIRE || '7d' }  // Token expires in 7 days
  );
};

// ─────────────────────────────────────────────────
// REGISTER USER
// POST /api/auth/register
// ─────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if all fields are provided
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username, email, and password',
      });
    }

    // Check if email already exists
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Check if username already exists
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken',
      });
    }

    // Create new user in database
    // Password will be automatically hashed by the pre-save middleware in User model
    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password,
    });

    // Generate JWT token for the new user
    const token = generateToken(user._id);

    // Send response with token
    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.getAvatarUrl(),
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
    });
  }
};

// ─────────────────────────────────────────────────
// LOGIN USER
// POST /api/auth/login
// ─────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check fields are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user by email — include password field (hidden by default via select: false)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated',
      });
    }

    // Compare entered password with hashed password in database
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Send response
    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.getAvatarUrl(),
        role: user.role,
        bio: user.bio,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
};

// ─────────────────────────────────────────────────
// GET CURRENT USER (Me)
// GET /api/auth/me
// Protected route — requires JWT token
// ─────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.getAvatarUrl(),
        role: user.role,
        bio: user.bio,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

module.exports = { register, login, getMe };