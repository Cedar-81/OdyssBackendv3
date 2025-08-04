import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlaybooksModule } from './playbooks/playbooks.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SupabaseModule } from './supabase/supabase.module';
import { ClerkClientProvider } from './providers/clerk-client.provider';
import { ClerkAuthGuard } from './auth/guards/clerk.guard';
import { AiPlannerModule } from './ai-planner/ai-planner.module';
import { KycModule } from './kyc/kyc.module';
import { WalletsModule } from './wallets/wallets.module';
import { PocketsModule } from './pockets/pockets.module';
import { PlaybookDataModule } from './playbook-data/playbook-data.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'odyss',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    SupabaseModule,
    AuthModule,
    UsersModule,
    PlaybooksModule,
    AiPlannerModule,
    KycModule,
    WalletsModule,
    PocketsModule,
    PlaybookDataModule,
  ],
  controllers: [AppController],
  providers: [
    ClerkClientProvider,
    // Temporarily disabled global auth guard to test API
    {
      provide: APP_GUARD,
      useClass: ClerkAuthGuard,
    },
    AppService,
  ],
})
export class AppModule {}
