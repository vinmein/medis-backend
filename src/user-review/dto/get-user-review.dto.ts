import { IsNotEmpty } from "class-validator";
import { FileDto } from "./file-dto";

export class GetUserReviewDto {
    readonly status: string;
}