import api from './api';

const quizService = {
  // Get all quizzes
  getAllQuizzes: async () => {
    try {
      const response = await api.get('/quizzes');
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch quizzes';
    }
  },

  // Get quiz by ID
  getQuizById: async (quizId) => {
    try {
      const response = await api.get(`/quizzes/${quizId}`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch quiz';
    }
  },

  // Create new quiz (Admin only)
  createQuiz: async (quizData) => {
    try {
      const response = await api.post('/quizzes', quizData);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to create quiz';
    }
  },

  // Update quiz (Admin only)
  updateQuiz: async (quizId, quizData) => {
    try {
      const response = await api.put(`/quizzes/${quizId}`, quizData);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update quiz';
    }
  },

  // Delete quiz (Admin only)
  deleteQuiz: async (quizId) => {
    try {
      const response = await api.delete(`/quizzes/${quizId}`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to delete quiz';
    }
  },

  // Get questions for a quiz
  getQuizQuestions: async (quizId) => {
    try {
      const response = await api.get(`/questions/quiz/${quizId}`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch questions';
    }
  },

  // Start a quiz attempt
  startQuiz: async (quizId) => {
    try {
      const response = await api.post('/attempts/start', { quizId });
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to start quiz';
    }
  },

  // Submit an answer
  submitAnswer: async (answerData) => {
    try {
      const response = await api.post('/attempts/submit-answer', answerData);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to submit answer';
    }
  },

  // Complete a quiz attempt
  completeQuiz: async (attemptId) => {
    try {
      const response = await api.post('/attempts/complete', { attemptId });
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to complete quiz';
    }
  },

  // Get user quiz history
  getUserQuizHistory: async () => {
    try {
      const response = await api.get('/attempts/my-attempts');
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch quiz history';
    }
  },

  // Get quiz leaderboard
  getQuizLeaderboard: async (quizId) => {
    try {
      const response = await api.get(`/leaderboard/quiz/${quizId}`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch leaderboard';
    }
  },

  // Get overall leaderboard
  getOverallLeaderboard: async () => {
    try {
      const response = await api.get('/leaderboard/global');
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch leaderboard';
    }
  },
};

export default quizService;
