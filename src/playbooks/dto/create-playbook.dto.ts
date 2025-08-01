import { IsString, IsDateString, IsOptional } from 'class-validator';

export class CreatePlaybookDto {
  @IsString()
  title: string;

  @IsString()
  destination: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  description?: string;
}
