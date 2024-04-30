import { PartialType } from '@nestjs/swagger';
import { CreateProfileDto } from './create-profile.dto';
import { UserStatus } from 'shared/enum/user-status.enum';

export class UpdateProfileDto extends PartialType(CreateProfileDto) {
    readonly firstName?: string; // Making name optional for update
    readonly lastName?: string; 
    readonly dob?: string; // Making age optional for update
    readonly mobileNumber?: string; // Making email optional for update
    status: UserStatus;
}
