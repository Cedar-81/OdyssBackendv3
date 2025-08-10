import { Injectable } from '@nestjs/common';
import { odysseus } from '../ai/langgraph/ai.agent';
import { HumanMessage } from '@langchain/core/messages';

@Injectable()
export class AiService {
  async generate(prompt: string) {
    const result = await odysseus.invoke({ messages: [new HumanMessage(prompt)] });
    return result;
  }
}


