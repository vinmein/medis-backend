import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class CreateAccountConfigDto {

  userId: string;

  readonly isSubscribed: string;

  readonly credits: string;
}
