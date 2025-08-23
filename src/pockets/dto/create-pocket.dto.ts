import { IsNumber, IsOptional, IsString, Min, IsEnum } from 'class-validator';

export enum PocketType {
  FLIGHTS = 'flights',
  HOTELS = 'hotels',
  FOOD = 'food',
  ACTIVITIES = 'activities',
  TRANSPORT = 'transport',
  SHOPPING = 'shopping',
  EMERGENCY = 'emergency',
  OTHER = 'other',
}

export class CreatePocketDto {
  @IsString()
  name: string;

  @IsEnum(PocketType)
  type: PocketType;

  @IsString()
  description: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  initial_amount?: number;

  @IsOptional()
  @IsString()
  color?: string; // For UI display purposes
}


