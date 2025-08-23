import { Module } from '@nestjs/common';
import { PocketsController } from './pockets.controller';
import { PocketsService } from './pockets.service';
import { AnchorModule } from '../anchor/anchor.module';

@Module({
  imports: [AnchorModule],
  controllers: [PocketsController],
  providers: [PocketsService]
})
export class PocketsModule {}
