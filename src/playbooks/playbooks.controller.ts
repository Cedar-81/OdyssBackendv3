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
    console.log("id: ", req.supabaseUser.id)
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
}