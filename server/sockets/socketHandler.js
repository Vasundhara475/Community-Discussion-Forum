// server/sockets/socketHandler.js
// ─────────────────────────────────────────────────
// SOCKET.IO EVENT HANDLER
// Manages real-time chat rooms
//
// How it works:
// 1. User opens chat → connects to socket server
// 2. User joins a "room" (each discussion has its own room)
// 3. User sends message → socket receives it → broadcasts to all in room
// 4. All users in room instantly see the message
// ─────────────────────────────────────────────────

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');

// Track online users: { socketId: { userId, username, room } }
const onlineUsers = new Map();

const initSocket = (io) => {
  // ─────────────────────────────────────────────
  // MIDDLEWARE: Authenticate socket connection
  // Runs when a client first connects
  // ─────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new Error('User not found'));
      }

      // Attach user to socket object for use in events
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  // ─────────────────────────────────────────────
  // CONNECTION EVENT
  // Fires when a client successfully connects
  // ─────────────────────────────────────────────
  io.on('connection', (socket) => {
    console.log(`🟢 User connected: ${socket.user.username} (${socket.id})`);

    // ─────────────────────────────────────────────
    // JOIN ROOM EVENT
    // User clicks on a discussion → joins its chat room
    // ─────────────────────────────────────────────
    socket.on('join_room', async ({ room }) => {
      // Leave any previous rooms (except default socket room)
      const rooms = Array.from(socket.rooms).filter(r => r !== socket.id);
      rooms.forEach(r => socket.leave(r));

      // Join the new room
      socket.join(room);

      // Track user in online users map
      onlineUsers.set(socket.id, {
        userId: socket.user._id.toString(),
        username: socket.user.username,
        avatar: socket.user.getAvatarUrl(),
        room,
      });

      console.log(`👤 ${socket.user.username} joined room: ${room}`);

      // Notify room that someone joined
      socket.to(room).emit('user_joined', {
        userId: socket.user._id,
        username: socket.user.username,
        avatar: socket.user.getAvatarUrl(),
        message: `${socket.user.username} joined the chat`,
        timestamp: new Date(),
      });

      // Send list of online users in this room to the joining user
      const roomUsers = Array.from(onlineUsers.values())
        .filter(u => u.room === room);

      socket.emit('room_users', roomUsers);
    });

    // ─────────────────────────────────────────────
    // SEND MESSAGE EVENT
    // User types and sends a message
    // ─────────────────────────────────────────────
    socket.on('send_message', async ({ room, content }) => {
      try {
        if (!content || !content.trim()) return;

        // Save message to database for history
        const message = await Message.create({
          content: content.trim(),
          sender: socket.user._id,
          room,
          type: 'text',
        });

        // Prepare message data to send to all users in room
        const messageData = {
          _id: message._id,
          content: message.content,
          sender: {
            _id: socket.user._id,
            username: socket.user.username,
            avatar: socket.user.getAvatarUrl(),
          },
          room,
          createdAt: message.createdAt,
        };

        // Broadcast to EVERYONE in room (including sender)
        // io.to() sends to all in room, socket.to() sends to all EXCEPT sender
        io.to(room).emit('receive_message', messageData);

        console.log(`💬 ${socket.user.username} in ${room}: ${content}`);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ─────────────────────────────────────────────
    // TYPING INDICATOR EVENT
    // Shows "username is typing..." to others
    // ─────────────────────────────────────────────
    socket.on('typing', ({ room, isTyping }) => {
      socket.to(room).emit('user_typing', {
        username: socket.user.username,
        isTyping,
      });
    });

    // ─────────────────────────────────────────────
    // LEAVE ROOM EVENT
    // ─────────────────────────────────────────────
    socket.on('leave_room', ({ room }) => {
      socket.leave(room);
      onlineUsers.delete(socket.id);

      socket.to(room).emit('user_left', {
        username: socket.user.username,
        message: `${socket.user.username} left the chat`,
        timestamp: new Date(),
      });

      console.log(`🔴 ${socket.user.username} left room: ${room}`);
    });

    // ─────────────────────────────────────────────
    // DISCONNECT EVENT
    // Fires when user closes tab or loses connection
    // ─────────────────────────────────────────────
    socket.on('disconnect', () => {
      const userInfo = onlineUsers.get(socket.id);

      if (userInfo) {
        // Notify the room
        socket.to(userInfo.room).emit('user_left', {
          username: userInfo.username,
          message: `${userInfo.username} disconnected`,
          timestamp: new Date(),
        });

        onlineUsers.delete(socket.id);
      }

      console.log(`🔴 User disconnected: ${socket.user.username} (${socket.id})`);
    });
  });

  console.log('✅ Socket.IO initialized');
};

module.exports = initSocket;