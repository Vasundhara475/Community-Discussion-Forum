// server/routes/messageRoutes.js

const express = require('express');
const router = express.Router();
const { getMessages } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// Get chat history for a room — must be logged in
router.get('/:room', protect, getMessages);

module.exports = router;