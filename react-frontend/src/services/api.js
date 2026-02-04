import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Posts API
export const postsApi = {
  getAll: (params = {}) => api.get('/posts/', { params }),
  getById: (id) => api.get(`/posts/${id}/`),
  create: (data) => api.post('/posts/', data),
  update: (id, data) => api.put(`/posts/${id}/`, data),
  delete: (id) => api.delete(`/posts/${id}/`),
  like: (id) => api.post(`/posts/${id}/like/`),
  unlike: (id) => api.post(`/posts/${id}/unlike/`),
};

// Comments API
export const commentsApi = {
  getByPost: (postId) => api.get(`/posts/${postId}/comments/`),
  create: (postId, data) => api.post(`/posts/${postId}/comments/`, data),
  like: (id) => api.post(`/comments/${id}/like/`),
  unlike: (id) => api.post(`/comments/${id}/unlike/`),
  delete: (id) => api.delete(`/comments/${id}/`),
};

// Leaderboard API
export const leaderboardApi = {
  getTop: (limit = 5) => api.get('/leaderboard/', { params: { limit } }),
};

// Users API
export const usersApi = {
  getById: (id) => api.get(`/users/${id}/`),
  getMe: () => api.get('/users/me/'),
};

export default api;
