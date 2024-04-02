import { IsNotEmpty } from 'class-validator';
export class S3FileObj {
    @IsNotEmpty()
   fileBuffer: Buffer;
    
    @IsNotEmpty()
    fileName: string; 

    @IsNotEmpty()
    mimetype: string;

    @IsNotEmpty()
    env:string;

    @IsNotEmpty()
    category:string;
}
