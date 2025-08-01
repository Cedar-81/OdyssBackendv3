import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PlaybooksModule } from './playbooks/playbooks.module';
import { PlaybookDataModule } from './playbook-data/playbook-data.module';
import { WalletsModule } from './wallets/wallets.module';
import { PocketsModule } from './pockets/pockets.module';
import { AiPlannerModule } from './ai-planner/ai-planner.module';
import { KycModule } from './kyc/kyc.module';

@Module({
  imports: [AuthModule, UsersModule, PlaybooksModule, PlaybookDataModule, WalletsModule, PocketsModule, AiPlannerModule, KycModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
