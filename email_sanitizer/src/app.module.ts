import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TxtSanitizerProcessor } from './txt-sanitizer.processor';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_QUEUE_HOST || 'redis_queue',
        port: parseInt(process.env.REDIS_QUEUE_PORT || '6379'),
      },
    }),
    BullModule.registerQueue({
      name: 'txt-sanitizer-queue',
    }),
  ],
  providers: [TxtSanitizerProcessor],
})
export class AppModule { }
