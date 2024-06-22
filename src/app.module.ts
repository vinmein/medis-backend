import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { PostModule } from './post/post.module';
import { SendgridModule } from './sendgrid/sendgrid.module';
import { LoggerModule } from './logger/logger.module';
import { ProfileModule } from './profile/profile.module';
import { AmplifyModule } from 'cognito/cognito.module';
import { ProfessionModule } from './profession/profession.module';
import { OrganisationModule } from './organisation/organisation.module';
import { JobModule } from './job/job.module';
import { PaymentModule } from './payment/payment.module';
import { ReceiptModule } from './receipt/receipt.module';
import { ApplicationModule } from './application/application.module';
import { JobpostModule } from './jobpost/jobpost.module';
import { AccountConfigModule } from './account-config/account-config.module';
import { AdvertisementsModule } from './advertisement/advertisements.module';
import { FeedModule } from './feed/feed.module';
import { StorageModule } from './storage/storage.module';
import { S3Module } from './s3/s3.module';
import { UserReviewModule } from './user-review/user-review.module';
import { PromocodeModule } from './promocode/promocode.module';
import amplifyConfig from 'config/amplify.config';
import applicationConfig from 'config/app.config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SubscriptionModule } from './subscription/subscription.module';
import { SubscribeModule } from './subscribe/subscribe.module';
import { MailchimpModule } from './mailchimp/mailchimp.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [amplifyConfig, applicationConfig], // Load the configuration
    }),
    DatabaseModule,
    PostModule,
    AuthModule,
    SendgridModule,
    LoggerModule.forRoot(),
    ProfileModule,
    AmplifyModule,
    ProfessionModule,
    OrganisationModule,
    JobModule,
    PaymentModule,
    ReceiptModule,
    ApplicationModule,
    JobpostModule,
    AccountConfigModule,
    AdvertisementsModule,
    FeedModule,
    StorageModule,
    S3Module,
    UserReviewModule,
    PromocodeModule,
    EventEmitterModule.forRoot(),
    SubscriptionModule,
    SubscribeModule,
    MailchimpModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports:[AppService]
})
export class AppModule { }
