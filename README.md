# autogen_node

A Node.js/TypeScript implementation of [microsoft/autogen](https://github.com/microsoft/autogen), providing a framework for building multi-agent AI systems with conversational agents.

## Overview

This project brings the powerful multi-agent orchestration capabilities of Microsoft's AutoGen framework to the Node.js ecosystem. It's designed based on the .NET code structure and class definitions, providing a familiar API for developers working with AutoGen in different languages.

## Features

- **Base Agent Framework**: Core interfaces and abstract classes for building custom agents
- **Multiple LLM Providers**: Support for OpenAI, OpenRouter, and Ollama
  - **OpenAI**: GPT-3.5, GPT-4, and other OpenAI models
  - **OpenRouter**: Access to 100+ models from multiple providers
  - **Ollama**: Run LLMs locally for privacy and offline use
- **AssistantAgent**: LLM-powered conversational agent with provider flexibility
- **UserProxyAgent**: Human-in-the-loop agent for interactive conversations
- **Group Chat**: Multi-agent collaboration system for complex tasks
- **Type-Safe**: Built with TypeScript for enhanced developer experience
- **Flexible Message System**: Support for different message types and roles
- **Conversation Management**: Built-in conversation history and state management

## Installation

```bash
npm install
```

## Quick Start

### Using OpenAI (Default)

```typescript
import { AssistantAgent, UserProxyAgent, HumanInputMode } from './src/index';

// Create an AI assistant
const assistant = new AssistantAgent({
  name: 'assistant',
  provider: 'openai',  // optional, this is the default
  apiKey: process.env.OPENAI_API_KEY!,
  systemMessage: 'You are a helpful assistant.',
  model: 'gpt-3.5-turbo',
  temperature: 0
});

// Create a user proxy for human interaction
const userProxy = new UserProxyAgent({
  name: 'user',
  humanInputMode: HumanInputMode.ALWAYS
});

// Start a conversation
await userProxy.initiateChat(
  assistant,
  'Hello! Can you help me?',
  10 // max rounds
);
```

### Using OpenRouter

```typescript
const assistant = new AssistantAgent({
  name: 'assistant',
  provider: 'openrouter',
  apiKey: process.env.OPENROUTER_API_KEY!,
  model: 'anthropic/claude-2',
  temperature: 0.7
});
```

### Using Ollama (Local)

```typescript
const assistant = new AssistantAgent({
  name: 'assistant',
  provider: 'ollama',
  model: 'llama2',
  temperature: 0.7
});
```

See [LLM_PROVIDERS.md](./LLM_PROVIDERS.md) for detailed provider documentation.


## Project Structure

```
autogen_node/
├── src/
│   ├── core/              # Core interfaces and base classes
│   │   ├── IAgent.ts      # Agent interface definitions
│   │   └── BaseAgent.ts   # Base agent implementation
│   ├── agents/            # Agent implementations
│   │   ├── AssistantAgent.ts    # OpenAI-powered assistant
│   │   └── UserProxyAgent.ts    # Human proxy agent
│   ├── examples/          # Example applications
│   │   └── basic-chat.ts  # Basic two-agent conversation
│   └── index.ts           # Main export file
├── dist/                  # Compiled JavaScript output
├── package.json
├── tsconfig.json
└── README.md
```

## Architecture

This implementation follows the .NET AutoGen architecture:

### Core Components

1. **IAgent Interface**: Defines the contract for all agents
   - `generateReply()`: Generate responses to messages
   - `getName()`: Get the agent's name

2. **BaseAgent**: Abstract base class providing:
   - Conversation history management
   - Message sending and receiving
   - Chat initiation logic
   - Termination detection

3. **Agent Implementations**:
   - **AssistantAgent**: Uses OpenAI's API for intelligent responses
   - **UserProxyAgent**: Facilitates human interaction with configurable input modes

### Message System

Messages follow a structured format:
```typescript
interface IMessage {
  content: string;
  role: 'user' | 'assistant' | 'system' | 'function';
  name?: string;
  functionCall?: {
    name: string;
    arguments: string;
  };
}
```

## Configuration

Create a `.env` file in the project root:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here  # Optional
# OLLAMA_BASE_URL=http://localhost:11434/v1      # Optional
```

## Scripts

```bash
# Build the project
npm run build

# Run the basic interactive example (OpenAI)
npm run example:basic

# Run the automated two-agent conversation (OpenAI)
npm run example:auto

# Run the group chat example (OpenAI)
npm run example:group

# Run OpenRouter example
npm run example:openrouter

# Run Ollama example (local LLM)
npm run example:ollama

# Development mode with auto-reload
npm run dev

# Clean build artifacts
npm run clean
```

## Examples

### Basic Two-Agent Chat

```typescript
import { AssistantAgent, UserProxyAgent, HumanInputMode } from './src/index';

const assistant = new AssistantAgent({
  name: 'assistant',
  apiKey: process.env.OPENAI_API_KEY!,
  systemMessage: 'You are a helpful math tutor.',
  model: 'gpt-3.5-turbo'
});

const user = new UserProxyAgent({
  name: 'user',
  humanInputMode: HumanInputMode.ALWAYS
});

await user.initiateChat(assistant, 'Help me solve 2x + 3 = 7', 10);
```

### Automated Conversation (No Human Input)

```typescript
const user = new UserProxyAgent({
  name: 'user',
  humanInputMode: HumanInputMode.NEVER
});

// Agent will auto-reply without human intervention
```

### Group Chat with Multiple Agents

```typescript
import { AssistantAgent, GroupChat, GroupChatManager } from './src/index';

// Create multiple specialized agents
const designer = new AssistantAgent({
  name: 'designer',
  apiKey: process.env.OPENAI_API_KEY!,
  systemMessage: 'You are a creative designer.',
  model: 'gpt-3.5-turbo'
});

const engineer = new AssistantAgent({
  name: 'engineer',
  apiKey: process.env.OPENAI_API_KEY!,
  systemMessage: 'You are a practical engineer.',
  model: 'gpt-3.5-turbo'
});

// Create group chat
const groupChat = new GroupChat({
  agents: [designer, engineer],
  maxRound: 10
});

// Create manager
const manager = new GroupChatManager({
  groupChat: groupChat
});

// Run the discussion
await manager.runChat('Design a new mobile app feature');
```

## Comparison with .NET AutoGen

| Feature | .NET AutoGen | autogen_node |
|---------|--------------|--------------|
| Base Agent Framework | ✅ | ✅ |
| AssistantAgent | ✅ | ✅ |
| UserProxyAgent | ✅ | ✅ |
| OpenAI Integration | ✅ | ✅ |
| Group Chat | ✅ | ✅ |
| Multiple LLM Providers | ✅ | ✅ (OpenAI, OpenRouter, Ollama) |
| Function Calling | ✅ | 🚧 Planned |
| Code Execution | ✅ | 🚧 Planned |

## Roadmap

- [x] Base agent framework
- [x] AssistantAgent with OpenAI
- [x] UserProxyAgent
- [x] Group chat capabilities
- [x] Multiple LLM provider support (OpenAI, OpenRouter, Ollama)
- [ ] Function calling support
- [ ] Code execution agent
- [ ] Additional LLM provider integrations (Anthropic SDK, Google Gemini, etc.)
- [ ] Advanced conversation patterns
- [ ] Streaming responses
- [ ] Performance optimizations

## Contributing

Contributions are welcome! This project aims to maintain feature parity with the .NET version of AutoGen while adapting to Node.js/TypeScript best practices.

## License

MIT

## Acknowledgments

This project is inspired by and based on the architecture of [microsoft/autogen](https://github.com/microsoft/autogen). Special thanks to the AutoGen team for creating such a powerful framework.

## Related Projects

- [microsoft/autogen](https://github.com/microsoft/autogen) - Original Python implementation
- [microsoft/autogen (dotnet)](https://github.com/microsoft/autogen/tree/main/dotnet) - .NET implementation

