import { Injectable } from '@nestjs/common';
import { AnchorService } from '../anchor/anchor.service';
import { CreatePocketDto } from './dto/create-pocket.dto';
import { TransferDto } from './dto/transfer.dto';

@Injectable()
export class PocketsService {
  constructor(private readonly anchor: AnchorService) {}

  async createPocket(walletId: string, playbookId: string, payload: CreatePocketDto) {
    // Create a pocket specific to a playbook with restricted fund usage
    return this.anchor.createPocket(walletId, playbookId, payload);
  }

  async transfer(walletId: string, payload: TransferDto) {
    // Transfer between playbook-specific pockets
    return this.anchor.transferBetweenPockets(
      walletId, 
      payload.source_playbook_id, 
      payload.target_playbook_id, 
      payload
    );
  }

  async getPocketBalance(walletId: string, playbookId: string) {
    // Get balance for a specific playbook pocket
    return this.anchor.getPocketBalance(walletId, playbookId);
  }
}
