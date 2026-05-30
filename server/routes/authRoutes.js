// server/routes/authRoutes.js
// ─────────────────────────────────────────────────
// AUTH ROUTES
// POST /api/auth/register → register new user
// POST /api/auth/login    → login and get token
// GET  /api/auth/me       → get current user (protected)
// ─────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes — no login required
router.post('/register', register);
router.post('/login', login);

// Protected route — must be logged in
router.get('/me', protect, getMe);

module.exports = router;