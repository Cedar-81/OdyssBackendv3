import { IsString, IsDateString, IsArray, IsOptional } from 'class-validator';

export class GenerateItineraryDto {
  @IsString()
  destination: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsArray()
  preferences?: string[]; // e.g., ['adventure', 'food', 'culture']
}
