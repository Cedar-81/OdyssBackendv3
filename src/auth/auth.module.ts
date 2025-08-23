import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { ClerkStrategy } from './clerk.strategy';
import { ClerkClientProvider } from 'src/providers/clerk-client.provider';

@Module({
  imports: [PassportModule, ConfigModule],
  providers: [AuthService, ClerkStrategy, ClerkClientProvider],
  exports: [PassportModule],
})
export class AuthModule {}
