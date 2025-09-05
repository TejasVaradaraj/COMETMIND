import api from './authService';

export const progressService = {
  async saveProgress(data) {
    try {
      const response = await api.post('/api/progress/save', data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to save progress');
    }
  },

  async getDashboardData() {
    try {
      const response = await api.get('/api/progress/dashboard');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch dashboard data');
    }
  }
};