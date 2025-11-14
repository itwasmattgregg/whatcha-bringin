import apiClient from './api';

export const feedbackService = {
  submitFeedback: async (data: {
    email: string;
    message: string;
    type?: 'praise' | 'bug' | 'feature-request' | 'other';
    recaptchaToken: string;
  }): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/feedback', data);
    return response.data;
  },
};

