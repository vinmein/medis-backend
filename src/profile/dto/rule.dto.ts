import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { PromoAction } from 'shared/enum/promo_action.enum';

export class RuleDto {
   action: PromoAction;
   duration?: number;
   discount: number;
}
