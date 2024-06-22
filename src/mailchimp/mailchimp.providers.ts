import { ConfigType } from '@nestjs/config';
import mailchimpConfig from 'config/mailchimp.config';
import { MAILCHIMP_CONNECTION } from './mailchimp.constants';
import { FactoryProvider } from '@nestjs/common/interfaces';
import { AuthenticationDetails, CognitoUser, CognitoUserPool } from 'amazon-cognito-identity-js';
import { MailChimpService } from './mailchimp.service';
import awsConfig from 'config/aws.config';


export const MailChimpProviders: FactoryProvider  = 
  {
    provide: MAILCHIMP_CONNECTION,
    useFactory: (
      mailChimp: ConfigType<typeof mailchimpConfig>,
    ) => {
      return () => {
        return new MailChimpService(mailChimp.apiKey);
      };
    },
    inject: [mailchimpConfig.KEY],
  };
