import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';

import { WeatherRule, WeatherRuleDocument } from '@agri-scan/database';
// =============================================
// INTERFACES: Định nghĩa shape của dữ liệu OWM
// =============================================

interface OWMWeatherItem {
  main: string;
  description: string;
  icon: string;
}

interface OWMCurrentWeather {
  dt: number;
  sunrise: number; // THÊM
  sunset: number; // THÊM
  temp: number;
  feels_like: number;
  pressure: number; // THÊM
  humidity: number;
  dew_point: number; // THÊM
  uvi: number;
  visibility: number; // THÊM
  wind_speed: number;
  wind_gust?: number; // THÊM
  wind_deg: number; // THÊM
  weather: OWMWeatherItem[];
}

interface OWMHourlyWeather {
  dt: number;
  temp: number;
  humidity: number;
  pop: number; // Probability of precipitation (0.0 - 1.0)
  wind_speed: number;
  weather: OWMWeatherItem[];
  uvi: number;
  pressure: number;
}

interface OWMDailyWeather {
  dt: number;
  sunrise: number;
  sunset: number;
  moon_phase: number; // THÊM
  summary: string; // THÊM
  temp: { day: number; min: number; max: number };
  humidity: number;
  pop: number;
  wind_speed: number;
  uvi: number;
  weather: OWMWeatherItem[];
}

interface OWMOneCallResponse {
  lat: number;
  lon: number;
  timezone: string;
  current: OWMCurrentWeather;
  hourly: OWMHourlyWeather[];
  daily: OWMDailyWeather[];
}

// =============================================
// INTERFACES: Định nghĩa shape của response trả về
// =============================================

export interface FormattedCurrentWeather {
  timestamp: number;
  temp: number;
  feelsLike: number;
  humidity: number;
  uvi: number;
  windSpeed: number;
  weatherMain: string;
  weatherDescription: string;
  weatherIcon: string;
  sunrise: number;
  sunset: number;
  pressure: number;
  windGust: number;
  windDeg: number;
  dewPoint: number;
  visibility: number;
}

export interface FormattedHourlyWeather {
  timestamp: number;
  temp: number;
  humidity: number;
  pop: number;
  windSpeed: number;
  weatherIcon: string;
  uvi: number; // THÊM DÒNG NÀY
  pressure: number; // THÊM DÒNG NÀY
}

export interface FormattedDailyWeather {
  timestamp: number;
  tempDay: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  pop: number;
  windSpeed: number;
  uvi: number;
  weatherMain: string;
  weatherIcon: string;
  summary: string; // THÊM DÒNG NÀY
  moonPhase: number; // THÊM DÒNG NÀY
  sunrise: number; // 🔥 THÊM DÒNG NÀY
  sunset: number;
}

export interface WeatherAdvice {
  adviceType: 'WARNING' | 'INFO' | 'RECOMMEND';
  title: string;
  message: string;
  priority: number;
}

export interface WeatherAndAdviceResponse {
  location: { lat: number; lon: number; timezone: string };
  weatherData: {
    current: FormattedCurrentWeather;
    hourly: FormattedHourlyWeather[]; // 24 giờ tới
    daily: FormattedDailyWeather[]; // 8 ngày tới
  };
  advices: WeatherAdvice[];
  rules: WeatherRule[]; // Trả về cả rule để frontend có thể hiển thị nguồn gốc lời khuyên
}

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly OWM_BASE_URL = 'https://api.openweathermap.org/data/3.0';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectModel(WeatherRule.name)
    private readonly weatherRuleModel: Model<WeatherRuleDocument>,
  ) { }

  /**
   * Hàm chính: Lấy dữ liệu thời tiết từ OWM và tạo lời khuyên nông nghiệp
   * @param lat Vĩ độ
   * @param lon Kinh độ
   * @param category Loại cây trồng ('ALL' | 'FRUIT' | 'FLOWER' | 'VEGETABLE')
   */
  async getWeatherAndAdvice(
    lat: number,
    lon: number,
    category: string = 'ALL',
  ): Promise<WeatherAndAdviceResponse> {
    // --- BƯỚC 1: Song song hóa I/O - Gọi OWM API và query DB cùng lúc ---
    const [owmData, rules] = await Promise.all([
      this.fetchFromOpenWeatherMap(lat, lon),
      this.fetchActiveRules(category),
    ]);

    // --- BƯỚC 2: Format dữ liệu thô thành dạng gọn gàng cho Frontend ---
    const formattedWeather = this.formatWeatherData(owmData);

    // --- BƯỚC 3: Chạy Rule Engine để sinh lời khuyên ---
    const advices = this.runRuleEngine(owmData, rules);

    return {
      location: {
        lat: owmData.lat,
        lon: owmData.lon,
        timezone: owmData.timezone,
      },
      weatherData: formattedWeather,
      advices,
      rules,
    };
  }

  // ============================================================
  // PRIVATE METHODS: Tách biệt từng bước logic
  // ============================================================

  /**
   * Gọi OpenWeatherMap One Call API 3.0
   * Loại bỏ minutely và alerts để giảm payload
   */
  private async fetchFromOpenWeatherMap(
    lat: number,
    lon: number,
  ): Promise<OWMOneCallResponse> {
    const apiKey = this.configService.get<string>('OWM_API_KEY');

    if (!apiKey) {
      throw new InternalServerErrorException(
        'OWM_API_KEY chưa được cấu hình trong file .env',
      );
    }

    try {
      const url = `${this.OWM_BASE_URL}/onecall`;
      const { data } = await firstValueFrom(
        this.httpService.get<OWMOneCallResponse>(url, {
          params: {
            lat,
            lon,
            appid: apiKey,
            exclude: 'minutely,alerts',
            units: 'metric', // Celsius, m/s
          },
        }),
      );
      return data;
    } catch (error) {
      this.logger.error(
        `Lỗi khi gọi OpenWeatherMap API: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Không thể kết nối đến dịch vụ thời tiết. Vui lòng thử lại.',
      );
    }
  }

  /**
   * Lấy tất cả các luật đang active từ DB,
   * lọc theo category của người dùng (bao gồm luật 'ALL')
   */
  private async fetchActiveRules(category: string): Promise<WeatherRule[]> {
    try {
      // Lấy luật áp dụng cho tất cả ('ALL') VÀ luật riêng cho category được chọn
      const targetCategories = category === 'ALL' ? ['ALL'] : ['ALL', category];

      return this.weatherRuleModel
        .find({
          isActive: true,
          targetCategory: { $in: targetCategories },
        })
        .sort({ priority: -1 }) // Ưu tiên cao nhất lên trước
        .lean()
        .exec();
    } catch (error) {
      this.logger.error(`Lỗi khi truy vấn WeatherRule: ${error.message}`);
      return []; // Trả về mảng rỗng thay vì crash - vẫn trả được dữ liệu thời tiết
    }
  }

  /**
   * Format dữ liệu thô từ OWM thành cấu trúc gọn hơn cho Frontend
   */
  private formatWeatherData(raw: OWMOneCallResponse): {
    current: FormattedCurrentWeather;
    hourly: FormattedHourlyWeather[];
    daily: FormattedDailyWeather[];
  } {
    const current: FormattedCurrentWeather = {
      timestamp: raw.current.dt,
      temp: raw.current.temp,
      feelsLike: raw.current.feels_like,
      humidity: raw.current.humidity,
      uvi: raw.current.uvi,
      windSpeed: raw.current.wind_speed,
      weatherMain: raw.current.weather[0]?.main ?? 'Unknown',
      weatherDescription: raw.current.weather[0]?.description ?? '',
      weatherIcon: raw.current.weather[0]?.icon ?? '',
      sunrise: raw.current.sunrise, // BẠN TỪNG THIẾU DÒNG NÀY
      sunset: raw.current.sunset,
      pressure: raw.current.pressure,
      windGust: raw.current.wind_gust || 0,
      windDeg: raw.current.wind_deg,
      dewPoint: raw.current.dew_point,
      visibility: raw.current.visibility,
    };

    // Lấy 24 phần tử đầu tiên từ mảng hourly (24 giờ tới)
    const hourly: FormattedHourlyWeather[] = raw.hourly
      .slice(0, 24)
      .map((h) => ({
        timestamp: h.dt,
        temp: h.temp,
        humidity: h.humidity,
        pop: Math.round(h.pop * 100), // Đổi 0.0-1.0 → 0-100 (%) cho dễ hiển thị
        windSpeed: h.wind_speed,
        weatherIcon: h.weather[0]?.icon ?? '',
        uvi: h.uvi, // PHẢI CÓ DÒNG NÀY THÌ UV MỚI NHẢY
        pressure: h.pressure, // PHẢI CÓ DÒNG NÀY THÌ ÁP SUẤT MỚI NHẢY
      }));

    // Lấy 8 ngày tới từ mảng daily
    const daily: FormattedDailyWeather[] = raw.daily.slice(0, 8).map((d) => ({
      timestamp: d.dt,
      tempDay: d.temp.day,
      tempMin: d.temp.min,
      tempMax: d.temp.max,
      humidity: d.humidity,
      pop: Math.round(d.pop * 100),
      windSpeed: d.wind_speed,
      uvi: d.uvi,
      weatherMain: d.weather[0]?.main ?? 'Unknown',
      weatherIcon: d.weather[0]?.icon ?? '',
      summary: d.summary || 'Không có tóm tắt', // GÁN DỮ LIỆU VÀO ĐÂY
      moonPhase: d.moon_phase, // GÁN DỮ LIỆU VÀO ĐÂY
      sunrise: d.sunrise, // 🔥 THÊM DÒNG NÀY (Để lấy giờ mặt trời mọc)
      sunset: d.sunset,
    }));

    return { current, hourly, daily };
  }

  // ============================================================
  // ★ RULE ENGINE - THUẬT TOÁN CHÍNH ★
  //
  // Cơ chế hoạt động (Pattern: Data-Driven Rule Evaluation):
  //
  // 1. Tập hợp "điểm dữ liệu" đại diện từ dữ liệu thời tiết
  //    - current: 1 điểm (thời tiết hiện tại)
  //    - hourly: Lấy điểm tệ nhất (pop cao nhất, humidity cao nhất)
  //    - daily: Lấy ngày hôm nay (index 0)
  //
  // 2. Với mỗi Rule, tìm "điểm dữ liệu" phù hợp (theo dataSource)
  //
  // 3. Kiểm tra MỖI FIELD trong conditions (AND logic):
  //    - Nếu TẤT CẢ các field của conditions đều thỏa mãn → Rule kích hoạt
  //    - Nếu BẤT KỲ field nào không thỏa mãn → Rule bị bỏ qua
  //
  // 4. Dedup bằng Set<title> để tránh lời khuyên lặp lại
  // ============================================================
  private runRuleEngine(
    owmData: OWMOneCallResponse,
    rules: WeatherRule[],
  ): WeatherAdvice[] {
    const triggeredAdvices: WeatherAdvice[] = [];
    const triggeredTitles = new Set<string>(); // Guard chống duplicate

    // --- Chuẩn bị "điểm dữ liệu" đại diện cho từng dataSource ---

    // current: Trực tiếp từ dữ liệu hiện tại
    const currentDataPoint = {
      temp: owmData.current.temp,
      humidity: owmData.current.humidity,
      windSpeed: owmData.current.wind_speed,
      uvi: owmData.current.uvi,
      pop: 0, // current không có pop
      weatherMain: owmData.current.weather[0]?.main ?? '',
    };

    // hourly: Lấy "worst case" trong 24h tới (scenario tệ nhất)
    // Giúp cảnh báo sớm trước khi điều kiện xấu xảy ra
    const hourlyWorstCase = owmData.hourly.slice(0, 24).reduce(
      (worst, h) => ({
        temp: Math.max(worst.temp, h.temp), // Temp cao nhất
        humidity: Math.max(worst.humidity, h.humidity), // Humidity cao nhất
        windSpeed: Math.max(worst.windSpeed, h.wind_speed), // Gió mạnh nhất
        uvi: worst.uvi, // UVI không có trong hourly của OWM free
        pop: Math.max(worst.pop, h.pop), // Xác suất mưa cao nhất
        weatherMain:
          h.pop > worst.pop ? (h.weather[0]?.main ?? '') : worst.weatherMain,
      }),
      {
        temp: -Infinity,
        humidity: 0,
        windSpeed: 0,
        uvi: 0,
        pop: 0,
        weatherMain: '',
      },
    );

    // daily: Chỉ lấy ngày hôm nay (index 0) cho daily rules
    const todayDailyData = owmData.daily[0];
    const dailyDataPoint = todayDailyData
      ? {
        temp: todayDailyData.temp.day,
        humidity: todayDailyData.humidity,
        windSpeed: todayDailyData.wind_speed,
        uvi: todayDailyData.uvi,
        pop: todayDailyData.pop,
        weatherMain: todayDailyData.weather[0]?.main ?? '',
      }
      : null;

    // --- Duyệt qua từng Rule và kiểm tra điều kiện ---
    for (const rule of rules) {
      // Bước 1: Tìm điểm dữ liệu phù hợp với dataSource của rule
      let dataPoint: typeof currentDataPoint | null = null;

      if (rule.dataSource === 'current') {
        dataPoint = currentDataPoint;
      } else if (rule.dataSource === 'hourly') {
        dataPoint = hourlyWorstCase;
      } else if (rule.dataSource === 'daily') {
        dataPoint = dailyDataPoint;
      }

      // Bỏ qua nếu không có data cho nguồn này
      if (!dataPoint) continue;

      // Bước 2: Kiểm tra điều kiện (AND logic - mọi field đều phải thỏa mãn)
      const isTriggered = this.evaluateConditions(rule.conditions, dataPoint);

      // Bước 3: Nếu kích hoạt và chưa có trong danh sách → thêm vào
      if (isTriggered && !triggeredTitles.has(rule.title)) {
        triggeredTitles.add(rule.title);
        triggeredAdvices.push({
          adviceType: rule.adviceType,
          title: rule.title,
          message: rule.message,
          priority: rule.priority,
        });
      }
    }

    // Sắp xếp lời khuyên: WARNING trước, sau đó theo priority giảm dần
    const adviceTypeOrder = { WARNING: 0, RECOMMEND: 1, INFO: 2 };
    return triggeredAdvices.sort((a, b) => {
      const typeOrder =
        adviceTypeOrder[a.adviceType] - adviceTypeOrder[b.adviceType];
      if (typeOrder !== 0) return typeOrder;
      return b.priority - a.priority;
    });
  }

  /**
   * Kiểm tra một tập conditions có thỏa mãn với dataPoint không.
   * Logic: AND - chỉ cần 1 điều kiện không khớp → return false ngay
   * (Short-circuit evaluation)
   */
  private evaluateConditions(
    conditions: WeatherRule['conditions'],
    dataPoint: {
      temp: number;
      humidity: number;
      windSpeed: number;
      uvi: number;
      pop: number;
      weatherMain: string;
    },
  ): boolean {
    const c = conditions;

    // Nhiệt độ
    if (c.minTemp !== undefined && dataPoint.temp < c.minTemp) return false;
    if (c.maxTemp !== undefined && dataPoint.temp > c.maxTemp) return false;

    // Độ ẩm
    if (c.minHumidity !== undefined && dataPoint.humidity < c.minHumidity)
      return false;
    if (c.maxHumidity !== undefined && dataPoint.humidity > c.maxHumidity)
      return false;

    // Xác suất mưa (pop từ OWM là 0.0 - 1.0)
    if (c.minPop !== undefined && dataPoint.pop < c.minPop) return false;

    // Tốc độ gió
    if (c.maxWindSpeed !== undefined && dataPoint.windSpeed > c.maxWindSpeed)
      return false;

    if (c.minWindSpeed !== undefined && dataPoint.windSpeed < c.minWindSpeed) return false;
    // Loại thời tiết chính (so sánh case-insensitive)
    if (
      c.weatherMain !== undefined &&
      dataPoint.weatherMain.toLowerCase() !== c.weatherMain.toLowerCase()
    ) {
      return false;
    }

    // Chỉ số UV
    if (c.minUvi !== undefined && dataPoint.uvi < c.minUvi) return false;

    // Tất cả điều kiện đều thỏa mãn
    return true;
  }
}
