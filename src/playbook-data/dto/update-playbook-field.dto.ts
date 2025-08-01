import { IsUUID, IsString, IsDefined } from 'class-validator';

export class UpdatePlaybookFieldDto {
  @IsUUID()
  playbookId: string;

  @IsString()
  field: string; // e.g., 'itinerary', 'budget', 'checklist'

  @IsDefined()
  value: any; // strongly typed in service layer
}
