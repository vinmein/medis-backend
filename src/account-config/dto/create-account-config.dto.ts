import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { SubscriptionDto } from './subscription.dto';
import { CreditsDTO } from './credits.dto';


export class CreateAccountConfigDto {

  userId: string;

  isSubscribed: SubscriptionDto;

  credits: CreditsDTO;
}
