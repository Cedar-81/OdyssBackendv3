import { Module } from '@nestjs/common';
import { PlaybookDataController } from './playbook-data.controller';
import { PlaybookDataService } from './playbook-data.service';
import { SupabaseService } from 'src/supabase/supabase.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [PlaybookDataController],
  providers: [PlaybookDataService, SupabaseService]
})
export class PlaybookDataModule {}
 