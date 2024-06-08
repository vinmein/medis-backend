import { Module } from '@nestjs/common';
import { S3StorageProviders } from './s3-storage.provider';
import { ConfigModule } from '@nestjs/config';
import awsConfig from 'config/aws.config';

@Module({
    imports: [ConfigModule.forFeature(awsConfig)],
    providers: [S3StorageProviders],
    exports: [S3StorageProviders],
})
export class S3Module {}
