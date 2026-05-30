// server/models/Comment.js
// ─────────────────────────────────────────────────
// COMMENT MODEL
// Replies to discussion posts
// ─────────────────────────────────────────────────

const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    // The comment text
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      minlength: [1, 'Comment cannot be empty'],
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
      trim: true,
    },

    // Who wrote this comment
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Which discussion this comment belongs to
    discussion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Discussion',
      required: true,
    },

    // For nested replies (optional — reply to another comment)
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },

    // Upvotes on the comment
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // Is comment deleted? (soft delete — keep in DB but hide)
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;