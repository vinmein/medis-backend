import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { PostModule } from './post/post.module';
import { SendgridModule } from './sendgrid/sendgrid.module';
import { UserModule } from './user/user.module';
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

@Module({
  imports: [
    ConfigModule.forRoot({}),
    DatabaseModule,
    PostModule,
    AuthModule,
    UserModule,
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
    JobpostModule
  ],
  controllers: [AppController],
  providers: [AppService],
  exports:[AppService]
})
export class AppModule { }
