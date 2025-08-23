import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlaybooksModule } from './playbooks/playbooks.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SupabaseModule } from './supabase/supabase.module';
import { ClerkClientProvider } from './providers/clerk-client.provider';
import { ClerkAuthGuard } from './auth/guards/clerk.guard';
import { AiModule } from './ai/ai.module';
import { KycModule } from './kyc/kyc.module';
import { WalletsModule } from './wallets/wallets.module';
import { PocketsModule } from './pockets/pockets.module';
import { CollabModule } from './collab/collab.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/test',
    }),
    SupabaseModule,
    AuthModule,
    UsersModule,
    PlaybooksModule,
    AiModule,
    KycModule,
    WalletsModule,
    PocketsModule,
    CollabModule,
  ],
  controllers: [AppController],
  providers: [
    ClerkClientProvider,
    // {
    //   provide: APP_GUARD,
    //   useClass: ClerkAuthGuard,
    // },
    AppService,
  ],
})
export class AppModule {}
