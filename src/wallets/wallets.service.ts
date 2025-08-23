import { Injectable } from '@nestjs/common';
import { AnchorService } from '../anchor/anchor.service';
import { CreateWalletDto } from './dto/create-wallet.dto';

@Injectable()
export class WalletsService {
  constructor(private readonly anchor: AnchorService) {}

  async createWallet(payload: CreateWalletDto) {
    return this.anchor.createWallet(payload);
  }

  async getWallet(walletId: string) {
    return this.anchor.getWallet(walletId);
  }

  async getWalletBalance(walletId: string) {
    return this.anchor.getWalletBalance(walletId);
  }

  async getWalletAccountNumbers(walletId: string) {
    return this.anchor.getWalletAccountNumbers(walletId);
  }

  async freezeWallet(walletId: string, reason?: string) {
    return this.anchor.freezeWallet(walletId, reason);
  }

  async unfreezeWallet(walletId: string) {
    return this.anchor.unfreezeWallet(walletId);
  }
}
