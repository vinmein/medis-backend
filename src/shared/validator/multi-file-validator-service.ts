import {  FileValidator, HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class MultiFileValidatorService  extends FileValidator  {
  isValid(file?: any): boolean | Promise<boolean> {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    return allowedTypes.indexOf(file.mimetype)>-1;
  }
  buildErrorMessage(file: any): string {
    console.log(file)
    throw new HttpException(
        `Validation failed (unexpected type: ${file.mimetype})`,
        HttpStatus.BAD_REQUEST,
      )
  }
}