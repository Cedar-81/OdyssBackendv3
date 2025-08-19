import { Annotation, MemorySaver } from '@langchain/langgraph';
import { BaseMessage, ToolMessage } from '@langchain/core/messages';

// Application state for LangGraph with message history (BaseMessage[])
export const StateAnnotation = Annotation.Root({
  messages: Annotation<(BaseMessage | ToolMessage)[]>({
    reducer: (previous, updates) => [...previous, ...updates],
    default: () => [],
  }),
  userId: Annotation<string>({
    reducer: (previous, updates) => updates || previous,
    default: () => 'default_user',
  }),
});

export type AgentState = typeof StateAnnotation.State;

// In-memory checkpointing for development/testing
export const memory = new MemorySaver();
