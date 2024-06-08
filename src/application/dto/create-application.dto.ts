import { IsNotEmpty } from "class-validator";
export class CreateApplicationDto {

    applicantId: string;

    @IsNotEmpty()
    readonly jobPostId: string;

    applicantName: string;

}
