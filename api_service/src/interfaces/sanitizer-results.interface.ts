export interface SanitizerResult {
  status: string;
  id: string;
  completedAt: string;
  sanitizedTxt: string;
  maskedEmails: string[];
}
