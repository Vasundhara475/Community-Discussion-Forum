// server/controllers/discussionController.js
// ─────────────────────────────────────────────────
// DISCUSSION CONTROLLER
// CRUD operations for forum discussions
// ─────────────────────────────────────────────────

const Discussion = require('../models/Discussion');
const User = require('../models/User');

// ─────────────────────────────────────────────────
// GET ALL DISCUSSIONS
// GET /api/discussions
// Public route — anyone can see discussions
// ─────────────────────────────────────────────────
const getDiscussions = async (req, res) => {
  try {
    // Get query parameters for filtering and pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const search = req.query.search;
    const tag = req.query.tag;

    // Build filter object
    let filter = {};
    if (category) filter.category = category;
    if (tag) filter.tags = tag;
    if (search) {
      filter.$text = { $search: search }; // Full-text search
    }

    // Fetch discussions from database
    const discussions = await Discussion.find(filter)
      .populate('author', 'username avatar')  // Get author's name and avatar
      .sort({ isPinned: -1, createdAt: -1 })   // Pinned first, then newest
      .skip(skip)
      .limit(limit)
      .lean(); // .lean() returns plain JS objects (faster)

    // Get total count for pagination
    const total = await Discussion.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: discussions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get discussions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────
// GET SINGLE DISCUSSION
// GET /api/discussions/:id
// ─────────────────────────────────────────────────
const getDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate('author', 'username avatar bio createdAt')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username avatar',
        },
        match: { isDeleted: false }, // Don't show deleted comments
        options: { sort: { createdAt: 1 } }, // Oldest comments first
      });

    if (!discussion) {
      return res.status(404).json({ 
        success: false, 
        message: 'Discussion not found' 
      });
    }

    // Increment view counter
    await Discussion.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.status(200).json({ success: true, data: discussion });
  } catch (error) {
    console.error('Get discussion error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────
// CREATE DISCUSSION
// POST /api/discussions
// Protected route — must be logged in
// ─────────────────────────────────────────────────
const createDiscussion = async (req, res) => {
  try {
    const { title, content, tags, category } = req.body;

    if (!title || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and content are required' 
      });
    }

    // Parse tags — can be "javascript,react" or ["javascript", "react"]
    let parsedTags = [];
    if (tags) {
      if (typeof tags === 'string') {
        parsedTags = tags.split(',').map(t => t.trim().toLowerCase());
      } else {
        parsedTags = tags;
      }
    }

    // Create the discussion
    const discussion = await Discussion.create({
      title,
      content,
      tags: parsedTags,
      category: category || 'general',
      author: req.user.id,  // req.user is set by protect middleware
    });

    // Add discussion reference to user's discussion list
    await User.findByIdAndUpdate(req.user.id, {
      $push: { discussions: discussion._id },
    });

    // Populate author info before sending response
    await discussion.populate('author', 'username avatar');

    res.status(201).json({
      success: true,
      message: 'Discussion created successfully!',
      data: discussion,
    });
  } catch (error) {
    console.error('Create discussion error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────
// UPDATE DISCUSSION
// PUT /api/discussions/:id
// Protected — only author can update
// ─────────────────────────────────────────────────
const updateDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion not found' });
    }

    // Check if user is the author
    if (discussion.author.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this discussion' 
      });
    }

    const { title, content, tags, category } = req.body;

    const updated = await Discussion.findByIdAndUpdate(
      req.params.id,
      { title, content, tags, category },
      { new: true, runValidators: true }  // Return updated doc
    ).populate('author', 'username avatar');

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('Update discussion error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────
// DELETE DISCUSSION
// DELETE /api/discussions/:id
// Protected — only author or admin can delete
// ─────────────────────────────────────────────────
const deleteDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion not found' });
    }

    // Allow author OR admin to delete
    if (
      discussion.author.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this discussion' 
      });
    }

    await Discussion.findByIdAndDelete(req.params.id);

    // Remove from user's discussions list
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { discussions: discussion._id },
    });

    res.status(200).json({ success: true, message: 'Discussion deleted successfully' });
  } catch (error) {
    console.error('Delete discussion error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────
// VOTE ON DISCUSSION
// POST /api/discussions/:id/vote
// Protected route
// ─────────────────────────────────────────────────
const voteDiscussion = async (req, res) => {
  try {
    const { type } = req.body; // 'upvote' or 'downvote'
    const userId = req.user.id;
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion not found' });
    }

    // Remove existing votes by this user first
    await Discussion.findByIdAndUpdate(req.params.id, {
      $pull: { upvotes: userId, downvotes: userId },
    });

    // Add new vote
    const voteField = type === 'upvote' ? 'upvotes' : 'downvotes';
    const updated = await Discussion.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { [voteField]: userId } }, // $addToSet prevents duplicates
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: {
        upvotes: updated.upvotes.length,
        downvotes: updated.downvotes.length,
        voteScore: updated.upvotes.length - updated.downvotes.length,
      },
    });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getDiscussions,
  getDiscussion,
  createDiscussion,
  updateDiscussion,
  deleteDiscussion,
  voteDiscussion,
};