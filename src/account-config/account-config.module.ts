import { Module } from '@nestjs/common';
import { AccountConfigService } from './account-config.service';
import { AccountConfigController } from './account-config.controller';
import { DatabaseModule } from 'database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AccountConfigController],
  providers: [AccountConfigService],
  exports:[AccountConfigService]
})
export class AccountConfigModule {}
