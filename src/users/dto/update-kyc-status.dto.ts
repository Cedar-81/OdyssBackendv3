import { IsUUID, IsString } from 'class-validator';

export class UpdateKycStatusDto {
  @IsUUID()
  userId: string;

  @IsString()
  status: string; // e.g., 'verified', 'pending', 'rejected'
}
