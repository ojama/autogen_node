import { BaseAgent } from '../core/BaseAgent';
import { IMessage, IAgentConfig } from '../core/IAgent';
import { ILLMProvider, OpenAIProvider, OpenRouterProvider, OllamaProvider } from '../providers';

/**
 * LLM Provider types
 */
export type LLMProviderType = 'openai' | 'openrouter' | 'ollama';

/**
 * Configuration for Assistant Agent with LLM provider
 */
export interface AssistantAgentConfig extends IAgentConfig {
  provider?: LLMProviderType;
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  baseURL?: string;
}

/**
 * Legacy configuration for backward compatibility
 */
export interface OpenAIAgentConfig extends IAgentConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * An agent that uses LLM providers (OpenAI, OpenRouter, Ollama) to generate responses
 * Similar to .NET's AssistantAgent with multiple LLM provider support
 */
export class AssistantAgent extends BaseAgent {
  private llmProvider: ILLMProvider;
  private model: string;
  private temperature: number;
  private maxTokens: number;

  constructor(config: AssistantAgentConfig) {
    super(config);
    
    // Determine provider type (default to openai for backward compatibility)
    const providerType = config.provider || 'openai';
    this.model = config.model || this.getDefaultModel(providerType);
    this.temperature = config.temperature ?? 0;
    this.maxTokens = config.maxTokens || 1000;

    // Create the appropriate provider
    this.llmProvider = this.createProvider(
      providerType,
      config.apiKey,
      config.baseURL
    );
  }

  /**
   * Get default model for each provider
   */
  private getDefaultModel(provider: LLMProviderType): string {
    switch (provider) {
      case 'openai':
        return 'gpt-3.5-turbo';
      case 'openrouter':
        return 'openai/gpt-3.5-turbo';
      case 'ollama':
        return 'llama2';
      default:
        return 'gpt-3.5-turbo';
    }
  }

  /**
   * Create LLM provider instance
   */
  private createProvider(
    type: LLMProviderType,
    apiKey?: string,
    baseURL?: string
  ): ILLMProvider {
    const config = {
      model: this.model,
      temperature: this.temperature,
      maxTokens: this.maxTokens,
      apiKey,
      baseURL
    };

    switch (type) {
      case 'openai':
        return new OpenAIProvider(config);
      case 'openrouter':
        return new OpenRouterProvider(config);
      case 'ollama':
        return new OllamaProvider(config);
      default:
        throw new Error(`Unsupported provider: ${type}`);
    }
  }

  /**
   * Generate a reply using the configured LLM provider
   */
  async generateReply(
    messages: IMessage[],
    cancellationToken?: AbortSignal
  ): Promise<IMessage> {
    try {
      const content = await this.llmProvider.generateCompletion(
        messages,
        cancellationToken
      );

      const reply: IMessage = {
        role: 'assistant',
        content,
        name: this.name
      };

      this.addToHistory(reply);
      return reply;

    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate reply: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Update the model configuration
   */
  setModel(model: string): void {
    this.model = model;
    this.llmProvider.updateConfig({ model });
  }

  /**
   * Update the temperature
   */
  setTemperature(temperature: number): void {
    this.temperature = temperature;
    this.llmProvider.updateConfig({ temperature });
  }

  /**
   * Get the current provider name
   */
  getProviderName(): string {
    return this.llmProvider.getProviderName();
  }
}
