# LLM Provider Support

AutoGen Node.js now supports multiple LLM providers, allowing you to use different AI models and services.

## Supported Providers

### 1. OpenAI
The original and default provider.

**Setup:**
```bash
# Get API key from https://platform.openai.com/api-keys
export OPENAI_API_KEY=sk-your-key-here
```

**Usage:**
```typescript
import { AssistantAgent } from 'autogen_node';

const agent = new AssistantAgent({
  name: 'assistant',
  provider: 'openai',  // or omit (default)
  apiKey: process.env.OPENAI_API_KEY!,
  model: 'gpt-3.5-turbo',  // or 'gpt-4', 'gpt-4-turbo', etc.
  temperature: 0.7,
  maxTokens: 1000
});
```

**Available Models:**
- `gpt-3.5-turbo` - Fast, cost-effective
- `gpt-4` - More capable, higher quality
- `gpt-4-turbo` - Latest GPT-4 variant
- `gpt-4-vision` - Multimodal (text + images)

### 2. OpenRouter
Access to multiple LLM providers through a single API.

**Setup:**
```bash
# Get API key from https://openrouter.ai/
export OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

**Usage:**
```typescript
import { AssistantAgent } from 'autogen_node';

const agent = new AssistantAgent({
  name: 'assistant',
  provider: 'openrouter',
  apiKey: process.env.OPENROUTER_API_KEY!,
  model: 'openai/gpt-3.5-turbo',  // Note: provider/model format
  temperature: 0.7,
  maxTokens: 1000
});
```

**Available Models (Examples):**
- `openai/gpt-3.5-turbo` - OpenAI GPT-3.5
- `openai/gpt-4` - OpenAI GPT-4
- `anthropic/claude-2` - Anthropic Claude 2
- `anthropic/claude-instant-v1` - Claude Instant
- `google/palm-2-chat-bison` - Google PaLM 2
- `meta-llama/llama-2-70b-chat` - Meta Llama 2
- `mistralai/mistral-7b-instruct` - Mistral 7B

See full list at: https://openrouter.ai/docs#models

**Benefits:**
- Single API key for multiple providers
- Automatic fallbacks
- Cost optimization
- Access to open-source models

### 3. Ollama
Run LLMs locally on your machine.

**Setup:**
```bash
# 1. Install Ollama
# macOS/Linux:
curl https://ollama.ai/install.sh | sh

# Windows: Download from https://ollama.ai/download

# 2. Pull a model
ollama pull llama2
ollama pull mistral
ollama pull codellama

# 3. Ollama server starts automatically
```

**Usage:**
```typescript
import { AssistantAgent } from 'autogen_node';

const agent = new AssistantAgent({
  name: 'assistant',
  provider: 'ollama',
  model: 'llama2',  // or 'mistral', 'codellama', etc.
  baseURL: 'http://localhost:11434/v1',  // optional, this is default
  temperature: 0.7,
  maxTokens: 500
});
```

**Available Models (Examples):**
- `llama2` - Meta's Llama 2 (7B, 13B, 70B)
- `llama2:70b` - Specific size variant
- `mistral` - Mistral 7B
- `codellama` - Code-specialized Llama
- `vicuna` - Vicuna
- `orca-mini` - Smaller, faster models
- `neural-chat` - Intel's Neural Chat
- `starling-lm` - Starling

See full list: `ollama list` or https://ollama.ai/library

**Benefits:**
- Completely local, no API key needed
- Works offline
- Privacy - data stays on your machine
- No usage costs
- Fast inference on local GPU

## Provider Comparison

| Feature | OpenAI | OpenRouter | Ollama |
|---------|--------|------------|--------|
| **API Key Required** | ✅ Yes | ✅ Yes | ❌ No |
| **Cost** | Pay per token | Pay per token | Free (local) |
| **Internet Required** | ✅ Yes | ✅ Yes | ❌ No |
| **Privacy** | Cloud | Cloud | Local |
| **Speed** | Fast | Fast | Depends on hardware |
| **Model Selection** | OpenAI only | 100+ models | 50+ models |
| **Setup Difficulty** | Easy | Easy | Medium |
| **Best For** | Production, OpenAI models | Multi-model access | Privacy, offline use |

## Examples

### Example 1: Using Different Providers

```typescript
import { AssistantAgent } from 'autogen_node';

// OpenAI agent
const openaiAgent = new AssistantAgent({
  name: 'openai_assistant',
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY!,
  model: 'gpt-3.5-turbo'
});

// OpenRouter agent with Claude
const claudeAgent = new AssistantAgent({
  name: 'claude_assistant',
  provider: 'openrouter',
  apiKey: process.env.OPENROUTER_API_KEY!,
  model: 'anthropic/claude-2'
});

// Local Ollama agent
const localAgent = new AssistantAgent({
  name: 'local_assistant',
  provider: 'ollama',
  model: 'llama2'
});

// All agents have the same interface!
const reply = await openaiAgent.generateReply([
  { role: 'user', content: 'Hello!' }
]);
```

### Example 2: Group Chat with Mixed Providers

```typescript
import { AssistantAgent, GroupChat, GroupChatManager } from 'autogen_node';

// Create agents using different providers
const gptExpert = new AssistantAgent({
  name: 'gpt_expert',
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY!,
  model: 'gpt-4',
  systemMessage: 'You are an expert analyst.'
});

const localCritic = new AssistantAgent({
  name: 'local_critic',
  provider: 'ollama',
  model: 'llama2',
  systemMessage: 'You are a critical reviewer.'
});

// Mix them in a group chat
const groupChat = new GroupChat({
  agents: [gptExpert, localCritic],
  maxRound: 6
});

const manager = new GroupChatManager({ groupChat });
await manager.runChat('Analyze this business proposal...');
```

### Example 3: Provider Failover Pattern

```typescript
async function createResilientAgent(name: string): Promise<AssistantAgent> {
  // Try OpenAI first
  if (process.env.OPENAI_API_KEY) {
    return new AssistantAgent({
      name,
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-3.5-turbo'
    });
  }
  
  // Fallback to OpenRouter
  if (process.env.OPENROUTER_API_KEY) {
    return new AssistantAgent({
      name,
      provider: 'openrouter',
      apiKey: process.env.OPENROUTER_API_KEY,
      model: 'openai/gpt-3.5-turbo'
    });
  }
  
  // Final fallback to local Ollama
  return new AssistantAgent({
    name,
    provider: 'ollama',
    model: 'llama2'
  });
}
```

## Running the Examples

```bash
# OpenRouter example
export OPENROUTER_API_KEY=sk-or-v1-your-key
npm run example:openrouter

# Ollama example (requires Ollama installed)
ollama pull llama2
npm run example:ollama

# Original OpenAI example still works
export OPENAI_API_KEY=sk-your-key
npm run example:auto
```

## Configuration Reference

### AssistantAgentConfig

```typescript
interface AssistantAgentConfig {
  name: string;                      // Agent name
  provider?: 'openai' | 'openrouter' | 'ollama';  // LLM provider (default: 'openai')
  apiKey?: string;                   // API key (required for openai/openrouter)
  model?: string;                    // Model name
  baseURL?: string;                  // Custom base URL (optional)
  temperature?: number;              // 0.0 to 1.0 (default: 0)
  maxTokens?: number;                // Max tokens in response (default: 1000)
  systemMessage?: string;            // System prompt
}
```

## Backward Compatibility

The original `OpenAIAgentConfig` is still supported:

```typescript
// Old way (still works)
const agent = new AssistantAgent({
  name: 'assistant',
  apiKey: process.env.OPENAI_API_KEY!,
  model: 'gpt-3.5-turbo'
});

// New way (recommended)
const agent = new AssistantAgent({
  name: 'assistant',
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY!,
  model: 'gpt-3.5-turbo'
});
```

## Troubleshooting

### OpenRouter Issues

**Problem:** "Invalid API key"
```bash
# Solution: Check your API key
curl https://openrouter.ai/api/v1/auth/key \
  -H "Authorization: Bearer $OPENROUTER_API_KEY"
```

**Problem:** Model not found
- Check model name format: `provider/model`
- See available models: https://openrouter.ai/docs#models

### Ollama Issues

**Problem:** "ECONNREFUSED" or "Connection refused"
```bash
# Solution: Check if Ollama is running
ollama serve  # Start Ollama server

# Or check status
curl http://localhost:11434/api/tags
```

**Problem:** Model not found
```bash
# Solution: Pull the model first
ollama pull llama2
ollama list  # See installed models
```

**Problem:** Slow responses
- Use smaller models (e.g., `llama2:7b` instead of `llama2:70b`)
- Check your hardware (GPU recommended)
- Reduce `maxTokens`

## Best Practices

1. **Development**: Use Ollama for fast, free local testing
2. **Production**: Use OpenAI or OpenRouter for reliability
3. **Privacy-Sensitive**: Use Ollama exclusively
4. **Cost Optimization**: Use OpenRouter to access cheaper models
5. **Experimentation**: Use OpenRouter to try different models

## Next Steps

- Try the examples: `npm run example:openrouter` or `npm run example:ollama`
- Read provider documentation:
  - [OpenAI](https://platform.openai.com/docs)
  - [OpenRouter](https://openrouter.ai/docs)
  - [Ollama](https://ollama.ai)
- Explore available models for each provider
- Build multi-provider agent systems
