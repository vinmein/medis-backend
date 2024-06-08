import { HttpException, HttpStatus } from '@nestjs/common';

export class QuotaLimitExceededError extends HttpException {
  constructor({ limit, message }: { limit: number; message?: string }) {
    if (message) {
      super(`Quota limit exceeded: ${message}`, HttpStatus.FORBIDDEN);
    } else {
      super(`Quota limit exceeded: Max ${limit} entries`, HttpStatus.FORBIDDEN);
    }
  }
}