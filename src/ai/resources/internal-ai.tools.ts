//Tool using Odyss APIs like Playbook service etc.
import { StructuredTool } from '@langchain/core/tools'
import { CreatePlaybookDto, CreatePlaybookSchema } from 'src/playbooks/dto/create-playbook.dto';
import { PlaybookService } from 'src/playbooks/playbooks.service';
import { Injectable, Logger } from '@nestjs/common';
import { createPlaybookDocFromDto } from 'src/playbooks/interfaces/playbook-helper.interface';
import { UpdatePlaybookSchema } from 'src/playbooks/dto/update-playbook.dto'


@Injectable()
export class CreatePlaybookTool extends StructuredTool {
    name = 'create_playbook';
    description = 'Create a new travel playbook with comprehensive trip information including itinerary, budget, accommodations, and activities. Fill all relevant fields based on the travel request.';
    schema = CreatePlaybookSchema;

    constructor(private readonly playbookService: PlaybookService) {
        super();
    }


    async _call(args: CreatePlaybookDto, runManager?: any): Promise<any> {
        console.log("=== CREATE_PLAYBOOK_TOOL DEBUG ===");
        console.log("Raw args received:", JSON.stringify(args, null, 2));
        console.log("Run manager:", runManager);
        
      try {
        
        // Try to get userId from args first, then fallback to runManager
        let userId = args.userId;
        
        if (!userId) {
          console.error("No valid userId found");
          throw new Error("Missing userId in tool call; cannot create playbook");
        }
          
        console.log("Using userId:", userId);
          
        // Validate only the playbook data against the schema
        const validatedArgs = CreatePlaybookSchema.parse(args);
        console.log("ValidatedPlaybookdto: ", validatedArgs)
          
        const result = await this.playbookService.createPlaybook(userId, validatedArgs);
        
        return {
            success: true,
            playbookId: result.playbookId,
            message: "Travel playbook created successfully",
            data: result
        };
        
    } catch (error) {
            console.error("Error in CreatePlaybookTool:", error);
            
            if (error.name === 'ZodError') {
                console.error("Schema validation errors:", error.errors);
                return {
                    success: false,
                    error: "Invalid input data",
                    details: error.errors,
                    message: "Please check your input format"
                };
            }
            
            return {
                success: false,
                error: error.message,
                message: "Failed to create playbook"
            };
        }
    }
}


@Injectable()
export class LoadPlaybookTool extends StructuredTool {
  name = 'load_playbook';
  description = 'Load an existing playbook by ID.';
  schema = {
    type: 'object' as const,
    properties: {
      playbookId: { type: 'string' as const },
      userId: { type: 'string' as const },
    },
    required: ['playbookId', 'userId'],
  };

  constructor(private readonly playbookService: PlaybookService) {
      super();
  }

  async _call(args: any) {
    const playbook = await this.playbookService.loadPlaybook(args.playbookId, args.userId);
    return playbook;
  }
}

@Injectable()
export class UpdatePlaybookTool extends StructuredTool {
  name = 'update_playbook_with_ai';
  description = 'AI uses this to update a playbook after comparing before and after user changes.';
  schema = CreatePlaybookSchema;

  constructor(private readonly playbookService: PlaybookService) {
    super();
  }

  async _call(args: any) {
    const { playbookId, aiSuggested } = args;

    // 1. Create a Y.Doc from AI suggestion
    const updatedDoc = createPlaybookDocFromDto(aiSuggested);

    // 2. Save new Y.Doc state
    await this.playbookService.savePlaybook(playbookId, updatedDoc);

    return { success: true };
  }
}


// Updated Tool for Generate-Update functionality
@Injectable()
export class UpdatePlaybookFromPromptTool extends StructuredTool {
  name = 'update_playbook_from_prompt';
  description = 'AI uses this to update a playbook based on a user prompt and existing playbook content.';
  schema = UpdatePlaybookSchema;

  constructor(
    private readonly playbookService: PlaybookService,
    private readonly logger?: Logger
  ) {
    super();
  }

  async _call(args: any) {
    const updatedPlaybook = args;

    try {
      this.logger?.log(`Updating playbook ${updatedPlaybook.playbookId} from prompt`);
      
      //1. Validate only the playbook data against the schema
      const validatedArgs = UpdatePlaybookSchema.parse(updatedPlaybook);
      console.log("ValidatedPlaybookdto: ", JSON.stringify(validatedArgs))

      // 2. Create Y.Doc from the updated playbook
      const updatedDoc = createPlaybookDocFromDto(validatedArgs);
      console.log("Created playbook dto from doc")

      // 3. Save the updated playbook
      await this.playbookService.savePlaybook(updatedPlaybook.playbookId, updatedDoc);
      console.log("Playbook saved to db")

      // 4. Log the changes for audit trail
      this.logger?.log(`Playbook ${updatedPlaybook.playbookId} updated successfully`);

      return { 
        success: true, 
        playbookId: updatedPlaybook.playbookId,
      };
      
    } catch (error) {
      this.logger?.error(`Failed to update playbook ${updatedPlaybook.playbookId}:`, error);
      
      return {
        success: false,
        error: error.message,
        playbookId: updatedPlaybook.playbookId
      };
    }
  }
}



@Injectable()
export class SavePlaybookTool extends StructuredTool {
    name = 'save_playbook';
    description = 'Save the updated playbook state to the database.';
    schema = {
      type: 'object' as const,
      properties: {
        playbookId: { type: 'string' as const },
        ydoc: { type: 'object' as const },
      },
      required: ['playbookId', 'ydoc'],
    };

    constructor(private readonly playbookService: PlaybookService) {
        super();
    }

    async _call(args: any) {
      await this.playbookService.savePlaybook(args.playbookId, args.ydoc);
      return { success: true };
    }
  }