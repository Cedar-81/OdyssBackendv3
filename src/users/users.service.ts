import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class UsersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getOrCreateByClerkId(clerkUserId: string, email: string) {
    const supabase = this.supabaseService.getClient();

    const { data: users } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .limit(1);

    if (users && users.length > 0) return users[0];

    const { data: newUser } = await supabase
      .from('users')
      .insert({ clerk_user_id: clerkUserId, email })
      .single();

    return newUser;
  }
}