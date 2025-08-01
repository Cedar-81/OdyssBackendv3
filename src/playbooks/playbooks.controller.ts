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
} from '@nestjs/common';
import { PlaybooksService } from './playbooks.service';
import { CreatePlaybookDto } from './dto/create-playbook.dto';
import { UpdatePlaybookDto } from './dto/update-playbook.dto';
import { CreatePlaybookDataDto } from './dto/create-playbook-data.dto';

@Controller('playbooks')
export class PlaybooksController {
  constructor(private readonly playbooksService: PlaybooksService) {}

  // Playbook CRUD endpoints
  @Post()
  create(@Body() createPlaybookDto: CreatePlaybookDto) {
    return this.playbooksService.create(createPlaybookDto);
  }

  @Get()
  findAll() {
    return this.playbooksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.playbooksService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlaybookDto: UpdatePlaybookDto) {
    return this.playbooksService.update(id, updatePlaybookDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.playbooksService.remove(id);
  }

  // Playbook Data endpoints
  @Post('data')
  createPlaybookData(@Body() createPlaybookDataDto: CreatePlaybookDataDto) {
    return this.playbooksService.createPlaybookData(createPlaybookDataDto);
  }

  @Get(':playbookId/data')
  getPlaybookData(@Param('playbookId') playbookId: string) {
    return this.playbooksService.getPlaybookData(playbookId);
  }

  @Patch('data/:id')
  updatePlaybookData(@Param('id') id: string, @Body() data: any) {
    return this.playbooksService.updatePlaybookData(id, data);
  }

  @Delete('data/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removePlaybookData(@Param('id') id: string) {
    return this.playbooksService.removePlaybookData(id);
  }
} 