import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AiScanController } from './ai-scan.controller';
import { AiScanService } from './ai-scan.service';
import { AiScanConsumer } from './ai-scan.consumer';
import {
  ScanHistory, ScanHistorySchema,
  User, UserSchema,
  ChatHistory, ChatHistorySchema,
} from '@agri-scan/database';
import { PlantsModule } from '../plants/plants.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ScanHistory.name, schema: ScanHistorySchema },
      { name: ChatHistory.name, schema: ChatHistorySchema },
      { name: User.name, schema: UserSchema },
    ]),

    ClientsModule.registerAsync([
      {
        name: 'SCAN_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.getOrThrow<string>('RABBITMQ_URL')],
            queue: 'scan_queue',
            queueOptions: { durable: true },
            prefetchCount: 1,
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'CHAT_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.getOrThrow<string>('RABBITMQ_URL')],
            queue: 'chat_queue',
            queueOptions: { durable: true },
            prefetchCount: 5,
          },
        }),
        inject: [ConfigService],
      },
    ]),

    ConfigModule,
    PlantsModule,
  ],

  // ═══════════════════════════════════════════════════════════════
  // REVERT: AiScanConsumer PHẢI nằm trong controllers[], KHÔNG phải providers[].
  //
  // Trong NestJS hybrid app, microservice server chỉ scan @EventPattern
  // và @MessagePattern từ các class trong controllers[].
  // Nếu để trong providers[] → server không tìm thấy handler
  // → "An unsupported event was received" → message bị nack ngay lập tức.
  //
  // providers[] dùng để inject dependency (service, repository, helper...),
  // không dùng cho message handler.
  // ═══════════════════════════════════════════════════════════════
  controllers: [
    AiScanController,  // HTTP routes: POST /scan/analyze, GET /scan/history...
    AiScanConsumer,    // RabbitMQ handlers: @EventPattern('scan.image.requested'), @EventPattern('chat.message.requested')
  ],
  providers: [
    AiScanService,
  ],
})
export class AiScanModule {}
