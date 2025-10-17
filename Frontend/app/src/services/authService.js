import api from './api';
import { jwtDecode } from 'jwt-decode';

const authService = {
  // Register new user
  signup: async (userData) => {
    try {
      console.log("AUTH-SERVICE: Sending signup request with data:", userData);
      const response = await api.post('/auth/register', userData);
      console.log("AUTH-SERVICE: Signup request successful, response:", response.data);
      return response.data.data;
    } catch (error) {
      console.error("AUTH-SERVICE: Signup request failed, error:", error.response?.data || error.message);
      throw error.response?.data?.message || 'Signup failed';
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      console.log("AUTH-SERVICE: Sending login request with credentials:", credentials);
      const response = await api.post('/auth/login', credentials);
      console.log("AUTH-SERVICE: Login request successful, response:", response.data);
      if (response.data.data.token) {
        const user = {
          id: response.data.data.id,
          username: response.data.data.username,
          email: response.data.data.email,
          role: response.data.data.role,
        };
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(user));
      }
      return response.data.data;
    } catch (error) {
      console.error("AUTH-SERVICE: Login request failed, error:", error.response?.data || error.message);
      throw error.response?.data?.message || 'Login failed';
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  },

  // Check if user is admin
  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user?.role === 'ADMIN';
  },
};

export default authService;
