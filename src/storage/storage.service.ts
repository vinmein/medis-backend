import { Inject, Injectable } from '@nestjs/common';
import { CreateStorageDto } from './dto/create-storage.dto';
import { UpdateStorageDto } from './dto/update-storage.dto';
import { S3_CONNECTION } from 's3/s3.constants';
import { S3FileObj } from 's3/interface/file-obj.interface';
import { ConfigService, ConfigType } from '@nestjs/config';
import environmentConfig from 'config/environment.config';
import { STORAGE_CONFIG_MODEL } from 'database/database.constants';
import { StorageModel } from 'database/models/storage.model';
import { StorageRequest } from './entities/storage-request.entity';

import { EMPTY, from, Observable, of } from 'rxjs';
import { mergeMap, map, throwIfEmpty } from 'rxjs/operators';
import { plainToClass } from 'class-transformer';
import { StorageResponse } from './entities/storage.response.entity';
import { FilterKeysHelper } from 'shared/helper/filter-keys-helper';

@Injectable()
export class StorageService {
  constructor(
    @Inject(STORAGE_CONFIG_MODEL) private storageModel: StorageModel,
    @Inject(S3_CONNECTION) private readonly s3Storage: any,
    private readonly configService: ConfigService,
  ) {}
  async create(
    createStorageDto: CreateStorageDto,
    buffer: Buffer,
    name: string,
    mimetype: string,
    createdBy: string,
  ) {
    const category = createStorageDto.category || 'default';
    const envConfig = this.configService.get('environment');
    const s3StorageInstance = this.s3Storage();
    const fileObjDto = new S3FileObj();
    fileObjDto.category = category
    fileObjDto.fileBuffer = buffer;
    fileObjDto.fileName = name;
    fileObjDto.mimetype = mimetype;
    fileObjDto.env = envConfig.env;
    const responseDto = await s3StorageInstance.uploadFileToS3(fileObjDto);
    const storageRequest = new StorageRequest()
    storageRequest.eTag = responseDto.ETag;
    storageRequest.location = responseDto.Location;
    storageRequest.key = responseDto.key;
    storageRequest.bucket = responseDto.Bucket;
    storageRequest.versionId = responseDto.VersionId;
    storageRequest.url = responseDto.url;
    storageRequest.category = category;
    storageRequest.createdBy = createdBy
    const createResponse = this.storageModel.create(storageRequest);
    return from(createResponse).pipe(
      map((response) => {
        return FilterKeysHelper.filterKeys(response.toObject(), ["storageId", "url", "location", "createdBy"])
      }),
    );
    
  }

  findAll() {
    return `This action returns all storage`;
  }

  findOne(id: number) {
    return `This action returns a #${id} storage`;
  }

  update(id: number, updateStorageDto: UpdateStorageDto) {
    return `This action updates a #${id} storage`;
  }

  remove(id: number) {
    return `This action removes a #${id} storage`;
  }
}
