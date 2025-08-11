import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreatePlaybookDataDto } from './dto/create-playbook-data.dto';

@Injectable()
export class PlaybookDataService {
  constructor(private readonly supabaseService: SupabaseService) {}

  // Playbook Data operations

  // Helper to verify playbook exists
  private async verifyPlaybookExists(playbookId: string): Promise<void> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('playbooks')
      .select('id, owner_id')
      .eq('id', playbookId)
      .single();
    if (error || !data) {
      throw new NotFoundException(`Playbook with ID ${playbookId} not found`);
    }
  }

  // Helper to verify playbook exists and is owned by user
  private async verifyPlaybookOwnedByUser(playbookId: string, userId: string): Promise<void> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('playbooks')
      .select('id, owner_id')
      .eq('id', playbookId)
      .single();
    if (error || !data) {
        console.log("Playbook err: ", error, playbookId)
      throw new NotFoundException(`Playbook with ID ${playbookId} not found`);
    }
    if (data.owner_id !== userId) {
      throw new ForbiddenException(`Access denied to playbook with ID ${playbookId}`);
    }
  }

  // User-specific Playbook Data operations
  /**
   * createPlaybookDataForUser ensures the playbook is owned by the user before creating playbook data.
   * It requires both the data DTO and the userId for ownership verification.
   * 
   * createPlaybookData (not shown here) would be a generic method to create playbook data
   * without checking user ownership, likely used for system or admin operations.
   */
  async createPlaybookDataForUser(createPlaybookDataDto: CreatePlaybookDataDto, userId: string): Promise<any> {
    console.log("Playbookdatadto: ", createPlaybookDataDto.playbookId)
    // Verify playbook exists and user owns it
    await this.verifyPlaybookOwnedByUser(createPlaybookDataDto.playbookId, userId);

    const { playbookId, ...rest } = createPlaybookDataDto;
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('playbookdata')
      .insert({...rest, playbook_id: playbookId})
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getPlaybookDataForUser(playbookId: string, userId: string): Promise<any[]> {
    // Verify playbook exists and user owns it
    await this.verifyPlaybookOwnedByUser(playbookId, userId);

    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('playbookdata')
      .select('*')
      .eq('playbook_id', playbookId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  }

  async updatePlaybookDataForUser(id: string, data: any, userId: string): Promise<any> {
    const supabase = this.supabaseService.getClient();
    // Get playbookdata with playbook
    const { data: playbookData, error } = await supabase
      .from('playbookdata')
      .select('*, playbook:playbooks(*)')
      .eq('id', id)
      .single();
    if (error || !playbookData) {
      throw new NotFoundException(`Playbook data with ID ${id} not found`);
    }
    if (!playbookData.playbook || playbookData.playbook.owner_id !== userId) {
      throw new ForbiddenException(`Access denied to playbook data with ID ${id}`);
    }

    const { data: updated, error: updateError } = await supabase
      .from('playbookdata')
      .update({ data })
      .eq('id', id)
      .select()
      .single();
    if (updateError) throw updateError;
    return updated;
  }

  async removePlaybookDataForUser(id: string, userId: string): Promise<void> {
    const supabase = this.supabaseService.getClient();
    // Get playbookdata with playbook
    const { data: playbookData, error } = await supabase
      .from('playbookdata')
      .select('*, playbook:playbooks(*)')
      .eq('id', id)
      .single();
    if (error || !playbookData) {
      throw new NotFoundException(`Playbook data with ID ${id} not found`);
    }
    if (!playbookData.playbook || playbookData.playbook.owner_id !== userId) {
      throw new ForbiddenException(`Access denied to playbook data with ID ${id}`);
    }

    const { error: deleteError } = await supabase
      .from('playbookdata')
      .delete()
      .eq('id', id);
    if (deleteError) throw deleteError;
  }


  // Admin endpoints
  async createPlaybookData(createPlaybookDataDto: CreatePlaybookDataDto): Promise<any> {
    // Verify playbook exists
    await this.verifyPlaybookExists(createPlaybookDataDto.playbookId);

    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('playbookdata')
      .insert(createPlaybookDataDto)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getPlaybookData(playbookId: string): Promise<any[]> {
    // Verify playbook exists
    await this.verifyPlaybookExists(playbookId);

    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('playbookdata')
      .select('*')
      .eq('playbook_id', playbookId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  }

  async updatePlaybookData(id: string, data: any): Promise<any> {
    const supabase = this.supabaseService.getClient();
    // Ensure playbookdata exists
    const { data: playbookData, error } = await supabase
      .from('playbookdata')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !playbookData) {
      throw new NotFoundException(`Playbook data with ID ${id} not found`);
    }

    const { data: updated, error: updateError } = await supabase
      .from('playbookdata')
      .update({ data })
      .eq('id', id)
      .select()
      .single();
    if (updateError) throw updateError;
    return updated;
  }

  async removePlaybookData(id: string): Promise<void> {
    const supabase = this.supabaseService.getClient();
    // Ensure playbookdata exists
    const { data: playbookData, error } = await supabase
      .from('playbookdata')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !playbookData) {
      throw new NotFoundException(`Playbook data with ID ${id} not found`);
    }

    const { error: deleteError } = await supabase
      .from('playbookdata')
      .delete()
      .eq('id', id);
    if (deleteError) throw deleteError;
  }
}
