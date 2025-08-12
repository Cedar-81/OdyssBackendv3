import { StateGraph, START, END } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { memory, StateAnnotation } from './ai.memory';
import { readFileSync } from 'fs';
import { join } from 'path';
import { toolNode, tools } from './ai.tools';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

const baseModel = new ChatOpenAI({
  model: 'gpt-4o-mini',
  temperature: 0,
  apiKey: OPENAI_API_KEY,
});
const model = baseModel.bindTools(tools);

// Lazy loading of system prompt to avoid file reading at module load time
const getSystemMessage = () => {
  try {
    const content = readFileSync(
      join(__dirname, 'prompts', 'system-prompt.txt'),
      'utf-8'
    );
    return {
      role: 'system' as const,
      content,
    };
  } catch (error) {
    console.error('Error reading system prompt:', error);
    // Fallback system message
    return {
      role: 'system' as const,
      content: 'You are a helpful AI assistant.',
    };
  }
};

// Main agent node
const agentNode = async (state: typeof StateAnnotation.State) => {
  const response = await model.invoke([
    getSystemMessage(),
    ...state.messages
  ]);
  return { messages: [response] };
};

// --- Build graph with memory saver ---
const workflow = new StateGraph(StateAnnotation)
  .addNode('agent', agentNode)
  .addNode('tools', toolNode)
  .addEdge(START, 'agent')
  .addConditionalEdges('agent', (state) => {
    const last: any = state.messages[state.messages.length - 1];
    return last?.tool_calls?.length ? 'tools' : '__end__';
  })
  .addEdge('tools', 'agent');

export const odysseus = workflow.compile({ checkpointer: memory });
