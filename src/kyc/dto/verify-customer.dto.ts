import { IsEnum, IsString } from 'class-validator';

export enum KYCLevel {
  TIER_1 = 'TIER_1',
  TIER_2 = 'TIER_2',
}

export class VerifyCustomerDto {
  @IsEnum(KYCLevel)
  level: KYCLevel;

  @IsString()
  bvn: string;

  @IsString()
  date_of_birth: string; // Format: YYYY-MM-DD

  @IsString()
  gender: string; // Male or Female
}
