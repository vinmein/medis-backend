import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, catchError, from, map, mergeMap } from 'rxjs';
import { AuthenticatedRequest } from '../../auth/interface/authenticated-request.interface';
import { AccountConfigService } from 'account-config/account-config.service';
import { SubscriptionStatus } from 'shared/enum/subscription-status';
import { Duration } from 'shared/enum/duration.enum';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  private jobApplicationConfig: {
    toPost: number;
    toApply: number;
    toWithdraw: number;
  };

  constructor(
    private readonly reflector: Reflector,
    private accountConfigService: AccountConfigService,
    private configService: ConfigService,
  ) {
    this.jobApplicationConfig = this.configService.get(
      'application.jobApplication',
    );
  }
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request.user) {
      return false;
    }
    return from(
      this.accountConfigService.findOnebyQuery({
        userId: request.user.sub,
      }),
    ).pipe(
      map((response) => {
        console.log(response);
        if (!response) {
          throw new BadRequestException('Code is not found');
        }
        const isSubscribed = { ...response.isSubscribed };
        const started = isSubscribed['started'];
        if (isSubscribed.status == SubscriptionStatus.SUBSCRIBED) {
          if ('duration' in isSubscribed) {
            let newEpochTime = started; // Default to started time
            switch (isSubscribed.duration) {
              case Duration.WEEKLY:
                // Add 7 days for weekly duration
                const oneWeekInSeconds = 86400000 * 7;
                newEpochTime += oneWeekInSeconds;
                break;
              case Duration.MONTHLY:
                // Add 30 days as a common approximation for monthly duration
                const oneMonthInSeconds = 86400000 * 30;
                newEpochTime += oneMonthInSeconds;
                break;
              case Duration.YEARLY:
                // Add 365 days for yearly duration (not accounting for leap year)
                const oneYearInSeconds = 86400000 * 365;
                newEpochTime += oneYearInSeconds;
                break;
            }
            if (Date.now() < newEpochTime) {
              request.subscription = response;
              return true;
            }
          }
        } else {
          if (response.credits.available < this.jobApplicationConfig.toApply) {
            throw new BadRequestException(
              'No credits available to perform this operation',
            );
          }
          return true;
        }

     
      }),
      catchError((err) => {
        throw err;
      }),
    );
  }
}
