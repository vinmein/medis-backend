import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Observable, catchError, from, map } from 'rxjs';
import { PromocodeService } from 'promocode/promocode.service';

@Injectable()
export class PromoGuard implements CanActivate {
  constructor(
    private promoCodeService: PromocodeService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    if (request.body.promoCode) {
      return from(
        this.promoCodeService.findOnebyQuery({
          promocode: request.body.promoCode,
        }),
      ).pipe(
        map((response) => {
          console.log(response)
          if (!response) {
            throw new BadRequestException('Promo Code is not found');
          }
          request.promoObj = response;
          return true;
        }),
        catchError((err) => {
          throw err;
        }),
      )
    } else {
      return true;
    }
  }
}
