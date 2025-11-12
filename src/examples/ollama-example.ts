import { AssistantAgent } from '../index';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Example using Ollama as LLM provider
 * Ollama runs large language models locally on your machine
 */
async function main() {
  console.log('='.repeat(60));
  console.log('AutoGen Node.js - Ollama Provider Example');
  console.log('='.repeat(60));
  console.log('Using Ollama for local LLM inference...\n');

  console.log('Prerequisites:');
  console.log('1. Install Ollama from https://ollama.ai/');
  console.log('2. Run: ollama pull llama2');
  console.log('3. Start Ollama server (usually automatic)');
  console.log('4. Run this example\n');

  // Get custom Ollama URL from environment or use default
  const ollamaURL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1';

  // Create an agent using Ollama
  const localAgent = new AssistantAgent({
    name: 'local_agent',
    provider: 'ollama',
    model: 'llama2', // or 'mistral', 'codellama', etc.
    baseURL: ollamaURL,
    systemMessage: 'You are a helpful assistant running locally via Ollama.',
    temperature: 0.7,
    maxTokens: 500
  });

  // Create another agent with a different model
  const codeAgent = new AssistantAgent({
    name: 'code_agent',
    provider: 'ollama',
    model: 'codellama', // specialized for code
    baseURL: ollamaURL,
    systemMessage: 'You are a coding assistant specialized in programming tasks.',
    temperature: 0.3,
    maxTokens: 500
  });

  try {
    console.log(`[Local Agent via Ollama]:`);
    console.log(`Provider: ${localAgent.getProviderName()}`);
    console.log(`Base URL: ${ollamaURL}\n`);
    
    const question = 'Explain what Node.js is in one sentence.';
    console.log(`Question: ${question}\n`);

    // Get response from local Llama2 model
    console.log('Generating response (this may take a moment for first request)...\n');
    const reply = await localAgent.generateReply([
      { role: 'user', content: question }
    ]);
    
    console.log(`Response: ${reply.content}\n`);

    // Try the code-specialized model
    console.log(`\n[Code Agent via Ollama]:`);
    console.log(`Provider: ${codeAgent.getProviderName()}`);
    
    const codeQuestion = 'Write a simple "hello world" in Python.';
    console.log(`Question: ${codeQuestion}\n`);

    const codeReply = await codeAgent.generateReply([
      { role: 'user', content: codeQuestion }
    ]);
    
    console.log(`Response: ${codeReply.content}\n`);

    console.log('='.repeat(60));
    console.log('Ollama example completed successfully!');
    console.log('='.repeat(60));
    console.log('\nNote: Ollama runs models locally, no API key required!');
    console.log('This provides privacy and works offline.');

  } catch (error) {
    console.error('\nError:', error);
    if (error instanceof Error) {
      console.error('Details:', error.message);
      
      if (error.message.includes('ECONNREFUSED')) {
        console.error('\n⚠️  Could not connect to Ollama server.');
        console.error('Please ensure:');
        console.error('1. Ollama is installed');
        console.error('2. Ollama server is running');
        console.error('3. The model is downloaded (run: ollama pull llama2)');
      }
    }
  }
}

// Run the example
main().catch(console.error);
