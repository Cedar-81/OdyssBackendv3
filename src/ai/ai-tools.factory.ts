// ai-tools.factory.ts
import { Injectable } from '@nestjs/common';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { CreatePlaybookTool, LoadPlaybookTool, SavePlaybookTool, UpdatePlaybookFromPromptTool } from './resources/internal-ai.tools';
import { GeoWebSearchTool, GetCurrentDateTimeTool, TourismSitesTool, TravelBlogsTool } from './resources/external-ai.tools';

@Injectable()
export class AiToolsFactory {
  private tools: any[];
  private internalTools: any[];
  private externalTools: any[];
  private toolNode: ToolNode;

  constructor(
    //Internal tools
    private readonly createPlaybookTool: CreatePlaybookTool,
    private readonly loadPlaybookTool: LoadPlaybookTool,
    private readonly updatePlaybookFromPromptTool: UpdatePlaybookFromPromptTool,
    private readonly savePlaybookTool: SavePlaybookTool,

    //External tools
    private readonly getCurrentDateTimeTool: GetCurrentDateTimeTool,
    private readonly tourismSitesTool: TourismSitesTool,
    private readonly travelBlogsTool: TravelBlogsTool,
    private readonly geoWebSearchTool: GeoWebSearchTool
  ) {
    this.initializeTools();
  }

  private initializeTools() {
    // Organize tools by category
    this.internalTools = [
      this.createPlaybookTool,
      this.loadPlaybookTool,
      this.savePlaybookTool,
      this.updatePlaybookFromPromptTool,
    ];

    this.externalTools = [
      this.getCurrentDateTimeTool,
      this.tourismSitesTool,
      this.travelBlogsTool,
      this.geoWebSearchTool
    ];

    // Combine all tools
    this.tools = [...this.internalTools, ...this.externalTools];

    // Create tool node with proper configuration
    this.toolNode = new ToolNode(this.tools);
    
    console.log("=== AI TOOLS FACTORY INITIALIZED ===");
    console.log("Internal tools:", this.internalTools.map(tool => ({
      name: tool.name,
      description: tool.description,
      hasSchema: !!tool.schema,
      schemaType: tool.schema?.constructor?.name || 'unknown'
    })));
    console.log("External tools:", this.externalTools.map(tool => ({
      name: tool.name,
      description: tool.description,
      hasSchema: !!tool.schema,
      schemaType: tool.schema?.constructor?.name || 'unknown'
    })));
    console.log(`Total tools registered: ${this.tools.length}`);
  }

  getToolNode() {
    return this.toolNode;
  }

  getTools() {
    return this.tools;
  }

  /**
   * Get all internal tools (playbook management tools)
   * @returns Array of internal tools
   */
  getInternalTools() {
    return this.internalTools;
  }

  /**
   * Get all external tools (data fetching tools)
   * @returns Array of external tools
   */
  getExternalTools() {
    return this.externalTools;
  }

  /**
   * Get internal tool names only
   * @returns Array of internal tool names
   */
  getInternalToolNames() {
    return this.internalTools.map(tool => tool.name);
  }

  /**
   * Get external tool names only
   * @returns Array of external tool names
   */
  getExternalToolNames() {
    return this.externalTools.map(tool => tool.name);
  }

  /**
   * Create a ToolNode with only internal tools
   * @returns ToolNode configured with internal tools only
   */
  getInternalToolNode() {
    return new ToolNode(this.internalTools);
  }

  /**
   * Create a ToolNode with only external tools
   * @returns ToolNode configured with external tools only
   */
  getExternalToolNode() {
    return new ToolNode(this.externalTools);
  }

  /**
   * Check if a tool is internal
   * @param toolName - Name of the tool to check
   * @returns boolean indicating if tool is internal
   */
  isInternalTool(toolName: string): boolean {
    return this.internalTools.some(tool => tool.name === toolName);
  }

  /**
   * Check if a tool is external
   * @param toolName - Name of the tool to check
   * @returns boolean indicating if tool is external
   */
  isExternalTool(toolName: string): boolean {
    return this.externalTools.some(tool => tool.name === toolName);
  }

  /**
   * Get tool category (internal/external/unknown)
   * @param toolName - Name of the tool
   * @returns string indicating tool category
   */
  getToolCategory(toolName: string): 'internal' | 'external' | 'unknown' {
    if (this.isInternalTool(toolName)) return 'internal';
    if (this.isExternalTool(toolName)) return 'external';
    return 'unknown';
  }

  /**
   * Get tools by category
   * @param category - 'internal' or 'external'
   * @returns Array of tools in the specified category
   */
  getToolsByCategory(category: 'internal' | 'external'): any[] {
    switch (category) {
      case 'internal':
        return this.getInternalTools();
      case 'external':
        return this.getExternalTools();
      default:
        return [];
    }
  }

  // Method to validate tool schemas - useful for debugging
  validateToolSchemas(category?: 'internal' | 'external' | 'all') {
    console.log("=== TOOL SCHEMA VALIDATION ===");
    
    let toolsToValidate: any[];
    switch (category) {
      case 'internal':
        toolsToValidate = this.internalTools;
        console.log("Validating INTERNAL tools only");
        break;
      case 'external':
        toolsToValidate = this.externalTools;
        console.log("Validating EXTERNAL tools only");
        break;
      default:
        toolsToValidate = this.tools;
        console.log("Validating ALL tools");
        break;
    }
    
    const validation = toolsToValidate.map(tool => {
      try {
        if (!tool.schema) {
          return {
            name: tool.name,
            category: this.getToolCategory(tool.name),
            valid: false,
            error: "No schema defined"
          };
        }

        // Test if schema can parse an empty object (all fields should be optional for this test)
        const testResult = tool.schema.safeParse({});
        
        return {
          name: tool.name,
          category: this.getToolCategory(tool.name),
          valid: true,
          canParseEmpty: testResult.success,
          issues: testResult.success ? [] : testResult.error.issues.map(issue => ({
            path: issue.path.join('.'),
            message: issue.message,
            code: issue.code
          }))
        };
      } catch (error) {
        return {
          name: tool.name,
          category: this.getToolCategory(tool.name),
          valid: false,
          error: error.message
        };
      }
    });
    
    validation.forEach(result => {
      console.log(`Tool: ${result.name} (${result.category})`);
      console.log(`  Valid: ${result.valid}`);
      if (result.error) {
        console.log(`  Error: ${result.error}`);
      }
      if (result.issues && result.issues.length > 0) {
        console.log(`  Issues:`, result.issues);
      }
      if (result.canParseEmpty !== undefined) {
        console.log(`  Can parse empty object: ${result.canParseEmpty}`);
      }
      console.log('---');
    });
    
    return validation;
  }

  // Method to test a specific tool's schema with sample data
  testToolSchema(toolName: string, sampleData: any) {
    const tool = this.tools.find(t => t.name === toolName);
    if (!tool) {
      console.error(`Tool ${toolName} not found`);
      return null;
    }

    if (!tool.schema) {
      console.error(`Tool ${toolName} has no schema`);
      return null;
    }

    const category = this.getToolCategory(toolName);
    console.log(`=== TESTING ${toolName.toUpperCase()} SCHEMA (${category.toUpperCase()}) ===`);
    console.log("Sample data:", JSON.stringify(sampleData, null, 2));
    
    const result = tool.schema.safeParse(sampleData);
    
    if (result.success) {
      console.log("✅ Schema validation passed");
      console.log("Parsed data:", JSON.stringify(result.data, null, 2));
    } else {
      console.log("❌ Schema validation failed");
      console.log("Errors:", result.error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
        received: issue.received
      })));
    }
    
    return result;
  }

  // Get tool by name
  getTool(name: string) {
    return this.tools.find(tool => tool.name === name);
  }

  // Get all tool names
  getToolNames() {
    return this.tools.map(tool => tool.name);
  }

  /**
   * Get summary of all tools organized by category
   * @returns Object with internal and external tool summaries
   */
  getToolSummary() {
    return {
      internal: {
        count: this.internalTools.length,
        tools: this.internalTools.map(tool => ({
          name: tool.name,
          description: tool.description
        }))
      },
      external: {
        count: this.externalTools.length,
        tools: this.externalTools.map(tool => ({
          name: tool.name,
          description: tool.description
        }))
      },
      total: this.tools.length
    };
  }
}