import apiClient from './api';
import { AuthResponse } from '../types';

export const authService = {
  sendCode: async (phoneNumber: string) => {
    const response = await apiClient.post('/auth/send-code', { phoneNumber });
    return response.data;
  },
  
  verifyCode: async (phoneNumber: string, code: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/verify-code', { phoneNumber, code });
    return response.data;
  },
  
  deleteAccount: async (): Promise<void> => {
    await apiClient.delete('/auth/delete-account');
  },
};

