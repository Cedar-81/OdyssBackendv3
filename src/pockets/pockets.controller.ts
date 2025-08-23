import { Body, Controller, Param, Post, Get, Query } from '@nestjs/common';
import { PocketsService } from './pockets.service';
import { CreatePocketDto } from './dto/create-pocket.dto';
import { TransferDto } from './dto/transfer.dto';

@Controller('pockets')
export class PocketsController {
  constructor(private readonly pocketsService: PocketsService) {}

  @Post(':walletId')
  async createPocket(
    @Param('walletId') walletId: string, 
    @Query('playbookId') playbookId: string,
    @Body() body: CreatePocketDto
  ) {
    return this.pocketsService.createPocket(walletId, playbookId, body);
  }

  @Post(':walletId/transfer')
  async transfer(@Param('walletId') walletId: string, @Body() body: TransferDto) {
    return this.pocketsService.transfer(walletId, body);
  }

  @Get(':walletId/balance')
  async getPocketBalance(
    @Param('walletId') walletId: string,
    @Query('playbookId') playbookId: string
  ) {
    return this.pocketsService.getPocketBalance(walletId, playbookId);
  }
}
