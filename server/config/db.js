// server/config/db.js
// ─────────────────────────────────────────────────
// DATABASE CONNECTION
// Connects our app to MongoDB
// ─────────────────────────────────────────────────

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // MONGO_URI comes from .env file
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);

    // Exit with failure if DB can't connect
    process.exit(1);
  }
};

module.exports = connectDB;