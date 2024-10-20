import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';
import { ConfigModule, ConfigType } from '@nestjs/config';
import jwtConfig from '../config/jwt.config';
import { AuthController } from './auth.controller';
import { AmplifyModule } from 'cognito/cognito.module';
import { ProfileModule } from 'profile/profile.module';
import { PromocodeModule } from 'promocode/promocode.module';
import { AccountConfigModule } from 'account-config/account-config.module';

@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    ProfileModule,
    PromocodeModule,
    AmplifyModule,
    AccountConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule.forFeature(jwtConfig)],
      useFactory: (config: ConfigType<typeof jwtConfig>) => {
        return {
          secret: config.secretKey,
          signOptions: { expiresIn: config.expiresIn },
        } as JwtModuleOptions;
      },
      inject: [jwtConfig.KEY],
    }),
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
