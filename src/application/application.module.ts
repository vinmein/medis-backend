import { Module } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { DatabaseModule } from 'database/database.module';
import { SubscriptionModule } from 'subscription/subscription.module';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import appConfig from 'config/app.config';
import { ProfileModule } from 'profile/profile.module';

@Module({
  imports: [
    DatabaseModule,
    SubscriptionModule,
    ProfileModule,
    ConfigModule.forFeature(appConfig),
  ],
  controllers: [ApplicationController],
  providers: [ApplicationService],
  exports: [ApplicationService],
})
export class ApplicationModule {}
