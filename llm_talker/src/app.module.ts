import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { HttpModule } from '@nestjs/axios';
import { LlmProcessor } from './prompt.processer';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_QUEUE_HOST || 'redis_queue',
        port: parseInt(process.env.REDIS_QUEUE_PORT || '6379'),
      },
    }),
    BullModule.registerQueue({
      name: 'talk-to-llm-queue',
    }),
  ],
  providers: [LlmProcessor],
})
export class AppModule { }
