import { IsNotEmpty } from "class-validator";

export class CreateStorageDto {
    @IsNotEmpty()
    readonly category: string;
  
}
