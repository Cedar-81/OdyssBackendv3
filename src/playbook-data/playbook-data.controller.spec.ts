import { Test, TestingModule } from '@nestjs/testing';
import { PlaybookDataController } from './playbook-data.controller';

describe('PlaybookDataController', () => {
  let controller: PlaybookDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlaybookDataController],
    }).compile();

    controller = module.get<PlaybookDataController>(PlaybookDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
