import api from './api';

const userService = {
  // Get user profile
  getUserProfile: async () => {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch profile';
    }
  },

  // Update user profile
  updateUserProfile: async (userData) => {
    try {
      const response = await api.put('/users/me', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update profile';
    }
  },
};

export default userService;
