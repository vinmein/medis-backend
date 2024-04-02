import { IsEmail, IsNotEmpty, MaxLength, MinLength } from "class-validator";
export class StorageRequest {
    @IsNotEmpty()
    eTag: string;

    @IsNotEmpty()
    location: string;

    @IsNotEmpty()
    key: string;

    @IsNotEmpty()
    bucket: string;

    @IsNotEmpty()
    versionId: string;

    @IsNotEmpty()
    url: string;

    @IsNotEmpty()
    category: string;

    @IsNotEmpty()
    createdBy: string;
}
