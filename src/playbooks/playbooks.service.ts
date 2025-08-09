import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Playbook } from './entities/playbook.entity';
import { PlaybookData } from './entities/playbook-data.entity';
import { CreatePlaybookDto } from './dto/create-playbook.dto';
import { UpdatePlaybookDto } from './dto/update-playbook.dto';
import { CreatePlaybookDataDto } from './dto/create-playbook-data.dto';

@Injectable()
export class PlaybooksService {
  constructor(
    @InjectRepository(Playbook)
    private playbookRepository: Repository<Playbook>,
    @InjectRepository(PlaybookData)
    private playbookDataRepository: Repository<PlaybookData>,
  ) {}

  // User-specific Playbook CRUD operations
  async createForUser(createPlaybookDto: CreatePlaybookDto, userId: string): Promise<Playbook> {
    const playbook = this.playbookRepository.create({
      ...createPlaybookDto,
      ownerId: userId,
    });
    return await this.playbookRepository.save(playbook);
  }

  async findAllForUser(userId: string): Promise<Playbook[]> {
    return await this.playbookRepository.find({
      where: { ownerId: userId },
      relations: ['playbookData', 'participants'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOneForUser(id: string, userId: string): Promise<Playbook> {
    const playbook = await this.playbookRepository.findOne({
      where: { id, ownerId: userId },
      relations: ['playbookData', 'participants'],
    });
    
    if (!playbook) {
      throw new NotFoundException(`Playbook with ID ${id} not found or access denied`);
    }
    
    return playbook;
  }

  async updateForUser(id: string, updatePlaybookDto: UpdatePlaybookDto, userId: string): Promise<Playbook> {
    const playbook = await this.findOneForUser(id, userId);
    
    // Convert date strings to Date objects if provided
    if (updatePlaybookDto.startDate) {
      updatePlaybookDto.startDate = new Date(updatePlaybookDto.startDate).toISOString();
    }
    if (updatePlaybookDto.endDate) {
      updatePlaybookDto.endDate = new Date(updatePlaybookDto.endDate).toISOString();
    }
    
    Object.assign(playbook, updatePlaybookDto);
    return await this.playbookRepository.save(playbook);
  }

  async removeForUser(id: string, userId: string): Promise<void> {
    const playbook = await this.findOneForUser(id, userId);
    await this.playbookRepository.remove(playbook);
  }

  // User-specific Playbook Data operations
  async createPlaybookDataForUser(createPlaybookDataDto: CreatePlaybookDataDto, userId: string): Promise<PlaybookData> {
    // Verify playbook exists and user owns it
    await this.findOneForUser(createPlaybookDataDto.playbookId, userId);
    
    const playbookData = this.playbookDataRepository.create(createPlaybookDataDto);
    return await this.playbookDataRepository.save(playbookData);
  }

  async getPlaybookDataForUser(playbookId: string, userId: string): Promise<PlaybookData[]> {
    // Verify playbook exists and user owns it
    await this.findOneForUser(playbookId, userId);
    
    return await this.playbookDataRepository.find({
      where: { playbookId },
      order: { createdAt: 'ASC' },
    });
  }

  async updatePlaybookDataForUser(id: string, data: any, userId: string): Promise<PlaybookData> {
    const playbookData = await this.playbookDataRepository.findOne({
      where: { id },
      relations: ['playbook'],
    });
    
    if (!playbookData) {
      throw new NotFoundException(`Playbook data with ID ${id} not found`);
    }

    // Verify user owns the playbook
    if (playbookData.playbook?.ownerId !== userId) {
      throw new ForbiddenException(`Access denied to playbook data with ID ${id}`);
    }
    
    playbookData.data = data;
    return await this.playbookDataRepository.save(playbookData);
  }

  async removePlaybookDataForUser(id: string, userId: string): Promise<void> {
    const playbookData = await this.playbookDataRepository.findOne({
      where: { id },
      relations: ['playbook'],
    });
    
    if (!playbookData) {
      throw new NotFoundException(`Playbook data with ID ${id} not found`);
    }

    // Verify user owns the playbook
    if (playbookData.playbook?.ownerId !== userId) {
      throw new ForbiddenException(`Access denied to playbook data with ID ${id}`);
    }
    
    await this.playbookDataRepository.remove(playbookData);
  }

  // Legacy methods (kept for backward compatibility)
  async create(createPlaybookDto: CreatePlaybookDto): Promise<Playbook> {
    const playbook = this.playbookRepository.create(createPlaybookDto);
    return await this.playbookRepository.save(playbook);
  }

  async findAll(): Promise<Playbook[]> {
    return await this.playbookRepository.find({
      relations: ['playbookData', 'participants'],
    });
  }

  async findOne(id: string): Promise<Playbook> {
    const playbook = await this.playbookRepository.findOne({
      where: { id },
      relations: ['playbookData', 'participants'],
    });
    
    if (!playbook) {
      throw new NotFoundException(`Playbook with ID ${id} not found`);
    }
    
    return playbook;
  }

  async update(id: string, updatePlaybookDto: UpdatePlaybookDto): Promise<Playbook> {
    const playbook = await this.findOne(id);
    
    // Convert date strings to Date objects if provided
    if (updatePlaybookDto.startDate) {
      updatePlaybookDto.startDate = new Date(updatePlaybookDto.startDate).toISOString();
    }
    if (updatePlaybookDto.endDate) {
      updatePlaybookDto.endDate = new Date(updatePlaybookDto.endDate).toISOString();
    }
    
    Object.assign(playbook, updatePlaybookDto);
    return await this.playbookRepository.save(playbook);
  }

  async remove(id: string): Promise<void> {
    const playbook = await this.findOne(id);
    await this.playbookRepository.remove(playbook);
  }

  // Playbook Data operations
  async createPlaybookData(createPlaybookDataDto: CreatePlaybookDataDto): Promise<PlaybookData> {
    // Verify playbook exists
    await this.findOne(createPlaybookDataDto.playbookId);
    
    const playbookData = this.playbookDataRepository.create(createPlaybookDataDto);
    return await this.playbookDataRepository.save(playbookData);
  }

  async getPlaybookData(playbookId: string): Promise<PlaybookData[]> {
    // Verify playbook exists
    await this.findOne(playbookId);
    
    return await this.playbookDataRepository.find({
      where: { playbookId },
      order: { createdAt: 'ASC' },
    });
  }

  async updatePlaybookData(id: string, data: any): Promise<PlaybookData> {
    const playbookData = await this.playbookDataRepository.findOne({
      where: { id },
    });
    
    if (!playbookData) {
      throw new NotFoundException(`Playbook data with ID ${id} not found`);
    }
    
    playbookData.data = data;
    return await this.playbookDataRepository.save(playbookData);
  }

  async removePlaybookData(id: string): Promise<void> {
    const playbookData = await this.playbookDataRepository.findOne({
      where: { id },
    });
    
    if (!playbookData) {
      throw new NotFoundException(`Playbook data with ID ${id} not found`);
    }
    
    await this.playbookDataRepository.remove(playbookData);
  }
} 


