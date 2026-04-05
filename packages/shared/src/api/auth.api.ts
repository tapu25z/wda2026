import { API_ENDPOINTS } from "../constants/api.constants";
import { axiosClient } from "./axios-client";

export const authApi = {
  login: async (body: { email: string; password: string }) => {
    const { data } = await axiosClient.post(API_ENDPOINTS.AUTH.LOGIN, body);
    return data as {
      accessToken: string;
      refreshToken: string;
      user: { id: string; email: string; fullName?: string; role?: string };
    };
  },

  register: async (body: {
    email: string;
    fullName: string;
    password: string;
  }) => {
    const { data } = await axiosClient.post(API_ENDPOINTS.AUTH.REGISTER, body);
    return data;
  },

  logout: async () => {
    await axiosClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  refresh: async (refreshToken: string) => {
    const { data } = await axiosClient.post(API_ENDPOINTS.AUTH.REFRESH, {
      refreshToken,
    });
    return data as { accessToken: string; refreshToken: string };
  },

  getProfile: async () => {
    const { data } = await axiosClient.get(API_ENDPOINTS.AUTH.PROFILE);
    return data as {
      id: string;
      email: string;
      fullName: string;
      role: string;
    };
  },
};
