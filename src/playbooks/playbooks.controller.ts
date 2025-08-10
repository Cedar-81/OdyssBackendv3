import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { PlaybooksService } from './playbooks.service';
import { CreatePlaybookDto } from './dto/create-playbook.dto';
import { UpdatePlaybookDto } from './dto/update-playbook.dto';
import { CreatePlaybookDataDto } from './dto/create-playbook-data.dto';
import { UpdatePlaybookDataDto } from './dto/update-playbook-data.dto';
import { SupabaseUserInterceptor } from '../interceptors/supabase-user.interceptor';
import type { AuthenticatedRequest } from './interfaces/request.interface';

@Controller('playbooks')
@UseInterceptors(SupabaseUserInterceptor)
export class PlaybooksController {
  constructor(private readonly playbooksService: PlaybooksService) {}

  // Playbook CRUD endpoints
  @Post()
  create(@Body() createPlaybookDto: CreatePlaybookDto, @Req() req: AuthenticatedRequest) {
    return this.playbooksService.createForUser(createPlaybookDto, req.supabaseUser.id);
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.playbooksService.findAllForUser(req.supabaseUser.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.playbooksService.findOneForUser(id, req.supabaseUser.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePlaybookDto: UpdatePlaybookDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.playbooksService.updateForUser(id, updatePlaybookDto, req.supabaseUser.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.playbooksService.removeForUser(id, req.supabaseUser.id);
  }

  // Playbook Data endpoints
  @Post('data')
  createPlaybookData(@Body() createPlaybookDataDto: CreatePlaybookDataDto, @Req() req: AuthenticatedRequest) {
    return this.playbooksService.createPlaybookDataForUser(createPlaybookDataDto, req.supabaseUser.id);
  }

  @Get(':playbookId/data')
  getPlaybookData(@Param('playbookId') playbookId: string, @Req() req: AuthenticatedRequest) {
    return this.playbooksService.getPlaybookDataForUser(playbookId, req.supabaseUser.id);
  }

  @Patch('data/:id')
  updatePlaybookData(@Param('id') id: string, @Body() data: UpdatePlaybookDataDto, @Req() req: AuthenticatedRequest) {
    return this.playbooksService.updatePlaybookDataForUser(id, data, req.supabaseUser.id);
  }

  @Delete('data/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removePlaybookData(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.playbooksService.removePlaybookDataForUser(id, req.supabaseUser.id);
  }
}