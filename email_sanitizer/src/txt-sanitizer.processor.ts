import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';


@Processor('txt-sanitizer-queue')
export class TxtSanitizerProcessor extends WorkerHost {

  async process(job: Job): Promise<any> {
    console.log(`Starting job: ${job.id}, at: ${new Date().toISOString()}`);

    const originalTxt = job.data.prompt;
    const maskedEmails: string[] = [];

    const sanitizedTxt = originalTxt.replace(/([a-zA-Z0-9._-]+)@([a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+\.?)/g, (match, username, domain) => {
      const cleanEmail = match.endsWith('.') ? match.slice(0, -1) : match;
      maskedEmails.push(cleanEmail);
      return 'x'.repeat(username.length) + '@' + domain;
    });

    console.log(`Finished job: ${job.id}, at: ${new Date().toISOString()}`);

    return {
      completed: true,
      finishedAt: new Date().toISOString(),
      sanitizedTxt: sanitizedTxt,
      maskedEmails: maskedEmails
    };
  }
}
