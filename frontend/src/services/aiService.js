import api from './authService';

export const aiService = {
  async generateQuestion(topic, difficulty = 'medium', request = '') {
    try {
      const response = await api.post('/api/ai/generate_question', {
        topic,
        difficulty,
        request
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to generate question');
    }
  }
};