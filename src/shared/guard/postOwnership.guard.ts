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
  import { QuotaLimitExceededError } from 'shared/exceptions/quota-limit-exceeded.exception';
  import { ApplicationService } from 'application/application.service';
  
  @Injectable()
  export class PostOwnership implements CanActivate {

  
    constructor(
      private application: ApplicationService,
    ) {
   
    }
    canActivate(
      context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
      const request = context.switchToHttp().getRequest();
      if (!request.user) {
        return false;
      }
  
      const timestamp = this.application.getStartandEnd();
      const query = {
        createdBy: request.user.sub, // Match the user ID
        createdAt: {
          $gte: timestamp.firstDayEpochMillis, // Greater than or equal to the first day of the month
          $lte: timestamp.lastDayEpochMillis, // Less than or equal to the last day of the month
        },
      };
  
      return from(
        this.application.aggregate(query, {
          _id: null, // Grouping key - null means group all
          count: { $sum: 1 }, // Count the documents
        }),
      ).pipe(
        map((response) => {
          if(response.length==0){
            return true;
          }
          const countObj = response[0];
         
        }),
        catchError((err) => {
          console.error(err);
          return throwError(() => err); // Properly rethrow the error as an Observable
        }),
      );
    }
  }
  