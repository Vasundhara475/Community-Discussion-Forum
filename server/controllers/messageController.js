// server/controllers/messageController.js
// ─────────────────────────────────────────────────
// MESSAGE CONTROLLER
// Handles chat message history
// ─────────────────────────────────────────────────

const Message = require('../models/Message');

// GET MESSAGES FOR A ROOM
// GET /api/messages/:room
const getMessages = async (req, res) => {
  try {
    const { room } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    // Get last 50 messages for this room
    const messages = await Message.find({ room })
      .populate('sender', 'username avatar')
      .sort({ createdAt: -1 }) // Newest first
      .limit(limit)
      .lean();

    // Reverse to show oldest first in chat
    messages.reverse();

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getMessages };