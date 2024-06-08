import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  Observable,
  catchError,
  from,
  map,
  throwError,
} from 'rxjs';
import { ProfileService } from 'profile/profile.service';

@Injectable()
export class ProfileGuard implements CanActivate {


  constructor(
    private profileService: ProfileService,
  ) {
  }
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request.user) {
      return false;
    }

    return from(
      this.profileService.findOnebyQuery({userId: request.user.sub}),
    ).pipe(
      map((response) => {
        if(!response){
          throw new NotFoundException('Profile details is not found');
        }
        request.profile = response;
        return true;
      }),
      catchError((err) => {
        return throwError(() => err); // Properly rethrow the error as an Observable
      }),
    );
  }
}
