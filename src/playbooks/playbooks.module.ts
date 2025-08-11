import { Module } from '@nestjs/common';
import { PlaybooksService } from './playbooks.service';
import { PlaybooksController } from './playbooks.controller';
import { SupabaseService } from 'src/supabase/supabase.service';
import { UsersService } from 'src/users/users.service';
import { SupabaseUserInterceptor } from 'src/interceptors/supabase-user.interceptor';

@Module({
  imports: [ ],
  controllers: [PlaybooksController],
  providers: [PlaybooksService, SupabaseService, UsersService],
  exports: [PlaybooksService],
})
export class PlaybooksModule {} 