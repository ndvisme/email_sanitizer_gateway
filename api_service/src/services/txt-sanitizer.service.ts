import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, QueueEvents } from 'bullmq';
import { SanitizerResult } from '../interfaces/sanitizer-results.interface';
import { QueueCompletedEvent } from '../interfaces/queue-events.interface';
import { QueueConfigService } from './queue-config.service';

@Injectable()
export class TxtSanitizerService {
  private sanitizeTxtQueueEvents: QueueEvents;

  constructor(
    @InjectQueue('txt-sanitizer-queue') private sanitizeTxtQueue: Queue,
    private queueConfigService: QueueConfigService,
  ) {
    this.sanitizeTxtQueueEvents = this.queueConfigService.initializeQueueEvent('txt-sanitizer-queue');
  }

  async processTxtSanitizer(prompt: string): Promise<SanitizerResult> {
    console.log(`Txt sanitizer job started at: ${new Date().toISOString()}`);
    const emailSanitizerJob = await this.sanitizeTxtQueue.add('txt-sanitizer-job', {
      prompt: prompt,
    });

    return new Promise<SanitizerResult>((resolve) => {
      this.sanitizeTxtQueueEvents.on('completed', ({ jobId, returnvalue }: QueueCompletedEvent) => {
        if (jobId === emailSanitizerJob.id) {
          const completionTime = new Date().toISOString();
          console.log(`Email sanitizer Job: ${jobId}, done at: ${completionTime}`);
          resolve({
            status: 'Txt sanitizer job completed',
            id: jobId,
            completedAt: completionTime,
            sanitizedTxt: returnvalue.sanitizedTxt,
            maskedEmails: returnvalue.maskedEmails // Add this line
          });
        }
      });
    });
  }
}
