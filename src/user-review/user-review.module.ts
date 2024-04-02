import { Module } from '@nestjs/common';
import { UserReviewService } from './user-review.service';
import { UserReviewController } from './user-review.controller';

@Module({
  controllers: [UserReviewController],
  providers: [UserReviewService],
})
export class UserReviewModule {}
