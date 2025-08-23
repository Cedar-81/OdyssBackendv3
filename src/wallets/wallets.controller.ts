import { Body, Controller, Get, Param, Post, Patch, Query } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { CreateWalletDto } from './dto/create-wallet.dto';

@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post()
  async createWallet(@Body() body: CreateWalletDto) {
    return this.walletsService.createWallet(body);
  }

  @Get(':id')
  async getWallet(@Param('id') id: string) {
    return this.walletsService.getWallet(id);
  }

  @Get(':id/balance')
  async getWalletBalance(@Param('id') id: string) {
    return this.walletsService.getWalletBalance(id);
  }

  @Get(':id/account-numbers')
  async getWalletAccountNumbers(@Param('id') id: string) {
    return this.walletsService.getWalletAccountNumbers(id);
  }

  @Patch(':id/freeze')
  async freezeWallet(@Param('id') id: string, @Body() body: { reason?: string }) {
    return this.walletsService.freezeWallet(id, body.reason);
  }

  @Patch(':id/unfreeze')
  async unfreezeWallet(@Param('id') id: string) {
    return this.walletsService.unfreezeWallet(id);
  }
}
