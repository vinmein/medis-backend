import { IsNotEmpty } from "class-validator";
import { FileDto } from "./file-dto";

export class CreateUserReviewDto {

    createdBy: string;

    @IsNotEmpty()
    readonly education: string;

    @IsNotEmpty()
    readonly yearOfPassedOut: string;

    @IsNotEmpty()
    readonly councilNumber: string;

    @IsNotEmpty()
    readonly council: string;

    @IsNotEmpty()
    readonly mobileNumber: string;

    @IsNotEmpty()
    readonly userType: string;

    readonly documents: [FileDto]
}