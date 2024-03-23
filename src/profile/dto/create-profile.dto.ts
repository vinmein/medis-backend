import { IsEmail, IsNotEmpty, MaxLength, MinLength } from "class-validator";

export class CreateProfileDto {
  
    @IsNotEmpty()
    readonly userId: string;

    @IsNotEmpty()
    readonly firstName: string;
  
    @IsNotEmpty()
    readonly lastName: string;
  
    readonly dob: string;
  
    @IsNotEmpty()
    readonly emailId: string;
  
    readonly mobileNumber: string;

    @IsNotEmpty()
    readonly role: Array<string>;

    @IsNotEmpty()
    readonly type: string;
}