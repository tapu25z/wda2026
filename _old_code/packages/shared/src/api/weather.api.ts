// packages/shared/src/api/weather.api.ts

import { axiosClient } from './axios-client';
import { API_ENDPOINTS } from '../constants/api.constants';
import type { GetWeatherParams, WeatherAndAdviceResponse } from '../types/weather.types';

export const weatherApi = {
  /**
   * Lấy dữ liệu thời tiết chi tiết + lời khuyên nông nghiệp
   * từ tọa độ GPS và loại cây trồng của người dùng.
   *
   * @example
   * const data = await weatherApi.getWeatherAndAdvice({
   *   lat: 10.8231,
   *   lon: 106.6297,
   *   category: 'VEGETABLE',
   * });
   *
   * // Render icon OWM:
   * const iconUrl = `https://openweathermap.org/img/wn/${data.weatherData.current.weatherIcon}@2x.png`;
   */
  getWeatherAndAdvice: async (
    params: GetWeatherParams,
  ): Promise<WeatherAndAdviceResponse> => {
    const res = await axiosClient.get<WeatherAndAdviceResponse>(
      API_ENDPOINTS.WEATHER.GET_WEATHER,
      { params }, // axios encode thành: ?lat=...&lon=...&category=...
    );
    return res.data; // ✅ unwrap AxiosResponse — đúng pattern của scan.api.ts
  },
};