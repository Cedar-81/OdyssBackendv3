import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';

export enum WalletCurrency {
  NGN = 'NGN',
  USD = 'USD',
}

export class CreateWalletDto {
  @IsString()
  customer_id: string;

  @IsEnum(WalletCurrency)
  currency: WalletCurrency;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}


