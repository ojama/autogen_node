import OpenAI from 'openai';
import { IMessage } from '../core/IAgent';
import { ILLMProvider, LLMProviderConfig } from './ILLMProvider';

/**
 * Ollama provider implementation
 * Ollama provides a local LLM server with OpenAI-compatible API
 */
export class OllamaProvider implements ILLMProvider {
  private client: OpenAI;
  private config: LLMProviderConfig;

  constructor(config: LLMProviderConfig) {
    this.config = config;
    
    // Ollama uses OpenAI-compatible API with local base URL
    // Default Ollama URL is http://localhost:11434/v1
    this.client = new OpenAI({
      apiKey: config.apiKey || 'ollama', // Ollama doesn't require API key but OpenAI client needs one
      baseURL: config.baseURL || 'http://localhost:11434/v1'
    });
  }

  async generateCompletion(
    messages: IMessage[],
    cancellationToken?: AbortSignal
  ): Promise<string> {
    const ollamaMessages = messages.map(msg => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
      ...(msg.name && { name: msg.name })
    }));

    const response = await this.client.chat.completions.create({
      model: this.config.model,
      messages: ollamaMessages,
      temperature: this.config.temperature ?? 0,
      ...(this.config.maxTokens && { max_tokens: this.config.maxTokens })
    }, {
      signal: cancellationToken
    });

    return response.choices[0]?.message?.content || '';
  }

  getProviderName(): string {
    return 'Ollama';
  }

  updateConfig(config: Partial<LLMProviderConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
