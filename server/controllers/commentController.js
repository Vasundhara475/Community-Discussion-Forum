// server/controllers/commentController.js
// ─────────────────────────────────────────────────
// COMMENT CONTROLLER
// ─────────────────────────────────────────────────

const Comment = require('../models/Comment');
const Discussion = require('../models/Discussion');

// ADD COMMENT
// POST /api/comments/:discussionId
const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const discussionId = req.params.discussionId;

    if (!content) {
      return res.status(400).json({ success: false, message: 'Comment content required' });
    }

    // Check discussion exists
    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion not found' });
    }

    // Check if discussion is locked
    if (discussion.isLocked) {
      return res.status(403).json({ success: false, message: 'Discussion is locked' });
    }

    // Create comment
    const comment = await Comment.create({
      content,
      author: req.user.id,
      discussion: discussionId,
    });

    // Add comment reference to discussion
    await Discussion.findByIdAndUpdate(discussionId, {
      $push: { comments: comment._id },
    });

    // Populate author info
    await comment.populate('author', 'username avatar');

    res.status(201).json({
      success: true,
      message: 'Comment added!',
      data: comment,
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET COMMENTS FOR A DISCUSSION
// GET /api/comments/:discussionId
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      discussion: req.params.discussionId,
      isDeleted: false,
    })
      .populate('author', 'username avatar')
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE COMMENT
// DELETE /api/comments/:id
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // Only author or admin can delete
    if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Soft delete — mark as deleted instead of removing from DB
    comment.isDeleted = true;
    await comment.save();

    res.status(200).json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { addComment, getComments, deleteComment };