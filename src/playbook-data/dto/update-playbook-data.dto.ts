import { IsUUID, IsObject } from 'class-validator';
import type { PlaybookData } from '../interfaces/playbook-data.interface';

export class UpdatePlaybookDataDto {
  @IsUUID()
  playbookId: string;

  @IsObject()
  data: PlaybookData; // JSONB — validated in service layer if needed
}
