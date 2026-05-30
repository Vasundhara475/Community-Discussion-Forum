// server/models/Discussion.js
// ─────────────────────────────────────────────────
// DISCUSSION MODEL
// Blueprint for forum discussion posts
// ─────────────────────────────────────────────────

const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema(
  {
    // Discussion title
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },

    // Discussion body content
    content: {
      type: String,
      required: [true, 'Content is required'],
      minlength: [10, 'Content must be at least 10 characters'],
    },

    // Author — references User model
    // This creates a relationship between Discussion and User
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',           // 'User' is the model name from User.js
      required: true,
    },

    // Category tags like ['javascript', 'react', 'help']
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    // Category type
    category: {
      type: String,
      enum: ['general', 'help', 'showcase', 'offtopic', 'announcement'],
      default: 'general',
    },

    // Users who upvoted
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // Users who downvoted
    downvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // Comments on this discussion
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],

    // View counter
    views: {
      type: Number,
      default: 0,
    },

    // Is discussion pinned to top?
    isPinned: {
      type: Boolean,
      default: false,
    },

    // Is discussion locked (no new comments)?
    isLocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    // Add virtual fields (computed values not stored in DB)
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─────────────────────────────────────────────────
// VIRTUAL: Calculate vote score
// Virtuals are computed — not stored in database
// ─────────────────────────────────────────────────
discussionSchema.virtual('voteScore').get(function () {
  return this.upvotes.length - this.downvotes.length;
});

// ─────────────────────────────────────────────────
// VIRTUAL: Count comments
// ─────────────────────────────────────────────────
discussionSchema.virtual('commentCount').get(function () {
  return this.comments.length;
});

// Index for faster search queries
discussionSchema.index({ title: 'text', content: 'text', tags: 'text' });
discussionSchema.index({ createdAt: -1 }); // Sort by newest first

const Discussion = mongoose.model('Discussion', discussionSchema);

module.exports = Discussion;