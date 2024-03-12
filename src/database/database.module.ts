import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import mongodbConfig from '../config/mongodb.config';
import environmentConfig from '../config/environment.config';
import { databaseConnectionProviders } from './database-connection.providers';
import { databaseModelsProviders } from './database-models.providers';

@Module({
  imports: [ConfigModule.forFeature(mongodbConfig), ConfigModule.forFeature(environmentConfig)],
  providers: [...databaseConnectionProviders, ...databaseModelsProviders],
  exports: [...databaseConnectionProviders, ...databaseModelsProviders],
})
export class DatabaseModule { }
