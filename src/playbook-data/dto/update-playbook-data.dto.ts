import { IsUUID, IsObject } from 'class-validator';

export class UpdatePlaybookDataDto {
  @IsUUID()
  playbookId: string;

  @IsObject()
  data: any; // JSONB — validated in service layer if needed
}
