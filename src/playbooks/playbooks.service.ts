// import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Playbook } from './entities/playbook.entity';
// import { PlaybookData } from './entities/playbook-data.entity';
// import { CreatePlaybookDto } from './dto/create-playbook.dto';
// import { UpdatePlaybookDto } from './dto/update-playbook.dto';
// import { CreatePlaybookDataDto } from './dto/create-playbook-data.dto';

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreatePlaybookDto } from './dto/create-playbook.dto';
import { UpdatePlaybookDto } from './dto/update-playbook.dto';
import { CreatePlaybookDataDto } from '../playbook-data/dto/create-playbook-data.dto';

@Injectable()
export class PlaybooksService {
  constructor(private readonly supabaseService: SupabaseService) {}

  // User-specific Playbook CRUD operations
  async createForUser(createPlaybookDto: CreatePlaybookDto, userId: string): Promise<any> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('playbooks')
      .insert({ ...createPlaybookDto, owner_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async findAllForUser(userId: string): Promise<any[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('playbooks')
      .select('*, playbookdata(*), playbookparticipants(*)')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async findOneForUser(id: string, userId: string): Promise<any> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('playbooks')
      .select('*, playbookdata(*), playbookparticipants(*)')
      .eq('id', id)
      .eq('owner_id', userId)
      .single();
    if (error || !data) {
      throw new NotFoundException(`Playbook with ID ${id} not found or access denied`);
    }
    return data;
  }

  async updateForUser(id: string, updatePlaybookDto: UpdatePlaybookDto, userId: string): Promise<any> {
    const supabase = this.supabaseService.getClient();
    // Ensure playbook exists and user owns it
    await this.findOneForUser(id, userId);

    if (updatePlaybookDto.startDate) {
      updatePlaybookDto.startDate = new Date(updatePlaybookDto.startDate).toISOString();
    }
    if (updatePlaybookDto.endDate) {
      updatePlaybookDto.endDate = new Date(updatePlaybookDto.endDate).toISOString();
    }

    const { data, error } = await supabase
      .from('playbooks')
      .update(updatePlaybookDto)
      .eq('id', id)
      .eq('owner_id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async removeForUser(id: string, userId: string): Promise<void> {
    const supabase = this.supabaseService.getClient();
    // Ensure playbook exists and user owns it
    await this.findOneForUser(id, userId);

    const { error } = await supabase
      .from('playbooks')
      .delete()
      .eq('id', id)
      .eq('owner_id', userId);
    if (error) throw error;
  }

  // Legacy methods (kept for backward compatibility)
  async create(createPlaybookDto: CreatePlaybookDto): Promise<any> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('playbooks')
      .insert(createPlaybookDto)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async findAll(): Promise<any[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('playbooks')
      .select('*, playbookdata(*), playbookparticipants(*)');
    if (error) throw error;
    return data;
  }

  async findOne(id: string): Promise<any> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('playbooks')
      .select('*, playbookdata(*), playbookparticipants(*)')
      .eq('id', id)
      .single();
    if (error || !data) {
      throw new NotFoundException(`Playbook with ID ${id} not found`);
    }
    return data;
  }

  async update(id: string, updatePlaybookDto: UpdatePlaybookDto): Promise<any> {
    const supabase = this.supabaseService.getClient();
    // Ensure playbook exists
    await this.findOne(id);

    if (updatePlaybookDto.startDate) {
      updatePlaybookDto.startDate = new Date(updatePlaybookDto.startDate).toISOString();
    }
    if (updatePlaybookDto.endDate) {
      updatePlaybookDto.endDate = new Date(updatePlaybookDto.endDate).toISOString();
    }

    const { data, error } = await supabase
      .from('playbooks')
      .update(updatePlaybookDto)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async remove(id: string): Promise<void> {
    const supabase = this.supabaseService.getClient();
    // Ensure playbook exists
    await this.findOne(id);

    const { error } = await supabase
      .from('playbooks')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

}