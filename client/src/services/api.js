// client/src/services/api.js
// ─────────────────────────────────────────────────
// API SERVICE
// All backend API calls in one place
// ─────────────────────────────────────────────────

import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Automatically add JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── AUTH ──────────────────────────────────────────
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// ── DISCUSSIONS ───────────────────────────────────
export const getDiscussions = (params) => API.get('/discussions', { params });
export const getDiscussion = (id) => API.get(`/discussions/${id}`);
export const createDiscussion = (data) => API.post('/discussions', data);
export const updateDiscussion = (id, data) => API.put(`/discussions/${id}`, data);
export const deleteDiscussion = (id) => API.delete(`/discussions/${id}`);
export const voteDiscussion = (id, type) => API.post(`/discussions/${id}/vote`, { type });

// ── COMMENTS ──────────────────────────────────────
export const getComments = (discussionId) => API.get(`/comments/${discussionId}`);
export const addComment = (discussionId, data) => API.post(`/comments/${discussionId}`, data);
export const deleteComment = (id) => API.delete(`/comments/${id}`);

// ── MESSAGES ──────────────────────────────────────
export const getMessages = (room) => API.get(`/messages/${room}`);

// ── USERS ─────────────────────────────────────────
export const getUserProfile = (username) => API.get(`/users/${username}`);
export const updateProfile = (data) => API.put('/users/profile', data);
export const getDashboard = () => API.get('/users/dashboard');

export default API;