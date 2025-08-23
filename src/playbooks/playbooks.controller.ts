import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PlaybookService } from './playbooks.service';
import type { CreatePlaybookDto } from './dto/create-playbook.dto';
import { SupabaseUserInterceptor } from '../interceptors/supabase-user.interceptor';
import { UseInterceptors } from '@nestjs/common';

@Controller('playbooks')
@UseInterceptors(SupabaseUserInterceptor)
export class PlaybooksController {
  constructor(private readonly playbookService: PlaybookService) {}

  /** Create a new playbook */
  @Post()
  async createPlaybook(@Req() req: any, @Body() playbookData: CreatePlaybookDto) {
    try {
      const userId = req.supabaseUser.id; // Now using supabaseUser from interceptor
      const result = await this.playbookService.createPlaybook(userId, playbookData);
      return { playbookId: result.playbookId };
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  /** Load a specific playbook by ID */
  @Get(':id')
  async loadPlaybook(@Param('id') playbookId: string, @Req() req: any) {
    try {
      const userId = req.supabaseUser.id;
      const playbook = await this.playbookService.loadPlaybook(playbookId, userId);
      return playbook;
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  /** Optionally: list all playbooks for the authenticated user */
  @Get()
  async listPlaybooks(@Req() req: any) {
    try {
      const userId = req.supabaseUser.id;
      const client = this.playbookService['supabaseService'].getClient();
      const { data, error } = await client
        .from('playbooksv2')
        .select('id, owner_id')
        .eq('owner_id', userId);

      if (error) throw new Error(error.message);
      return data;
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }
}
