import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);


  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.getOrThrow<string>('RABBITMQ_URL')],
      queue: 'scan_queue',
      queueOptions: { durable: true },
      noAck: false,       // Bắt buộc false để manual ack/nack hoạt động
      prefetchCount: 1,   // AI nặng — xử lý tuần tự từng ảnh
    },
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.getOrThrow<string>('RABBITMQ_URL')],
      queue: 'chat_queue',
      queueOptions: { durable: true },
      noAck: false,
      prefetchCount: 5,
    },
  });

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: [
      'http://localhost:8081',  // Expo Web
      'http://localhost:3000',  // Next.js dev
      // Thêm domain production sau khi deploy
      // 'https://agriscan.ai',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Phải gọi trước app.listen() để RabbitMQ consumers sẵn sàng
  // trước khi nhận HTTP request
  await app.startAllMicroservices();

  const port = configService.get<number>('PORT', 4000);
  await app.listen(port);
  console.log(`🚀 Backend Agri-Scan AI đang chạy tại: http://localhost:${port}`);
  console.log(`📨 RabbitMQ consumers đã sẵn sàng: scan_queue | chat_queue`);
}
bootstrap();