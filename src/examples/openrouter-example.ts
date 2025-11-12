import { AssistantAgent } from '../index';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Example using OpenRouter as LLM provider
 * OpenRouter provides access to multiple LLM models through a unified API
 */
async function main() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    console.error('Please set OPENROUTER_API_KEY environment variable');
    console.log('\nUsage:');
    console.log('1. Get an API key from https://openrouter.ai/');
    console.log('2. Add to .env file: OPENROUTER_API_KEY=your_api_key_here');
    console.log('3. Run: npm run example:openrouter');
    process.exit(1);
  }

  console.log('='.repeat(60));
  console.log('AutoGen Node.js - OpenRouter Provider Example');
  console.log('='.repeat(60));
  console.log('Using OpenRouter to access multiple LLM models...\n');

  // Create agents using different models through OpenRouter
  const gptAgent = new AssistantAgent({
    name: 'gpt_agent',
    provider: 'openrouter',
    apiKey: apiKey,
    model: 'openai/gpt-3.5-turbo',
    systemMessage: 'You are a helpful assistant powered by GPT-3.5 via OpenRouter.',
    temperature: 0.7
  });

  const claudeAgent = new AssistantAgent({
    name: 'claude_agent',
    provider: 'openrouter',
    apiKey: apiKey,
    model: 'anthropic/claude-2',
    systemMessage: 'You are a helpful assistant powered by Claude via OpenRouter.',
    temperature: 0.7
  });

  try {
    console.log(`[GPT Agent via OpenRouter]:`);
    console.log(`Provider: ${gptAgent.getProviderName()}`);
    
    const question = 'What is the capital of France? Answer in one sentence.';
    console.log(`\nQuestion: ${question}\n`);

    // Get response from GPT via OpenRouter
    const gptReply = await gptAgent.generateReply([
      { role: 'user', content: question }
    ]);
    
    console.log(`GPT Response: ${gptReply.content}\n`);

    // Optionally try Claude if you have access
    console.log(`\n[Claude Agent via OpenRouter]:`);
    console.log(`Provider: ${claudeAgent.getProviderName()}`);
    
    try {
      const claudeReply = await claudeAgent.generateReply([
        { role: 'user', content: question }
      ]);
      console.log(`Claude Response: ${claudeReply.content}\n`);
    } catch (error) {
      console.log('Note: Claude model may require additional access.\n');
    }

    console.log('='.repeat(60));
    console.log('OpenRouter example completed successfully!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\nError:', error);
    if (error instanceof Error) {
      console.error('Details:', error.message);
    }
  }
}

// Run the example
main().catch(console.error);
