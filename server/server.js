// server/server.js
// ─────────────────────────────────────────────────
// MAIN SERVER FILE
// This is where everything starts.
// ─────────────────────────────────────────────────

const express = require('express');
const http = require('http');          // Node's built-in HTTP module
const cors = require('cors');           // Allow cross-origin requests
const dotenv = require('dotenv');       // Load .env variables
const { Server } = require('socket.io'); // Socket.IO for real-time chat

// Load environment variables FIRST before anything else
dotenv.config();

// Import database connection function
const connectDB = require('./config/db');

// Import all route files
const authRoutes = require('./routes/authRoutes');
const discussionRoutes = require('./routes/discussionRoutes');
const commentRoutes = require('./routes/commentRoutes');
const messageRoutes = require('./routes/messageRoutes');
const userRoutes = require('./routes/userRoutes');

// Import Socket.IO handler
const initSocket = require('./sockets/socketHandler');

// Create Express application
const app = express();

// Create HTTP server (needed for Socket.IO)
const server = http.createServer(app);

// ─────────────────────────────────────────────────
// MIDDLEWARE SETUP
// Middleware runs on EVERY request before your routes
// ─────────────────────────────────────────────────

// Allow frontend (React at localhost:5173) to make requests to backend
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,  // Allow cookies
}));

// Parse incoming JSON request bodies
// Without this, req.body would be undefined
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────────
// API ROUTES
// All routes are prefixed with /api
// ─────────────────────────────────────────────────

app.use('/api/auth', authRoutes);           // /api/auth/register, /api/auth/login
app.use('/api/discussions', discussionRoutes); // /api/discussions
app.use('/api/comments', commentRoutes);    // /api/comments
app.use('/api/messages', messageRoutes);    // /api/messages
app.use('/api/users', userRoutes);          // /api/users

// Test route — visit http://localhost:5000/api in browser to verify server is running
app.get('/api', (req, res) => {
  res.json({ 
    message: '🚀 Community Forum API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ─────────────────────────────────────────────────
// GLOBAL ERROR HANDLER
// Catches any errors that weren't handled in routes
// ─────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ─────────────────────────────────────────────────
// 404 HANDLER
// Runs when no route matches the request
// ─────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ─────────────────────────────────────────────────
// SOCKET.IO SETUP
// Initialize real-time chat functionality
// ─────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Pass io to our socket handler
initSocket(io);

// ─────────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

// Connect to MongoDB, then start listening
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`\n✅ Server running on http://localhost:${PORT}`);
    console.log(`✅ API available at http://localhost:${PORT}/api`);
    console.log(`✅ Socket.IO ready for real-time connections\n`);
  });
}).catch((err) => {
  console.error('❌ Failed to connect to database:', err);
  process.exit(1);
});