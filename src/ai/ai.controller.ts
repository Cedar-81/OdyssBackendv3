import { Body, Controller, Post, Req, UseInterceptors } from '@nestjs/common';
import { AiService } from './ai.service';
import { GenerateDto } from './dto/generate.dto';
import { SupabaseUserInterceptor } from 'src/interceptors/supabase-user.interceptor';
import { PlaybookService } from 'src/playbooks/playbooks.service';
import { v4 as uuidv4 } from 'uuid';

@Controller('ai')
@UseInterceptors(SupabaseUserInterceptor)
export class AiController {
  constructor(private readonly aiService: AiService, private readonly playbookService: PlaybookService) {}

  @Post('generate')
  async generate(@Req() req: any, @Body() dto: GenerateDto) {
    const userId = req.supabaseUser.id;
    const {playbookId, prompt} = dto

    if(playbookId) {
      console.log("PlaybookId: ", playbookId)
      // 1. Fetch existing playbook data
      const existingPlaybook = await this.playbookService.loadPlaybook(playbookId, userId);
      if (!existingPlaybook) {
        throw new Error(`Playbook with ID ${playbookId} not found`);
      }

      // return existingPlaybook

      const result = this.aiService.generatePromptUpdate(prompt, userId, existingPlaybook.playbookId) 

      return result
    }

    // Generate a new UUID for playbookId if not provided
    const newPlaybookId = uuidv4();
    console.log("----GENERATED UUID----: ", newPlaybookId)

    const result = await this.aiService.generate(prompt, userId, newPlaybookId);
    return result;
  }
}


