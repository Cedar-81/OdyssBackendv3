import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'odyss',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production', // Auto-sync in development
      logging: process.env.NODE_ENV !== 'production',
    }),
    AuthModule, 
    UsersModule, 
    PlaybooksModule, 
    PlaybookDataModule, 
    WalletsModule, 
    PocketsModule, 
    AiPlannerModule, 
    KycModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
