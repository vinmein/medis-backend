import { ConfigType } from '@nestjs/config';
import awsConfig from 'config/aws.config';
import { S3_CONNECTION } from './s3.constants';
import { FactoryProvider } from '@nestjs/common/interfaces';
import { AuthenticationDetails, CognitoUser, CognitoUserPool } from 'amazon-cognito-identity-js';
import { S3StorageService } from './s3.storage.service';


export const S3StorageProviders: FactoryProvider  = 
  {
    provide: S3_CONNECTION,
    useFactory: (
      aws: ConfigType<typeof awsConfig>,
    ) => {
      return () => {
        return new S3StorageService(aws.keyId, aws.secret);
      };
    },
    inject: [awsConfig.KEY],
  };
