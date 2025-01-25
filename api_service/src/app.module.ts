import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { BullModule } from '@nestjs/bullmq';
import { QueueService } from './services/queue.service';
import { QueueConfigService } from './services/queue-config.service';
import { TxtSanitizerService } from './services/txt-sanitizer.service';
import { LlmTalkerService } from './services/llm-talker.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserRequest, UserRequestSchema } from './schemas/user-request.schema';
import { UserRequestService } from './services/user-request.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CacheConfigModule } from './cache.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ScoredCacheService } from './services/cache.service';
import { EventEmitterModule } from '@nestjs/event-emitter';


@Module({
  imports: [
    EventEmitterModule.forRoot({
      maxListeners: 20,
      wildcard: true,
      delimiter: '.',
      verboseMemoryLeak: true
    }),
    CacheConfigModule,
    CacheModule.register({ isGlobal: true }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://mongo:27017/userRequestsDB'),
    MongooseModule.forFeature([{ name: UserRequest.name, schema: UserRequestSchema }]),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_QUEUE_HOST || 'redis_queue',
        port: parseInt(process.env.REDIS_QUEUE_PORT || '6379'),
      }
    }),
    BullModule.registerQueue(
      {
        name: 'txt-sanitizer-queue',
      },
      {
        name: 'talk-to-llm-queue'
      }
    ),
  ],
  controllers: [AppController],
  providers: [QueueService, QueueConfigService, TxtSanitizerService, LlmTalkerService, UserRequestService, ScoredCacheService],
  exports: [ScoredCacheService],
})
export class AppModule { }
