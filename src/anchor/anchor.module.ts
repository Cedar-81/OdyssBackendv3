import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AnchorService } from './anchor.service';

@Module({
  imports: [ConfigModule],
  providers: [AnchorService],
  exports: [AnchorService],
})
export class AnchorModule {} //this should be all... probably... idk


