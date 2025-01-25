import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';


@Injectable()
@Processor('talk-to-llm-queue')
export class LlmProcessor extends WorkerHost {
  constructor(private readonly httpService: HttpService) {
    super();
  }

  async process(job: Job): Promise<any> {
    console.log('Received job:', job.id);
    console.log(`Starting job at: ${new Date().toISOString()}`);

    try {
      const llmUrl = process.env.LLM_SERVICE_URL || 'http://llm:11434/api/generate';
      const response = await firstValueFrom(
        this.httpService.post(llmUrl, {
          model: 'tinydolphin',
          prompt: job.data.prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            num_predict: 100
          }
        })
      );

      console.log(`Finished job: ${job.id}, at: ${new Date().toISOString()}`);

      return {
        completed: true,
        finishedAt: new Date().toISOString(),
        prompt: job.data.prompt,
        response: response.data.response,
        model: 'tinydolphin'
      };

    } catch (error) {
      console.error('LLM Error:', error.message);
      console.error('Full error:', error);
      throw error;
    }
  }
}
