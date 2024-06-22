import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import mailchimpConfig from 'config/mailchimp.config';
import { MailChimpProviders } from './mailchimp.providers';

@Module({
    imports: [ConfigModule.forFeature(mailchimpConfig)],
    providers: [MailChimpProviders],
    exports: [MailChimpProviders],
})
export class MailchimpModule {}