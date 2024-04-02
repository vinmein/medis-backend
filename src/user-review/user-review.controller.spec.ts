import { Test, TestingModule } from '@nestjs/testing';
import { UserReviewController } from './user-review.controller';
import { UserReviewService } from './user-review.service';

describe('UserReviewController', () => {
  let controller: UserReviewController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserReviewController],
      providers: [UserReviewService],
    }).compile();

    controller = module.get<UserReviewController>(UserReviewController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
