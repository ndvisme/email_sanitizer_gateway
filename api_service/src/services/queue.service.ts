import { Injectable } from '@nestjs/common';
import { SanitizerResult } from '../interfaces/sanitizer-results.interface';
import { LlmResult } from '../interfaces/llm-result.interface';
import { TxtSanitizerService } from './txt-sanitizer.service';
import { LlmTalkerService } from './llm-talker.service';

@Injectable()
export class QueueService {

  constructor(private txtSanitizerService: TxtSanitizerService, private llmService: LlmTalkerService) { }

  async processEmailSanitizer(prompt: string): Promise<SanitizerResult> {
    return this.txtSanitizerService.processTxtSanitizer(prompt);
  }

  async processLlmJob(sanitizedPrompt: string): Promise<LlmResult> {
    return this.llmService.processLlmJob(sanitizedPrompt);
  }
}
