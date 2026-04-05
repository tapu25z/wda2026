import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import {
  WeatherRule,
  WeatherRuleSchema,
} from '@agri-scan/database';
import { WeatherController } from './Weather.controller';
import { WeatherService } from './Weather.service'

@Module({
  imports: [
    
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 3,
    }),

    // ConfigModule để inject ConfigService vào Service (đọc OWM_API_KEY)
    ConfigModule,

    // Đăng ký WeatherRule Schema với Mongoose
    MongooseModule.forFeature([
      { name: WeatherRule.name, schema: WeatherRuleSchema },
    ]),
  ],
  controllers: [WeatherController],
  providers: [WeatherService],
  exports: [WeatherService], // Export để các module khác có thể dùng nếu cần
})
export class WeatherModule {}