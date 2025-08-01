import { Module } from '@nestjs/common';
import { PlaybookDataController } from './playbook-data.controller';
import { PlaybookDataService } from './playbook-data.service';

@Module({
  controllers: [PlaybookDataController],
  providers: [PlaybookDataService]
})
export class PlaybookDataModule {}
