import { IsNotEmpty } from "class-validator";
import { Status } from "shared/enum/status.enum";

export class CheckListDto {
    @IsNotEmpty()
    readonly checkItem: string;

    @IsNotEmpty()
    readonly status: Status;
}

