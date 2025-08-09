import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaybooksService } from './playbooks.service';
import { PlaybooksController } from './playbooks.controller';
import { Playbook } from './entities/playbook.entity';
import { PlaybookData } from './entities/playbook-data.entity';
import { PlaybookParticipant } from './entities/playbook-participant.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Playbook, PlaybookData, PlaybookParticipant]),
    UsersModule,
  ],
  controllers: [PlaybooksController],
  providers: [PlaybooksService],
  exports: [PlaybooksService],
})
export class PlaybooksModule {} 