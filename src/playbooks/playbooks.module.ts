import { Module } from '@nestjs/common';
import { PlaybooksController } from './playbooks.controller';
import { PlaybooksService } from './playbooks.service';
import { UsersService } from 'src/users/users.service';
import { SupabaseService } from 'src/supabase/supabase.service';

@Module({
  controllers: [PlaybooksController],
  providers: [PlaybooksService, UsersService, SupabaseService]
})
export class PlaybooksModule {}
