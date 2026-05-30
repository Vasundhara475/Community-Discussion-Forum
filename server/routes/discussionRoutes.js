// server/routes/discussionRoutes.js

const express = require('express');
const router = express.Router();
const {
  getDiscussions,
  getDiscussion,
  createDiscussion,
  updateDiscussion,
  deleteDiscussion,
  voteDiscussion,
} = require('../controllers/discussionController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getDiscussions);
router.get('/:id', getDiscussion);

// Protected routes — login required
router.post('/', protect, createDiscussion);
router.put('/:id', protect, updateDiscussion);
router.delete('/:id', protect, deleteDiscussion);
router.post('/:id/vote', protect, voteDiscussion);

module.exports = router;