// server/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const { getUserProfile, updateProfile, getDashboard } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, getDashboard);
router.get('/:username', getUserProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;