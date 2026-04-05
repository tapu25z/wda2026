// packages/shared/src/types/weather.types.ts

// =============================================
// ENUMS
// =============================================

export type WeatherCategory = 'ALL' | 'FRUIT' | 'FLOWER' | 'VEGETABLE';
export type WeatherAdviceType = 'WARNING' | 'INFO' | 'RECOMMEND';

// =============================================
// REQUEST TYPES
// =============================================

export interface GetWeatherParams {
  lat: number;
  lon: number;
  category?: WeatherCategory;
}

// =============================================
// RESPONSE TYPES (mirror WeatherService output)
// =============================================

export interface CurrentWeather {
  timestamp: number;
  temp: number;
  feelsLike: number;
  humidity: number;
  uvi: number;
  windSpeed: number;
  weatherMain: string;
  weatherDescription: string;
  weatherIcon: string; // OWM icon code, dùng để render: https://openweathermap.org/img/wn/{icon}@2x.png
  sunrise: number;    
  sunset: number;     
  pressure: number;   
  windGust: number;   
  windDeg: number;    
  dewPoint: number;   
  visibility: number;
}

export interface HourlyWeather {
  timestamp: number;
  temp: number;
  humidity: number;
  pop: number;      // Xác suất mưa (0–100%)
  windSpeed: number;
  weatherIcon: string;
}

export interface DailyWeather {
  timestamp: number;
  tempDay: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  pop: number;      // Xác suất mưa (0–100%)
  windSpeed: number;
  uvi: number;
  weatherMain: string;
  weatherIcon: string;
  summary: string;    
  moonPhase: number;
}

export interface WeatherAdvice {
  adviceType: WeatherAdviceType;
  title: string;
  message: string;
  priority: number;
}

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyWeather[];  // 24 phần tử - 24 giờ tới
  daily: DailyWeather[];    // 8 phần tử - 8 ngày tới
}

export interface WeatherAndAdviceResponse {
  location: {
    lat: number;
    lon: number;
    timezone: string;
  };
  weatherData: WeatherData;
  advices: WeatherAdvice[];
}