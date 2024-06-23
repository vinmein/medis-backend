import { IsEmail, IsNotEmpty, MaxLength, MinLength } from "class-validator";
import { PromoObjDto } from "./promo-obj.dto";
import { UserStatus } from "shared/enum/user-status.enum";
import { AddressDto } from "./address.dto";

export class CreateProfileDto {
  
    @IsNotEmpty()
    readonly userId: string;

    @IsNotEmpty()
    readonly firstName: string;
  
    @IsNotEmpty()
    readonly lastName: string;
  
    readonly dob: string;
      
    readonly promoObj?: PromoObjDto;

    @IsNotEmpty()
    readonly emailId: string;
  
    readonly mobileNumber: string;

    @IsNotEmpty()
    readonly role: Array<string>;

    @IsNotEmpty()
    readonly type: string;

    status?: UserStatus

    residential?: AddressDto
}