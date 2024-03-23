import { PartialType } from '@nestjs/swagger';
import { CreateAccountConfigDto } from './create-account-config.dto';

export class UpdateAccountConfigDto extends PartialType(CreateAccountConfigDto) {}
