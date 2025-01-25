import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, QueueEvents } from 'bullmq';
import { LlmResult } from '../interfaces/llm-result.interface';
import { QueueCompletedEvent } from '../interfaces/queue-events.interface';
import { QueueConfigService } from './queue-config.service';

@Injectable()
export class LlmTalkerService {
  private llmQueueEvents: QueueEvents;

  constructor(
    @InjectQueue('talk-to-llm-queue') private llmQueue: Queue,
    private queueConfigService: QueueConfigService,
  ) {
    this.llmQueueEvents = this.queueConfigService.initializeQueueEvent('talk-to-llm-queue');
  }

  async processLlmJob(prompt: string): Promise<LlmResult> {
    console.log(`LLM talker job started at: ${new Date().toISOString()}`);

    const llmJob = await this.llmQueue.add('llm-job', {
      prompt: prompt,
    });

    return new Promise<LlmResult>((resolve) => {
      this.llmQueueEvents.on('completed', ({ jobId, returnvalue }: QueueCompletedEvent) => {

        if (jobId === llmJob.id) {
          const completionTime = new Date().toISOString();
          console.log(`LLM Job: ${jobId}, done at: ${completionTime}`);

          resolve({
            status: 'LLM job completed',
            id: jobId,
            completedAt: completionTime,
            response: returnvalue.response,
            model: returnvalue.model
          });
        }
      });
    });
  }
}
