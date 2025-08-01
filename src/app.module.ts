import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
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
import { SupabaseModule } from './supabase/supabase.module';
import { ConfigModule } from '@nestjs/config';
import { ClerkClientProvider } from './providers/clerk-client.provider';
import { APP_GUARD } from '@nestjs/core';
import { ClerkAuthGuard } from './auth/guards/clerk.guard';
import { UsersService } from './users/users.service';

@Module({
  imports: [ConfigModule.forRoot({isGlobal: true}), SupabaseModule, AuthModule, UsersModule, PlaybooksModule, PlaybookDataModule, WalletsModule, PocketsModule, AiPlannerModule, KycModule],
  controllers: [AppController],
  providers: [ClerkClientProvider, {
      provide: APP_GUARD,
      useClass: ClerkAuthGuard,
    }, UsersService, AppService],
})
export class AppModule {}
