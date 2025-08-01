import { IsUUID, IsObject } from 'class-validator';

export class CreatePlaybookDataDto {
  @IsUUID()
  playbookId: string;

  @IsObject()
  data: any;
} 