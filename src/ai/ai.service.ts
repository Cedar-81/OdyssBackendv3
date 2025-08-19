import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StateGraph, START, END } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { SystemMessage, HumanMessage, AIMessage, ToolMessage } from '@langchain/core/messages';
import { readFileSync } from 'fs';
import { join } from 'path';
import { AgentState, StateAnnotation, memory } from './resources/ai.memory';
import { GetCurrentDateTimeTool, TourismSitesTool, TravelBlogsTool, GeoWebSearchTool } from './resources/external-ai.tools';
import { CreatePlaybookTool, UpdatePlaybookFromPromptTool } from './resources/internal-ai.tools';
import { PlaybookService } from 'src/playbooks/playbooks.service';

@Injectable()
export class AiService implements OnModuleInit {
  private graph: any;

  constructor(
    private readonly config: ConfigService,
    private readonly createPlaybookTool: CreatePlaybookTool,
    private readonly updatePlaybookFromPromptTool: UpdatePlaybookFromPromptTool,
    private readonly getCurrentDateTimeTool: GetCurrentDateTimeTool,
    private readonly tourismSitesTool: TourismSitesTool,
    private readonly travelBlogsTool: TravelBlogsTool,
    private readonly geoWebSearchTool: GeoWebSearchTool,
    private readonly playbookService: PlaybookService
  ) {}

  onModuleInit() {
    const tools = [
      this.createPlaybookTool,
      this.updatePlaybookFromPromptTool,
      this.getCurrentDateTimeTool,
      this.tourismSitesTool,
      this.travelBlogsTool,
      this.geoWebSearchTool,
    ];

    const model = new ChatOpenAI({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      apiKey: this.config.get<string>('OPENAI_API_KEY'),
    }).bindTools(tools);

    const workflow = new StateGraph(StateAnnotation)
      .addNode('agent', async (state: AgentState) => {
        const systemPrompt = readFileSync(
      join(__dirname, 'resources', 'prompts', 'system-prompt.txt'),
      'utf-8'
    );

        const messages = [
          new SystemMessage(systemPrompt),
          ...state.messages
        ];
        
        const response = await model.invoke(messages);
        return { messages: [response] };
      })
      .addNode('tools', async (state: AgentState) => {
        const lastMessage = state.messages[state.messages.length - 1];
        
        // Type guard to check if it's an AIMessage with tool_calls
        if (lastMessage instanceof AIMessage && lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
          const toolResults: ToolMessage[] = [];
          
          for (const toolCall of lastMessage.tool_calls) {
            const tool = tools.find(t => t.name === toolCall.name);
            if (tool) {
              try {
                const result = await tool._call(toolCall.args as any, {
                  metadata: { userId: state.userId }
                });
                toolResults.push(new ToolMessage({
                  tool_call_id: toolCall.id!,
                  name: toolCall.name!,
                  content: typeof result === 'string' ? result : JSON.stringify(result)
                }));
              } catch (error: any) {
                toolResults.push(new ToolMessage({
                  tool_call_id: toolCall.id!,
                  name: toolCall.name!,
                  content: `Error: ${error.message}`
                }));
              }
            }
          }
          
          return { messages: toolResults };
        }
        
        return { messages: [] };
      })
      .addEdge(START, 'agent')
      .addConditionalEdges('agent', (state: AgentState) => {
        const lastMessage = state.messages[state.messages.length - 1];
        return (lastMessage instanceof AIMessage && lastMessage.tool_calls && lastMessage.tool_calls.length > 0) ? 'tools' : END;
      })
      .addEdge('tools', 'agent');

    this.graph = workflow.compile({ checkpointer: memory });
  }

  async generate(prompt: string, userId: string, playbookId: string) {
    const enhancedPrompt = this.buildPrompt(prompt, userId, playbookId);

    const result = await this.graph.invoke(
      {
        messages: [new HumanMessage(enhancedPrompt)],
        userId,
      },
      { configurable: { thread_id: `thread_${userId}-${playbookId}` } },
    ) as AgentState;
    
    // Extract JSON from tool messages (specifically from create_playbook tool)
    return await this.getResponse(result, 'create_playbook', userId, playbookId)
  }

  async generatePromptUpdate(prompt: string, userId: string, playbookId: string) {
    const updatePrompt = this.buildUpdatePrompt(prompt, userId, playbookId);

    const result = await this.graph.invoke(
      { messages: [new HumanMessage(updatePrompt)], userId },
      { configurable: { thread_id: `thread_${userId}-${playbookId}` } }
    ) as AgentState;

    return await this.getResponse(result, 'update_playbook_from_prompt', userId, playbookId);
  }

  async generateFromPlaybookDiff(diffPrompt: string, userId: string, playbookId: string, existingPlaybook: any) {
    const prompt = `Here is the current playbook data:\n${JSON.stringify(
      existingPlaybook,
      null,
      2
    )}\n\nApply the following update request: ${diffPrompt}`;

    const result = await this.graph.invoke(
      { messages: [new HumanMessage(prompt)], userId },
      { configurable: { thread_id: `${userId}-${playbookId}` } }
    ) as AgentState;

    return result.messages[result.messages.length - 1].content;
  }

  private buildUpdatePrompt(prompt: string, userId: string, playbookId: string): string {
    const promptTemplate = readFileSync(
      join(__dirname, 'resources', 'prompts', 'update-from-prompt.txt'),
      'utf-8'
    );

    return promptTemplate
      .replace(/\{USER_PROMPT\}/g, prompt)
      .replace(/\{USER_ID\}/g, userId)
      .replace(/\{PLAYBOOK_ID\}/g, playbookId)
      // .replace(/\{EXISTING_PLAYBOOK\}/g, JSON.stringify(existingPlaybook, null, 2));
  }

  private buildPrompt(prompt: string, userId: string, playbookId: string): string {
    const template = readFileSync(
      join(__dirname, 'resources', 'prompts', 'ai-generation-prompt.txt'),
      'utf-8',
    );
    return template
      .replace(/\{USER_PROMPT\}/g, prompt)
      .replace(/\{PLAYBOOK_ID\}/g, playbookId)
      .replace(/\{USER_ID\}/g, userId);
  }

  private async getResponse(result: any, tool_name: string, userId: string, playbookId: string) {
    const messageContent = result.messages[result.messages.length - 1].content;
    let generatedJson: any = null;
    for (const message of result.messages) {
      if (message instanceof ToolMessage && message.name === tool_name) {
        try {
          const content = typeof message.content === 'string' ? message.content : JSON.stringify(message.content);
          generatedJson = JSON.parse(content);
        } catch {
          // If parsing fails, keep the raw content
          generatedJson = typeof message.content === 'string' ? message.content : message.content;
        }
        break;
      }
    }

    const data = await this.playbookService.loadPlaybook(playbookId, userId);

    return {
      message: messageContent,
      json: {
        playbookId: data.playbookId,
        ownerId: data.ownerId,
        fileDataJson: data.fileDataJson
      }
    };
  }
}