import { UserType } from "shared/enum/user-type.enum";
import { IsNotEmpty } from "class-validator";

export class CreateProfessionDto {
     userId: string;

    readonly education?: string;

    readonly yearOfPassedOut?: string;

    readonly council?: string;

    readonly councilNumber?: string;

    @IsNotEmpty()
     userType: UserType;

    readonly mobileNumber?: string;
}