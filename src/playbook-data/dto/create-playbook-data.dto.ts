import { IsUUID, IsObject } from 'class-validator';
import type { PlaybookData } from '../interfaces/playbook-data.interface';
import { Expose } from 'class-transformer';

export class CreatePlaybookDataDto {
  @Expose({ name: 'playbook_id' })
  @IsUUID()
  playbookId: string;

  @IsObject()
  data: PlaybookData;
} 