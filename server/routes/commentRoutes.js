// server/routes/commentRoutes.js

const express = require('express');
const router = express.Router();
const { addComment, getComments, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:discussionId', getComments);          // Public
router.post('/:discussionId', protect, addComment); // Protected
router.delete('/:id', protect, deleteComment);      // Protected

module.exports = router;