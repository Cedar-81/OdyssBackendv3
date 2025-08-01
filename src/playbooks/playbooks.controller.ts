import { Controller, Get, Req, UseInterceptors } from '@nestjs/common';
import { SupabaseUserInterceptor } from 'src/interceptors/supabase-user.interceptor';

@UseInterceptors(SupabaseUserInterceptor)
@Controller('playbooks')
export class PlaybooksController {
    @Get()
    async getPlaybooks(@Req() req: Request) {
        return "Here is your playbook";
    }
}
