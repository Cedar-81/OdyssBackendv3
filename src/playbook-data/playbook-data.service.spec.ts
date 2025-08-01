import { Test, TestingModule } from '@nestjs/testing';
import { PlaybookDataService } from './playbook-data.service';

describe('PlaybookDataService', () => {
  let service: PlaybookDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlaybookDataService],
    }).compile();

    service = module.get<PlaybookDataService>(PlaybookDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
