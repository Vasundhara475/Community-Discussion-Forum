// client/src/sockets/socket.js
// ─────────────────────────────────────────────────
// SOCKET.IO CLIENT
// Creates the real-time connection to our backend
// ─────────────────────────────────────────────────

import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Create socket instance
// We do NOT auto-connect — we connect manually when user logs in
let socket = null;

export const getSocket = () => socket;

export const connectSocket = (token) => {
  if (socket) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    auth: {
      token, // Send JWT token for authentication
    },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('🟢 Socket connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔴 Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};