import { Module } from '@nestjs/common';
import { SubscribeService } from './subscribe.service';
import { SubscribeController } from './subscribe.controller';
import { MailchimpModule } from 'mailchimp/mailchimp.module';

@Module({
  imports:[MailchimpModule],
  controllers: [SubscribeController],
  providers: [SubscribeService],
})
export class SubscribeModule {}
