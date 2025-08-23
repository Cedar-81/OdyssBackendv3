import { IsUUID, IsNumber } from 'class-validator';

export class FundPocketDto {
  @IsUUID()
  playbookId: string;

  @IsNumber()
  amount: number;
}
