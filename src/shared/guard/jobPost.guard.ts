import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Observable,
  catchError,
  from,
  map,
  of,
  switchMap,
  throwError,
} from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { SubscriptionService } from 'subscription/subscription.service';
import { JobpostService } from 'jobpost/jobpost.service';
import { QuotaLimitExceededError } from 'shared/exceptions/quota-limit-exceeded.exception';

@Injectable()
export class JobPostGuard implements CanActivate {
  private jobApplicationConfig: {
    toPost: number;
    toApply: number;
    toWithdraw: number;
  };

  constructor(
    private jobPostService: JobpostService,
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

    const timestamp = this.jobPostService.getStartandEnd();
    const query = {
      createdBy: request.user.sub, // Match the user ID
      createdAt: {
        $gte: timestamp.firstDayEpochMillis, // Greater than or equal to the first day of the month
        $lte: timestamp.lastDayEpochMillis, // Less than or equal to the last day of the month
      },
    };

    return from(
      this.jobPostService.aggregate(query, {
        _id: null, // Grouping key - null means group all
        count: { $sum: 1 }, // Count the documents
      }),
    ).pipe(
      map((response) => {
        if(response.length==0){
            return true;
          }
        const countObj = response[0];
        if (request.isSubscribed) {
          if (
            countObj.count < request.subscriptionPackage.packageRule.maxJobPost
          ) {
            return true;
          } else {
            throw new QuotaLimitExceededError({
              limit: request.subscriptionPackage.packageRule.maxJobPost,
            });
          }
        } else {
          const availableCredits = response.credits?.available || 0;
          if (availableCredits < this.jobApplicationConfig.toPost) {
            throw new QuotaLimitExceededError({
              limit: this.jobApplicationConfig.toPost,
            });
          } else {
            return true;
          }
        }
      }),
      catchError((err) => {
        console.error(err);
        return throwError(() => err); // Properly rethrow the error as an Observable
      }),
    );
  }
}
