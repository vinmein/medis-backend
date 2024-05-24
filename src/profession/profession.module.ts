import { Module } from '@nestjs/common';
import { ProfessionService } from './profession.service';
import { ProfessionController } from './profession.controller';
import { ProfileModule } from 'profile/profile.module';
import { DatabaseModule } from 'database/database.module';
import { UserReviewModule } from 'user-review/user-review.module';
import { LoggerModule } from 'logger/logger.module';

@Module({
  imports: [ProfileModule, DatabaseModule, UserReviewModule, LoggerModule],
  controllers: [ProfessionController],
  providers: [ProfessionService],
})
export class ProfessionModule {}
