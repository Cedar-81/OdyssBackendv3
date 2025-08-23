import { Module } from '@nestjs/common';
import { WalletsController } from './wallets.controller';
import { WalletsService } from './wallets.service';
import { AnchorModule } from '../anchor/anchor.module';

@Module({
  imports: [AnchorModule],
  controllers: [WalletsController],
  providers: [WalletsService]
})
export class WalletsModule {}
