import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { S3Module } from 's3/s3.module';
import { ConfigModule } from '@nestjs/config';
import environmentConfig from 'config/environment.config';
import { DatabaseModule } from 'database/database.module';

@Module({
  imports: [S3Module, ConfigModule.forFeature(environmentConfig), DatabaseModule],
  controllers: [StorageController],
  providers: [StorageService],
})
export class StorageModule {}
