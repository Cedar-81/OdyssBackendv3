import { IsNumber, IsString, Min } from 'class-validator';

export class TransferDto {
  @IsString()
  source_playbook_id: string;

  @IsString()
  target_playbook_id: string;

  @IsString()
  source_pocket_name: string;

  @IsString()
  target_pocket_name: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  description: string;

  @IsString()
  reason: string; // Why the transfer is happening (e.g., "Budget reallocation", "Emergency fund")
}
