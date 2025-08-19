import { Module } from '@nestjs/common';
import { PlaybookService } from './playbooks.service';
import { PlaybooksController } from './playbooks.controller';
import { SupabaseService } from 'src/supabase/supabase.service';
import { UsersService } from 'src/users/users.service';
import { PlaybookDocsStore } from './playbook-docs.store';

@Module({
  imports: [ ],
  controllers: [PlaybooksController],
  providers: [PlaybookService, SupabaseService, UsersService, PlaybookDocsStore],
  exports: [PlaybookService],
})
export class PlaybooksModule {} 