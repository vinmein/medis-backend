import { Module } from '@nestjs/common';
import { JobpostService } from './jobpost.service';
import { JobpostController } from './jobpost.controller';
import { DatabaseModule } from 'database/database.module';
import { SubscriptionModule } from 'subscription/subscription.module';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import appConfig from 'config/app.config';

@Module({
  imports: [
    DatabaseModule,
    SubscriptionModule,
    ConfigModule.forFeature(appConfig),
  ],
  controllers: [JobpostController],
  providers: [JobpostService],
  exports: [JobpostService],
})
export class JobpostModule {}
