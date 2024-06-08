import { PartialType } from '@nestjs/swagger';
import { CreateAccountConfigDto } from './create-account-config.dto';
import { SubscriptionDto } from './subscription.dto';
import { CreditsDTO } from './credits.dto';

export class UpdateAccountConfigDto extends PartialType(CreateAccountConfigDto) {
    isSubscribed?: SubscriptionDto;
    credits?: CreditsDTO;
}
