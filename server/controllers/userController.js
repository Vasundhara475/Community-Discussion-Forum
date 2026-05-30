// server/controllers/userController.js

const User = require('../models/User');
const Discussion = require('../models/Discussion');

// GET USER PROFILE
// GET /api/users/:username
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate('discussions', 'title createdAt views upvotes downvotes comments')
      .select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('getUserProfile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// UPDATE PROFILE
// PUT /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const { username, bio, avatar } = req.body;

    if (username && username !== req.user.username) {
      const exists = await User.findOne({ username });
      if (exists) {
        return res.status(400).json({ success: false, message: 'Username taken' });
      }
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { username, bio, avatar },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET DASHBOARD STATS
// GET /api/users/dashboard
const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const myDiscussions = await Discussion.find({ author: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title views comments upvotes downvotes createdAt');

    const totalDiscussions = await Discussion.countDocuments({ author: userId });

    res.status(200).json({
      success: true,
      data: {
        recentDiscussions: myDiscussions,
        totalDiscussions,
        user: req.user,
      },
    });
  } catch (error) {
    console.error('getDashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getUserProfile, updateProfile, getDashboard };