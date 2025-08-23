import { Module } from '@nestjs/common';
import { KycController } from './kyc.controller';
import { KycService } from './kyc.service';
import { AnchorModule } from '../anchor/anchor.module';

@Module({
  imports: [AnchorModule],
  controllers: [KycController],
  providers: [KycService]
})
export class KycModule {}
