/**
 * Manual test script for success-meter module
 * Run with: npx tsx src/lib/ai/test-success-meter.ts
 * 
 * Note: Requires OPENAI_API_KEY environment variable
 */

import { analyzeMessageQuality, calculateNewMeter, determineGameStatus } from './success-meter';
import type { ConversationContext } from '@/types/chat';

// Test configuration
const TEST_CONTEXT: ConversationContext = {
  girlName: 'Emma',
  girlPersona: 'playful, confident, witty',
  currentMeter: 20,
  messageCount: 0,
  girlDescription: 'An attractive woman with long blonde hair and blue eyes',
};

// Test messages with expected approximate deltas
const TEST_MESSAGES = [
  {
    message: 'hey',
    expected: 'negative (generic opener)',
  },
  {
    message: 'I saw you like hiking! Ever done the Narrows in Zion?',
    expected: 'positive (good observation, specific question)',
  },
  {
    message: "You're absolutely gorgeous, like seriously stunning 😍😍😍",
    expected: 'negative (excessive compliments, try-hard)',
  },
  {
    message: "haha worth it though right? I'm convinced my calves are still traumatized from Half Dome",
    expected: 'highly positive (wit, humor, callback if relevant)',
  },
  {
    message: 'k',
    expected: 'very negative (lazy, no effort)',
  },
];

async function runTest() {
  console.log('🧪 Testing Success Meter Module\n');
  console.log('━'.repeat(80));
  console.log('\n');

  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Error: OPENAI_API_KEY environment variable not set');
    console.log('Set it in your .env.local file or export it:');
    console.log('  export OPENAI_API_KEY=sk-...');
    process.exit(1);
  }

  let currentMeter = TEST_CONTEXT.currentMeter;
  const conversationHistory: Array<{ role: string; content: string }> = [];

  for (let i = 0; i < TEST_MESSAGES.length; i++) {
    const testCase = TEST_MESSAGES[i];
    const messageNum = i + 1;

    console.log(`\n📝 Test ${messageNum}/${TEST_MESSAGES.length}`);
    console.log(`Message: "${testCase.message}"`);
    console.log(`Expected: ${testCase.expected}`);
    console.log(`Current Meter: ${currentMeter}%`);
    console.log('\nAnalyzing...');

    try {
      // Analyze the message
      const startTime = Date.now();
      const result = await analyzeMessageQuality({
        userMessage: testCase.message,
        conversationHistory,
        context: {
          ...TEST_CONTEXT,
          currentMeter,
          messageCount: conversationHistory.length / 2,
        },
      });
      const duration = Date.now() - startTime;

      // Calculate new meter
      const newMeter = calculateNewMeter(currentMeter, result.delta);
      const gameStatus = determineGameStatus(newMeter);

      // Display results
      console.log('\n✅ Result:');
      console.log(`  Delta: ${result.delta > 0 ? '+' : ''}${result.delta}`);
      console.log(`  Category: ${result.category}`);
      console.log(`  Reasoning: ${result.reasoning}`);
      console.log(`  New Meter: ${currentMeter}% → ${newMeter}%`);
      console.log(`  Game Status: ${gameStatus}`);
      console.log(`  Duration: ${duration}ms`);

      // Update state
      currentMeter = newMeter;
      conversationHistory.push(
        { role: 'user', content: testCase.message },
        { role: 'assistant', content: '[Mock AI response]' }
      );

      console.log('\n' + '─'.repeat(80));

      // Stop if game ended
      if (gameStatus !== 'active') {
        console.log(`\n🎮 Game ended: ${gameStatus.toUpperCase()}`);
        break;
      }
    } catch (error: any) {
      console.error('\n❌ Error:', error.message);
      console.log('\n' + '─'.repeat(80));
    }
  }

  console.log('\n━'.repeat(80));
  console.log('\n✅ Test completed!\n');
  console.log('Summary:');
  console.log(`  Final Meter: ${currentMeter}%`);
  console.log(`  Messages Processed: ${conversationHistory.length / 2}`);
  console.log(`  Game Status: ${determineGameStatus(currentMeter)}`);
  console.log('');
}

// Run the test
runTest().catch((error) => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});

