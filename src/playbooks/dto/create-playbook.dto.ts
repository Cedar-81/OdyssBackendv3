import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreatePlaybookDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  destination?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
} 