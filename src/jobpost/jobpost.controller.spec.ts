import { Test, TestingModule } from '@nestjs/testing';
import { JobpostController } from './jobpost.controller';
import { JobpostService } from './jobpost.service';

describe('JobpostController', () => {
  let controller: JobpostController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobpostController],
      providers: [JobpostService],
    }).compile();

    controller = module.get<JobpostController>(JobpostController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
