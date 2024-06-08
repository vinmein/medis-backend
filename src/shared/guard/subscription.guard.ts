import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable, catchError, from, map, of, switchMap, throwError } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { SubscriptionService } from 'subscription/subscription.service';
import { JobpostService } from 'jobpost/jobpost.service';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  private jobApplicationConfig: {
    toPost: number;
    toApply: number;
    toWithdraw: number;
  };

  constructor(
    private subscriptionService: SubscriptionService,
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

    return from(this.subscriptionService.verifySubscription(request, this.jobApplicationConfig)).pipe(
      switchMap(result => {
        // if (result instanceof Observable) {
        //   // If the result is an Observable<never>, flatten it to Observable<boolean>
        //   return result.pipe(
        //     catchError(err => throwError(() => new Error('Error handling logic here'))),
        //     switchMap(() => of(false)) // Decide what boolean value to emit if any
        //   );
        // } else {
          // Directly pass through boolean values
          return of(result);
        // }
      }),
      catchError(error => {
        // Global error handler if needed
        console.error('Error occurred:', error);
        return of(false); // Return a default boolean in case of error
      })
    );
  }
}
