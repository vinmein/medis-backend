import { Injectable, Logger, Scope } from '@nestjs/common';

@Injectable({
  scope: Scope.TRANSIENT,
})
export class LoggerService {
  private prefix?: string;

  log(message: any) {
    let formattedMessage = message;

    if (this.prefix) {
      formattedMessage = `[${this.prefix}] ${message}`;
    }

    Logger.log(formattedMessage);
  }

  error(message: any) {
    let formattedMessage = message;

    if (this.prefix) {
      formattedMessage = `[${this.prefix}] ${message}`;
    }

    Logger.error(formattedMessage);
  }


  debug(message: string) {
    let formattedMessage = message;

    if (this.prefix) {
      formattedMessage = `[${this.prefix}] ${message}`;
    }

    Logger.debug(formattedMessage);
  }

  setPrefix(prefix: string) {
    this.prefix = prefix;
  }
}
