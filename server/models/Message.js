// server/models/Message.js
// ─────────────────────────────────────────────────
// MESSAGE MODEL
// Real-time chat messages in discussion rooms
// ─────────────────────────────────────────────────

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    // The chat message text
    content: {
      type: String,
      required: [true, 'Message cannot be empty'],
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
      trim: true,
    },

    // Who sent this message
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Which discussion room this message belongs to
    // Messages are organized by discussion rooms
    room: {
      type: String,
      required: true,
      // We'll use discussion ID as room name: "room_507f1f77bcf86cd799439011"
    },

    // Message type (text, image, system notification)
    type: {
      type: String,
      enum: ['text', 'system'],
      default: 'text',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster room message queries
messageSchema.index({ room: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;