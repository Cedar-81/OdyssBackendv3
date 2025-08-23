import { IsOptional, IsString } from 'class-validator';

export class GenerateDto {
  @IsString()
  prompt: string;

  @IsString()
  @IsOptional()
  playbookId: string;
}


