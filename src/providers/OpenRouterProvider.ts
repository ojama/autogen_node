import OpenAI from 'openai';
import { IMessage } from '../core/IAgent';
import { ILLMProvider, LLMProviderConfig } from './ILLMProvider';

/**
 * OpenRouter provider implementation
 * OpenRouter uses OpenAI-compatible API
 */
export class OpenRouterProvider implements ILLMProvider {
  private client: OpenAI;
  private config: LLMProviderConfig;

  constructor(config: LLMProviderConfig) {
    if (!config.apiKey) {
      throw new Error('OpenRouter API key is required');
    }

    this.config = config;
    
    // OpenRouter uses OpenAI-compatible API with custom base URL
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL || 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'https://github.com/ojama/autogen_node',
        'X-Title': 'AutoGen Node.js'
      }
    });
  }

  async generateCompletion(
    messages: IMessage[],
    cancellationToken?: AbortSignal
  ): Promise<string> {
    const openRouterMessages = messages.map(msg => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
      ...(msg.name && { name: msg.name })
    }));

    const response = await this.client.chat.completions.create({
      model: this.config.model,
      messages: openRouterMessages,
      temperature: this.config.temperature ?? 0,
      max_tokens: this.config.maxTokens || 1000
    }, {
      signal: cancellationToken
    });

    return response.choices[0]?.message?.content || '';
  }

  getProviderName(): string {
    return 'OpenRouter';
  }

  updateConfig(config: Partial<LLMProviderConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
