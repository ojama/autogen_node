import OpenAI from 'openai';
import { IMessage } from '../core/IAgent';
import { ILLMProvider, LLMProviderConfig } from './ILLMProvider';

/**
 * OpenAI provider implementation
 */
export class OpenAIProvider implements ILLMProvider {
  private client: OpenAI;
  private config: LLMProviderConfig;

  constructor(config: LLMProviderConfig) {
    if (!config.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    this.config = config;
    this.client = new OpenAI({
      apiKey: config.apiKey
    });
  }

  async generateCompletion(
    messages: IMessage[],
    cancellationToken?: AbortSignal
  ): Promise<string> {
    const openAIMessages = messages.map(msg => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
      ...(msg.name && { name: msg.name })
    }));

    const response = await this.client.chat.completions.create({
      model: this.config.model,
      messages: openAIMessages,
      temperature: this.config.temperature ?? 0,
      max_tokens: this.config.maxTokens || 1000
    }, {
      signal: cancellationToken
    });

    return response.choices[0]?.message?.content || '';
  }

  getProviderName(): string {
    return 'OpenAI';
  }

  updateConfig(config: Partial<LLMProviderConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
