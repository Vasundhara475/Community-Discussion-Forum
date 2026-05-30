// server/models/User.js
// ─────────────────────────────────────────────────
// USER MODEL
// Blueprint for user documents in MongoDB
// ─────────────────────────────────────────────────

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // User's display name
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
    },

    // Email address
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email',
      ],
    },

    // Password
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },

    // Profile picture
    avatar: {
      type: String,
      default: '',
    },

    // User bio
    bio: {
      type: String,
      maxlength: [200, 'Bio cannot exceed 200 characters'],
      default: '',
    },

    // User role
    role: {
      type: String,
      enum: ['user', 'moderator', 'admin'],
      default: 'user',
    },

    // Active account status
    isActive: {
      type: Boolean,
      default: true,
    },

    // Discussions created by user
    discussions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Discussion',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// ─────────────────────────────────────────────────
// HASH PASSWORD BEFORE SAVING
// ─────────────────────────────────────────────────
userSchema.pre('save', async function () {

  // Only hash password if modified
  if (!this.isModified('password')) {
    return;
  }

  // Generate salt
  const salt = await bcrypt.genSalt(10);

  // Hash password
  this.password = await bcrypt.hash(this.password, salt);
});

// ─────────────────────────────────────────────────
// COMPARE PASSWORD METHOD
// ─────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ─────────────────────────────────────────────────
// GET AVATAR URL METHOD
// ─────────────────────────────────────────────────
userSchema.methods.getAvatarUrl = function () {

  // Return uploaded avatar if exists
  if (this.avatar) {
    return this.avatar;
  }

  // Otherwise generate avatar
  return `https://api.dicebear.com/7.x/initials/svg?seed=${this.username}`;
};

// Create model
const User = mongoose.model('User', userSchema);

module.exports = User;