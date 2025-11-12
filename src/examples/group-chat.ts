import { AssistantAgent } from '../agents/AssistantAgent';
import { GroupChat, GroupChatManager } from '../core/GroupChat';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Example demonstrating group chat with multiple agents
 * Similar to .NET AutoGen's group chat functionality
 */
async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('Please set OPENAI_API_KEY environment variable');
    process.exit(1);
  }

  console.log('='.repeat(60));
  console.log('AutoGen Node.js - Group Chat Example');
  console.log('='.repeat(60));
  console.log('Three AI agents collaborating on a product design...\n');

  // Create multiple specialized agents
  const designer = new AssistantAgent({
    name: 'designer',
    apiKey: apiKey,
    systemMessage: `You are a creative product designer.
      Focus on user experience, aesthetics, and innovation.
      When satisfied with the design, include "TERMINATE" in your response.`,
    model: 'gpt-3.5-turbo',
    temperature: 0.8
  });

  const engineer = new AssistantAgent({
    name: 'engineer',
    apiKey: apiKey,
    systemMessage: `You are a practical software engineer.
      Focus on feasibility, technical implementation, and best practices.
      Provide constructive feedback on designs.`,
    model: 'gpt-3.5-turbo',
    temperature: 0.3
  });

  const productManager = new AssistantAgent({
    name: 'product_manager',
    apiKey: apiKey,
    systemMessage: `You are a product manager.
      Focus on user needs, market fit, and business value.
      Synthesize feedback from design and engineering perspectives.`,
    model: 'gpt-3.5-turbo',
    temperature: 0.5
  });

  // Create a group chat
  const groupChat = new GroupChat({
    agents: [designer, engineer, productManager],
    maxRound: 6,
    adminName: 'TaskInitiator'
  });

  // Create a manager for the group chat
  const manager = new GroupChatManager({
    groupChat: groupChat,
    name: 'chat_manager'
  });

  try {
    // Start the group discussion
    const task = `We need to design a new feature: A smart notification system 
    that learns user preferences and only shows relevant notifications.
    Let's collaborate on this design. Each of you should provide your perspective.`;

    console.log(`[TaskInitiator]: ${task}\n`);
    console.log('-'.repeat(60));

    // Run the group chat
    const messages = await manager.runChat(task);

    console.log('\n' + '='.repeat(60));
    console.log('Group Chat Completed!');
    console.log('='.repeat(60));
    console.log(`\nTotal messages: ${messages.length}`);
    console.log('\nConversation Summary:');
    console.log('-'.repeat(60));

    // Show a summary
    const agentStats: { [key: string]: number } = {};
    messages.forEach(msg => {
      const name = msg.name || msg.role;
      agentStats[name] = (agentStats[name] || 0) + 1;
    });

    console.log('\nParticipation:');
    Object.entries(agentStats).forEach(([name, count]) => {
      console.log(`  ${name}: ${count} message(s)`);
    });

  } catch (error) {
    console.error('\nError during group chat:', error);
    if (error instanceof Error) {
      console.error('Details:', error.message);
    }
  }
}

// Run the example
main().catch(console.error);
