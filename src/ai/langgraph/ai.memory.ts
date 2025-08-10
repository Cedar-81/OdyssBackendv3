import { Annotation, MemorySaver } from '@langchain/langgraph';
import { BaseMessage } from '@langchain/core/messages';

// Application state for LangGraph with message history (BaseMessage[])
export const StateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (previous, updates) => [...previous, ...updates],
    default: () => [],
  }),
});

export type AgentState = typeof StateAnnotation.State;

// In-memory checkpointing for development/testing
export const memory = new MemorySaver();
