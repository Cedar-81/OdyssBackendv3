//import { Controller, Get } from '@nestjs/common';
import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './decorators/public.decorator';
import { SupabaseService } from './supabase/supabase.service';
import { UsersService } from './users/users.service';

@Controller()
export class AppController {
//constructor(private readonly appService: AppService) {}
  constructor(
    private readonly appService: AppService,
    private readonly supabaseService: SupabaseService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @Public()
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('config')
  @Public()
  getConfig(): { clerkPublishableKey: string } {
    return {
      clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY || '',
    };
  }

  @Post('test-playbook')
  @Public()
  async createTestPlaybook(@Body() playbookData: any) {
    try {
      const supabase = this.supabaseService.getClient();

      const clerkUserId: string = playbookData.clerkUserId || 'user_30hGW1WBabPlXEVgqYlsubp4fA1';
      const email: string = playbookData.email || 'test@example.com';

      const supabaseUser = await this.usersService.getOrCreateByClerkId(
        clerkUserId,
        email,
      );

      const safePayload: Record<string, any> = {};
      if (typeof playbookData.title === 'string') safePayload.title = playbookData.title;
      if (typeof playbookData.description === 'string') safePayload.description = playbookData.description;

      const { data, error } = await supabase
        .from('playbooks')
        .insert({
          ...safePayload,
          owner_id: supabaseUser.id,
        })
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { success: true, data };
    } catch (error: any) {
      return { error: error.message || 'Unknown error' };
    }
  }
}
