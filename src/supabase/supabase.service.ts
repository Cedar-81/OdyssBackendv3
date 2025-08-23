import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;
  private configService: ConfigService  

  constructor(configService: ConfigService) {
    this.configService = configService;
    const supabaseUrl = this.configService.get('SUPABASE_URL');
    const supabaseServiceRoleKey = this.configService.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
    }

    this.supabase = createClient(
      supabaseUrl,
      supabaseServiceRoleKey // full access key - gives ability to bypass RLS and should be used only on backend
    );
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }
}
