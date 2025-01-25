import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { QueueService } from './services/queue.service';
import { PromptDto } from './prompt.dto';
import { UserRequestService } from './services/user-request.service';
import { UserRequestField } from './constants/user-request.constants';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { ScoredCacheService } from './services/cache.service';

@Controller()
export class AppController {
  constructor(
    private readonly queueService: QueueService,
    private readonly userRequestService: UserRequestService,
    private readonly cacheService: ScoredCacheService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('sanitize')
  async sanitizePrompt(@Body() userPrompt: PromptDto) {
    // Check cache first
    const cachedResult = await this.cacheService.get(userPrompt.prompt);
    if (cachedResult) {
      console.log("Cache HIT!");
      return cachedResult;
    }
    else {
      console.log("Cache MISS!");
    }

    const promptDoc = await this.userRequestService.create(userPrompt.prompt);

    const promptSanitizedResult = await this.queueService.processEmailSanitizer(userPrompt.prompt);
    const updatePromptPromises = [
      this.userRequestService.update(promptDoc.id, UserRequestField.SANITIZED_PROMPT, promptSanitizedResult.sanitizedTxt),
      this.userRequestService.update(promptDoc.id, UserRequestField.PROMPT_MASKED_EMAILS, promptSanitizedResult.maskedEmails)
    ];

    const llmResponse = await this.queueService.processLlmJob(promptSanitizedResult.sanitizedTxt);
    const updateLlmPromise = this.userRequestService.update(promptDoc.id, UserRequestField.LLM_RESPONSE, llmResponse.response);

    const LlmSanitizedResult = await this.queueService.processEmailSanitizer(llmResponse.response);
    const updateSanitizedPromises = [
      this.userRequestService.update(promptDoc.id, UserRequestField.SANITIZED_RESPONSE, LlmSanitizedResult.sanitizedTxt),
      this.userRequestService.update(promptDoc.id, UserRequestField.RESPONSE_MASKED_EMAILS, LlmSanitizedResult.maskedEmails)
    ];

    await Promise.all([
      ...updatePromptPromises,
      updateLlmPromise,
      ...updateSanitizedPromises
    ]);

    const result = {
      promptSanitized: promptSanitizedResult.sanitizedTxt,
      llmSanitizedResponse: LlmSanitizedResult.sanitizedTxt,
      promptMaskedEmails: promptSanitizedResult.maskedEmails,
      responseMaskedEmails: LlmSanitizedResult.maskedEmails,
    };

    // Store result in cache
    await this.cacheService.set(userPrompt.prompt, result);

    return result;
  }
}

