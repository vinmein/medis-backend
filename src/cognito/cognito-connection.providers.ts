import { ConfigType } from '@nestjs/config';
import amplifyConfig from 'config/amplify.config';
import { AMPLIFY_CONNECTION } from './cognito.constants';
import { FactoryProvider } from '@nestjs/common/interfaces';
import { AuthenticationDetails, CognitoUser, CognitoUserPool } from 'amazon-cognito-identity-js';
import { CognitoService } from './cognito.service';
import awsConfig from 'config/aws.config';


export const AmplifyConnectionProviders: FactoryProvider  = 
  {
    provide: AMPLIFY_CONNECTION,
    useFactory: (
      amplify: ConfigType<typeof amplifyConfig>,
      aws: ConfigType<typeof awsConfig>,
    ) => {
      return () => {
        return new CognitoService(amplify.userPoolId, amplify.clientId, aws.keyId, aws.secret);
      };
    },
    inject: [amplifyConfig.KEY, awsConfig.KEY],
  };
