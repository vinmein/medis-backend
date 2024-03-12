import { Module } from '@nestjs/common';
import { AmplifyConnectionProviders } from './amplify-connection.providers';
import { ConfigModule } from '@nestjs/config';
import amplifyConfig from 'config/amplify.config';

@Module({
    imports: [ConfigModule.forFeature(amplifyConfig)],
    providers: [AmplifyConnectionProviders],
    exports: [AmplifyConnectionProviders],
})
export class AmplifyModule {}
