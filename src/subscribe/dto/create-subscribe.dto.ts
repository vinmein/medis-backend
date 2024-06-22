import { IsNotEmpty } from "class-validator";

export class CreateSubscribeDto {
    @IsNotEmpty()
    readonly email: string;
}
