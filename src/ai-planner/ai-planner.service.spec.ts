import { Test, TestingModule } from '@nestjs/testing';
import { AiPlannerService } from './ai-planner.service';

describe('AiPlannerService', () => {
  let service: AiPlannerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiPlannerService],
    }).compile();

    service = module.get<AiPlannerService>(AiPlannerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
