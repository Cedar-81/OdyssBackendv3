import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { GenerateDto } from './dto/generate.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate')
  async generate(@Body() dto: GenerateDto) {
    const result = await this.aiService.generate(dto.prompt);
    return result;
  }
}


