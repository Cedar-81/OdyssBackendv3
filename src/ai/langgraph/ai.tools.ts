import { Tool } from '@langchain/core/tools';
import { ToolMessage, BaseMessage } from '@langchain/core/messages';
import { ToolNode } from '@langchain/langgraph/prebuilt';

// Export a ToolNode with an initially empty tool list.
// Later, push Tool instances to `tools` and reinstantiate if needed.
export const tools: Tool[] = [];
export const toolNode = new ToolNode(tools);
