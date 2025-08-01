import { IsString, IsOptional, IsDateString, IsUUID } from 'class-validator';

export class CreatePlaybookDto {
  @IsString()
  title: string;

  @IsUUID()
  ownerId: string;

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