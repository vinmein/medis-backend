import { Module } from '@nestjs/common';
import { JobpostService } from './jobpost.service';
import { JobpostController } from './jobpost.controller';
import { DatabaseModule } from 'database/database.module';
import { AccountConfigModule } from 'account-config/account-config.module';

@Module({
  imports:[DatabaseModule, AccountConfigModule],
  controllers: [JobpostController],
  providers: [JobpostService],
})
export class JobpostModule {}
