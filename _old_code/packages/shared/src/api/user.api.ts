import { axiosClient } from './axios-client';

export const userApi = {
  upgradePlan: async (plan: 'PREMIUM' | 'VIP') => {
    const response = await axiosClient.post('/users/upgrade', { plan });
    return response.data as {
      message: string;
      plan: string;
      expiresAt: string | null;
    };
  },
};
