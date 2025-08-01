import { Test, TestingModule } from '@nestjs/testing';
import { PlaybooksService } from './playbooks.service';

describe('PlaybooksService', () => {
  let service: PlaybooksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlaybooksService],
    }).compile();

    service = module.get<PlaybooksService>(PlaybooksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
