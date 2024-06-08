import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { DatabaseModule } from 'database/database.module';
import { AccountConfigModule } from 'account-config/account-config.module';

@Module({
  imports:[DatabaseModule, AccountConfigModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  exports: [SubscriptionService]
})
export class SubscriptionModule {}
