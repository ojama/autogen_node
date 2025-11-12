import { GroupChat, GroupChatManager } from '../core/GroupChat';
import { BaseAgent } from '../core/BaseAgent';
import { IMessage } from '../core/IAgent';

// Mock agent for testing
class MockAgent extends BaseAgent {
  private mockReplies: string[];
  private replyIndex: number = 0;

  constructor(name: string, mockReplies: string[] = ['Mock reply']) {
    super({ name });
    this.mockReplies = mockReplies;
  }

  async generateReply(
    messages: IMessage[],
    cancellationToken?: AbortSignal
  ): Promise<IMessage> {
    const reply = this.mockReplies[this.replyIndex % this.mockReplies.length];
    this.replyIndex++;
    
    return {
      role: 'assistant',
      content: reply,
      name: this.name
    };
  }
}

describe('GroupChat', () => {
  describe('constructor', () => {
    it('should create a group chat with multiple agents', () => {
      const agent1 = new MockAgent('agent1');
      const agent2 = new MockAgent('agent2');
      
      const groupChat = new GroupChat({
        agents: [agent1, agent2]
      });
      
      expect(groupChat.getAgents()).toHaveLength(2);
    });

    it('should throw error with less than 2 agents', () => {
      const agent1 = new MockAgent('agent1');
      
      expect(() => {
        new GroupChat({
          agents: [agent1]
        });
      }).toThrow('GroupChat requires at least 2 agents');
    });

    it('should use default maxRound if not provided', () => {
      const agent1 = new MockAgent('agent1');
      const agent2 = new MockAgent('agent2');
      
      const groupChat = new GroupChat({
        agents: [agent1, agent2]
      });
      
      expect(groupChat['maxRound']).toBe(10);
    });

    it('should use provided maxRound', () => {
      const agent1 = new MockAgent('agent1');
      const agent2 = new MockAgent('agent2');
      
      const groupChat = new GroupChat({
        agents: [agent1, agent2],
        maxRound: 5
      });
      
      expect(groupChat['maxRound']).toBe(5);
    });
  });

  describe('getAgents', () => {
    it('should return a copy of the agents array', () => {
      const agent1 = new MockAgent('agent1');
      const agent2 = new MockAgent('agent2');
      
      const groupChat = new GroupChat({
        agents: [agent1, agent2]
      });
      
      const agents1 = groupChat.getAgents();
      const agents2 = groupChat.getAgents();
      
      expect(agents1).not.toBe(agents2); // Different references
      expect(agents1).toEqual(agents2); // Same content
    });
  });

  describe('getMessages', () => {
    it('should return empty array initially', () => {
      const agent1 = new MockAgent('agent1');
      const agent2 = new MockAgent('agent2');
      
      const groupChat = new GroupChat({
        agents: [agent1, agent2]
      });
      
      expect(groupChat.getMessages()).toHaveLength(0);
    });

    it('should return messages after adding', () => {
      const agent1 = new MockAgent('agent1');
      const agent2 = new MockAgent('agent2');
      
      const groupChat = new GroupChat({
        agents: [agent1, agent2]
      });
      
      const msg: IMessage = {
        role: 'user',
        content: 'Test message'
      };
      
      groupChat.addMessage(msg);
      
      expect(groupChat.getMessages()).toHaveLength(1);
      expect(groupChat.getMessages()[0]).toEqual(msg);
    });
  });

  describe('run', () => {
    it('should start conversation with initial message', async () => {
      const agent1 = new MockAgent('agent1', ['TERMINATE']);
      const agent2 = new MockAgent('agent2', ['Response']);
      
      const groupChat = new GroupChat({
        agents: [agent1, agent2],
        maxRound: 3
      });
      
      const messages = await groupChat.run('Hello');
      
      expect(messages.length).toBeGreaterThan(0);
      expect(messages[0].content).toBe('Hello');
    });

    it('should terminate on TERMINATE keyword', async () => {
      const agent1 = new MockAgent('agent1', ['TERMINATE']);
      const agent2 = new MockAgent('agent2', ['Response']);
      
      const groupChat = new GroupChat({
        agents: [agent1, agent2],
        maxRound: 10
      });
      
      const messages = await groupChat.run('Start');
      
      // Should terminate before max rounds
      expect(messages.length).toBeLessThan(10);
    });

    it('should respect max rounds', async () => {
      const agent1 = new MockAgent('agent1', ['Continue']);
      const agent2 = new MockAgent('agent2', ['Continue']);
      
      const maxRound = 3;
      const groupChat = new GroupChat({
        agents: [agent1, agent2],
        maxRound
      });
      
      const messages = await groupChat.run('Start');
      
      // Initial message + max rounds
      expect(messages.length).toBeLessThanOrEqual(maxRound + 1);
    });

    it('should rotate between agents', async () => {
      const agent1 = new MockAgent('agent1', ['Reply from agent1']);
      const agent2 = new MockAgent('agent2', ['Reply from agent2']);
      const agent3 = new MockAgent('agent3', ['TERMINATE']);
      
      const groupChat = new GroupChat({
        agents: [agent1, agent2, agent3],
        maxRound: 5
      });
      
      const messages = await groupChat.run('Start');
      
      // Check that different agents replied
      const agentNames = messages
        .slice(1) // Skip initial message
        .map(msg => msg.name)
        .filter((name): name is string => name !== undefined);
      
      expect(agentNames).toContain('agent1');
    });
  });

  describe('reset', () => {
    it('should clear all messages', async () => {
      const agent1 = new MockAgent('agent1', ['TERMINATE']);
      const agent2 = new MockAgent('agent2', ['Response']);
      
      const groupChat = new GroupChat({
        agents: [agent1, agent2]
      });
      
      await groupChat.run('Hello');
      expect(groupChat.getMessages().length).toBeGreaterThan(0);
      
      groupChat.reset();
      expect(groupChat.getMessages()).toHaveLength(0);
    });
  });
});

describe('GroupChatManager', () => {
  describe('constructor', () => {
    it('should create a manager with a group chat', () => {
      const agent1 = new MockAgent('agent1');
      const agent2 = new MockAgent('agent2');
      
      const groupChat = new GroupChat({
        agents: [agent1, agent2]
      });
      
      const manager = new GroupChatManager({
        groupChat
      });
      
      expect(manager.getName()).toBe('chat_manager');
      expect(manager.getGroupChat()).toBe(groupChat);
    });

    it('should use custom name if provided', () => {
      const agent1 = new MockAgent('agent1');
      const agent2 = new MockAgent('agent2');
      
      const groupChat = new GroupChat({
        agents: [agent1, agent2]
      });
      
      const manager = new GroupChatManager({
        groupChat,
        name: 'custom_manager'
      });
      
      expect(manager.getName()).toBe('custom_manager');
    });
  });

  describe('runChat', () => {
    it('should run the group chat', async () => {
      const agent1 = new MockAgent('agent1', ['TERMINATE']);
      const agent2 = new MockAgent('agent2', ['Response']);
      
      const groupChat = new GroupChat({
        agents: [agent1, agent2]
      });
      
      const manager = new GroupChatManager({
        groupChat
      });
      
      const messages = await manager.runChat('Start conversation');
      
      expect(messages.length).toBeGreaterThan(0);
    });
  });

  describe('getGroupChat', () => {
    it('should return the group chat instance', () => {
      const agent1 = new MockAgent('agent1');
      const agent2 = new MockAgent('agent2');
      
      const groupChat = new GroupChat({
        agents: [agent1, agent2]
      });
      
      const manager = new GroupChatManager({
        groupChat
      });
      
      expect(manager.getGroupChat()).toBe(groupChat);
    });
  });
});
