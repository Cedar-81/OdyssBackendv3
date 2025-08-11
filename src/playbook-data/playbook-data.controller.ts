import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { PlaybookDataService } from './playbook-data.service';
import { CreatePlaybookDataDto } from './dto/create-playbook-data.dto';
import { UpdatePlaybookDataDto } from '../playbooks/dto/update-playbook-data.dto';
import { SupabaseUserInterceptor } from '../interceptors/supabase-user.interceptor';
import type { AuthenticatedRequest } from '../playbooks/interfaces/request.interface';

@Controller('playbook-data')
@UseInterceptors(SupabaseUserInterceptor)
export class PlaybookDataController {
  constructor(private readonly playbookDataService: PlaybookDataService) {}

  // Playbook Data endpoints
  @Post()
  createPlaybookData(
    @Body() createPlaybookDataDto: CreatePlaybookDataDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.playbookDataService.createPlaybookDataForUser(
      createPlaybookDataDto,
      req.supabaseUser.id,
    );
  }

  @Get(':playbookId')
  getPlaybookData(
    @Param('playbookId') playbookId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.playbookDataService.getPlaybookDataForUser(
      playbookId,
      req.supabaseUser.id,
    );
  }

  @Patch(':id')
  updatePlaybookData(
    @Param('id') id: string,
    @Body() data: UpdatePlaybookDataDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.playbookDataService.updatePlaybookDataForUser(
      id,
      data,
      req.supabaseUser.id,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removePlaybookData(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.playbookDataService.removePlaybookDataForUser(
      id,
      req.supabaseUser.id,
    );
  }
}
