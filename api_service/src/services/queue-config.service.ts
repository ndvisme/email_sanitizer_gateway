import { Injectable } from '@nestjs/common';
import { QueueEvents } from 'bullmq';

@Injectable()
export class QueueConfigService {
  initializeQueueEvent(queueName: string): QueueEvents {
    return new QueueEvents(queueName, {
      connection: {
        host: process.env.REDIS_QUEUE_HOST || 'redis_queue',
        port: parseInt(process.env.REDIS_QUEUE_PORT || '6379'),
      },
    });
  }
}
