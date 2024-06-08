import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { ManagedUpload } from 'aws-sdk/clients/s3';
import { S3_BUCKET, S3_CDN } from './s3.constants';
import { S3FileObj } from './interface/file-obj.interface';
import { init } from '@paralleldrive/cuid2';
import { S3KeyObj } from './interface/s3-key-obj.interface';
import { plainToClass } from 'class-transformer';

@Injectable()
export class S3StorageService {
  private s3: AWS.S3;
  private createId;
  constructor(keyId: string, secret: string) {
    this.s3 = new AWS.S3({
      accessKeyId: keyId,
      secretAccessKey: secret,
    });
    this.createId = init({
      // A custom random function with the same API as Math.random.
      // You can use this to pass a cryptographically secure random function.
      random: Math.random,
      // the length of the id
      length: 10,
      // A custom fingerprint for the host environment. This is used to help
      // prevent collisions when generating ids in a distributed system.
      fingerprint: 'medic-app',
    });
  }

  async uploadFileToS3(fileObjDto: S3FileObj): Promise<S3KeyObj> {
    const shortId = this.createId();
    const type = fileObjDto.mimetype.split('/');
    const newFileName =
      type.length > 1 ? `${shortId}.${type[1]}` : `${shortId}.png`;
    const params: AWS.S3.Types.PutObjectRequest = {
      Bucket: `${S3_BUCKET}/${fileObjDto.env}/${fileObjDto.category}`,
      Key: newFileName,
      Body: fileObjDto.fileBuffer,
      ContentType: fileObjDto.mimetype,
    };
    const result: ManagedUpload.SendData = await this.s3
      .upload(params)
      .promise();
    let url;
    if (S3_CDN) {
      url = `${S3_CDN}${result.Key}`
    }

    const responseDto = plainToClass(S3KeyObj, result);
    responseDto.url = url
    return responseDto;
  }
}
