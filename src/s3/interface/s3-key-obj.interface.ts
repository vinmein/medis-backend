import { IsNotEmpty } from 'class-validator';
export class S3KeyObj {
    @IsNotEmpty()
    readonly ETag: string;

    @IsNotEmpty()
    readonly  Location: string;

    @IsNotEmpty()
    readonly key: string;

    @IsNotEmpty()
    readonly Bucket: string;

    @IsNotEmpty()
    readonly VersionId: string;

    @IsNotEmpty()
    url: string;
}