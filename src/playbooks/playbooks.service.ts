import { Injectable, NotFoundException } from '@nestjs/common';
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

  // Playbook CRUD operations
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