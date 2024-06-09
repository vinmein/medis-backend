import { Module } from '@nestjs/common';
import { AmplifyConnectionProviders } from './cognito-connection.providers';
import { ConfigModule } from '@nestjs/config';
import amplifyConfig from 'config/amplify.config';
import awsConfig from 'config/aws.config';

@Module({
    imports: [ConfigModule.forFeature(amplifyConfig), ConfigModule.forFeature(awsConfig)],
    providers: [AmplifyConnectionProviders],
    exports: [AmplifyConnectionProviders],
})
export class AmplifyModule {}
