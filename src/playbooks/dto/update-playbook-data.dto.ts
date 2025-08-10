import { IsObject, IsOptional } from 'class-validator';

export class UpdatePlaybookDataDto {
  @IsObject()
  @IsOptional()
  data?: Record<string, any>;
}
