import { IsNotEmpty } from "class-validator";

export class FileDto {
    @IsNotEmpty()
    readonly url: string;

    @IsNotEmpty()
    readonly type: string;
    
}