import { IMessage } from '../core/IAgent';

/**
 * Configuration for LLM provider
 */
export interface LLMProviderConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
  baseURL?: string;
}

/**
 * Interface for LLM providers
 */
export interface ILLMProvider {
  /**
   * Generate a completion based on messages
   */
  generateCompletion(
    messages: IMessage[],
    cancellationToken?: AbortSignal
  ): Promise<string>;

  /**
   * Get the provider name
   */
  getProviderName(): string;

  /**
   * Update configuration
   */
  updateConfig(config: Partial<LLMProviderConfig>): void;
}
