import { IsEmail, IsNotEmpty, MaxLength, MinLength } from "class-validator";
export class StorageResponse {
    @IsNotEmpty()
     storageId: string;

    @IsNotEmpty()
     location: string;

    @IsNotEmpty()
     url: string;

    @IsNotEmpty()
     category: string;

    @IsNotEmpty()
     createdBy: string;
}
