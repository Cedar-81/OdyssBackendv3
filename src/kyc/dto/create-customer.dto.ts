import { IsEmail, IsObject, IsOptional, IsString, IsEnum } from 'class-validator';

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
}

export class CreateCustomerDto {
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string; // Nigerian phone format: 07061234507

  // Address fields (required by Anchor)
  @IsString()
  address_line_1: string;

  @IsOptional()
  @IsString()
  address_line_2?: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  postal_code: string;

  @IsString()
  country: string = 'NG'; // Default to Nigeria

  // KYC Level 2 fields (optional but recommended)
  @IsOptional()
  @IsString()
  bvn?: string;

  @IsOptional()
  @IsString()
  date_of_birth?: string; // Format: YYYY-MM-DD

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}


