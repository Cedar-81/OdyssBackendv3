import { Logger, Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { PlaybooksModule } from 'src/playbooks/playbooks.module';
import { UsersModule } from 'src/users/users.module';
import { AiToolsFactory } from './ai-tools.factory';
import { PlaybookService } from 'src/playbooks/playbooks.service';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { CreatePlaybookTool, LoadPlaybookTool, SavePlaybookTool, UpdatePlaybookFromPromptTool } from './resources/internal-ai.tools';
import { GeoWebSearchTool, GetCurrentDateTimeTool, TourismSitesTool, TravelBlogsTool } from './resources/external-ai.tools';

@Module({
  imports: [PlaybooksModule, UsersModule, SupabaseModule],
  controllers: [AiController],
  providers: [
    AiService, 
    PlaybookService,
    Logger,
    AiToolsFactory,
    CreatePlaybookTool,
    LoadPlaybookTool, 
    SavePlaybookTool,
    UpdatePlaybookFromPromptTool,
    GetCurrentDateTimeTool,
    TourismSitesTool,
    TravelBlogsTool,
    GeoWebSearchTool
  ],
  exports: [AiService],
})
export class AiModule {}


