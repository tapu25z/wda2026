import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import { getTokenStorage } from "./token-manager";
import { API_ENDPOINTS } from "../constants/api.constants";

const BASE_URL =
  (typeof process !== "undefined" &&
    (process.env.NEXT_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL)) ||
  "http://localhost:4000";

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 60_000,
});

axiosClient.interceptors.request.use(async (config) => {
  const storage = getTokenStorage();
  if (storage) {
    const accessToken = await Promise.resolve(storage.getAccessToken());
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };
    const storage = getTokenStorage();

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url &&
      !String(originalRequest.url).includes(API_ENDPOINTS.AUTH.REFRESH)
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = await Promise.resolve(storage?.getRefreshToken());
        if (!refreshToken) throw new Error("No refresh token");

        const res = await axios.post(`${BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
          refreshToken,
        });
        const { accessToken, refreshToken: newRefresh } = res.data;
        await Promise.resolve(
          storage?.saveTokens(accessToken, newRefresh ?? refreshToken),
        );
        originalRequest.headers = originalRequest.headers ?? {};
        (originalRequest.headers as Record<string, string>).Authorization =
          `Bearer ${accessToken}`;
        return axiosClient(originalRequest);
      } catch {
        await Promise.resolve(storage?.clearTokens());
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);
