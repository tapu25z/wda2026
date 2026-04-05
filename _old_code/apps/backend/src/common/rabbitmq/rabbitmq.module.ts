import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'SCAN_SERVICE',
                imports: [ConfigModule],
                useFactory: (config: ConfigService) => ({
                    transport: Transport.RMQ,
                    options: {
                        urls: [config.getOrThrow<string>('RABBITMQ_URL')],
                        queue: 'scan_queue',
                        queueOptions: { durable: true },
                    },
                }),
                inject: [ConfigService],
            },
            {
                name: 'CHAT_SERVICE',
                imports: [ConfigModule],
                useFactory: (config: ConfigService) => ({
                    transport: Transport.RMQ,
                    options: {
                        urls: [config.getOrThrow<string>('RABBITMQ_URL')],
                        queue: 'chat_queue',
                        queueOptions: { durable: true },
                    },
                }),
                inject: [ConfigService],
            },
        ]),
    ],
    exports: [ClientsModule],
})
export class RabbitMQModule { }