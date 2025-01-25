import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: process.env.REDIS_CACHE_HOST || 'redis_cache',
            port: parseInt(process.env.REDIS_CACHE_PORT || '6379'),
          }
        })
      })
    }),
  ],
  exports: [CacheModule]
})
export class CacheConfigModule {}
