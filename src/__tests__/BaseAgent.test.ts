import { BaseAgent } from '../core/BaseAgent';
import { IMessage } from '../core/IAgent';

// Mock agent for testing
class MockAgent extends BaseAgent {
  private mockReply: string;

  constructor(name: string, mockReply: string = 'Mock reply') {
    super({ name });
    this.mockReply = mockReply;
  }

  async generateReply(
    messages: IMessage[],
    cancellationToken?: AbortSignal
  ): Promise<IMessage> {
    return {
      role: 'assistant',
      content: this.mockReply,
      name: this.name
    };
  }

  setMockReply(reply: string): void {
    this.mockReply = reply;
  }
}

describe('BaseAgent', () => {
  let agent: MockAgent;

  beforeEach(() => {
    agent = new MockAgent('test_agent');
  });

  describe('constructor', () => {
    it('should create an agent with a name', () => {
      expect(agent.getName()).toBe('test_agent');
    });

    it('should initialize with empty conversation history when no system message', () => {
      const history = agent.getConversationHistory();
      expect(history).toHaveLength(0);
    });

    it('should initialize with system message in history when provided', () => {
      const agentWithSystem = new MockAgent('agent_with_system');
      agentWithSystem['systemMessage'] = 'You are a helpful assistant';
      agentWithSystem['conversationHistory'] = [{
        role: 'system',
        content: 'You are a helpful assistant'
      }];
      
      const history = agentWithSystem.getConversationHistory();
      expect(history).toHaveLength(1);
      expect(history[0].role).toBe('system');
      expect(history[0].content).toBe('You are a helpful assistant');
    });
  });

  describe('getName', () => {
    it('should return the agent name', () => {
      expect(agent.getName()).toBe('test_agent');
    });
  });

  describe('getConversationHistory', () => {
    it('should return a copy of the conversation history', () => {
      const history1 = agent.getConversationHistory();
      const history2 = agent.getConversationHistory();
      
      expect(history1).not.toBe(history2); // Different references
      expect(history1).toEqual(history2); // Same content
    });
  });

  describe('clearHistory', () => {
    it('should clear conversation history', () => {
      agent['conversationHistory'] = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there' }
      ];

      expect(agent.getConversationHistory()).toHaveLength(2);
      
      agent.clearHistory();
      
      expect(agent.getConversationHistory()).toHaveLength(0);
    });

    it('should preserve system message when clearing history', () => {
      const agentWithSystem = new MockAgent('agent');
      agentWithSystem['systemMessage'] = 'System prompt';
      agentWithSystem['conversationHistory'] = [
        { role: 'system', content: 'System prompt' },
        { role: 'user', content: 'Hello' }
      ];

      agentWithSystem.clearHistory();
      
      const history = agentWithSystem.getConversationHistory();
      expect(history).toHaveLength(1);
      expect(history[0].role).toBe('system');
    });
  });

  describe('send', () => {
    it('should send a string message', async () => {
      const recipient = new MockAgent('recipient', 'Response');
      
      const reply = await agent.send('Hello', recipient, true);
      
      expect(reply).not.toBeNull();
      expect(reply?.content).toBe('Response');
      expect(reply?.name).toBe('recipient');
    });

    it('should send an IMessage', async () => {
      const recipient = new MockAgent('recipient', 'Response');
      const message: IMessage = {
        role: 'user',
        content: 'Test message'
      };
      
      const reply = await agent.send(message, recipient, true);
      
      expect(reply).not.toBeNull();
      expect(reply?.content).toBe('Response');
    });

    it('should not request reply when requestReply is false', async () => {
      const recipient = new MockAgent('recipient');
      
      const reply = await agent.send('Hello', recipient, false);
      
      expect(reply).toBeNull();
    });

    it('should add sent message to conversation history', async () => {
      const recipient = new MockAgent('recipient');
      
      await agent.send('Hello', recipient, false);
      
      const history = agent.getConversationHistory();
      expect(history.length).toBeGreaterThan(0);
      expect(history[history.length - 1].content).toBe('Hello');
    });
  });

  describe('initiateChat', () => {
    it('should conduct a multi-round conversation', async () => {
      const agent1 = new MockAgent('agent1', 'Reply 1');
      const agent2 = new MockAgent('agent2', 'Reply 2');
      
      const chatHistory = await agent1.initiateChat(agent2, 'Start', 3);
      
      expect(chatHistory.length).toBeGreaterThan(0);
    });

    it('should terminate on TERMINATE keyword', async () => {
      const agent1 = new MockAgent('agent1');
      const agent2 = new MockAgent('agent2', 'TERMINATE');
      
      const chatHistory = await agent1.initiateChat(agent2, 'Start', 10);
      
      expect(chatHistory.length).toBeLessThan(10);
      expect(chatHistory[chatHistory.length - 1].content).toContain('TERMINATE');
    });

    it('should respect max rounds limit', async () => {
      const agent1 = new MockAgent('agent1', 'Continue');
      const agent2 = new MockAgent('agent2', 'Continue');
      
      const maxRounds = 2;
      const chatHistory = await agent1.initiateChat(agent2, 'Start', maxRounds);
      
      expect(chatHistory.length).toBeLessThanOrEqual(maxRounds);
    });
  });

  describe('isTerminationMessage', () => {
    it('should detect TERMINATE keyword', () => {
      const msg: IMessage = {
        role: 'assistant',
        content: 'The task is complete. TERMINATE'
      };
      
      expect(agent['isTerminationMessage'](msg)).toBe(true);
    });

    it('should detect terminate (lowercase)', () => {
      const msg: IMessage = {
        role: 'assistant',
        content: 'terminate the conversation'
      };
      
      expect(agent['isTerminationMessage'](msg)).toBe(true);
    });

    it('should detect goodbye keyword', () => {
      const msg: IMessage = {
        role: 'assistant',
        content: 'goodbye!'
      };
      
      expect(agent['isTerminationMessage'](msg)).toBe(true);
    });

    it('should not detect termination in normal messages', () => {
      const msg: IMessage = {
        role: 'assistant',
        content: 'This is a normal message'
      };
      
      expect(agent['isTerminationMessage'](msg)).toBe(false);
    });
  });
});
