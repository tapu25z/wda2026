import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetWeatherDto } from './dto/Get weather.dto';
import { WeatherService } from './Weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  /**
   * GET /api/weather?lat=10.8231&lon=106.6297&category=VEGETABLE
   *
   * Trả về dữ liệu thời tiết chi tiết kết hợp lời khuyên nông nghiệp
   * phù hợp với loại cây trồng của người dùng.
   *
   * @requires JWT Authentication
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  async getWeatherAndAdvice(@Query() query: GetWeatherDto) {
    const { lat, lon, category } = query;
    return this.weatherService.getWeatherAndAdvice(lat, lon, category);
  }
}