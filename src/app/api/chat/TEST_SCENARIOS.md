/**
 * Test Script for Chat API
 * Run this to test various scenarios: good/poor messages, instant fails, win/loss conditions
 * 
 * Usage: node --loader ts-node/esm src/app/api/chat/test-chat-api.ts
 * Or use this as a reference for manual testing
 */

/**
 * TEST SCENARIOS TO MANUALLY TEST
 * 
 * Prerequisites:
 * 1. Have a valid roundId from an active game round
 * 2. User must be authenticated
 * 3. OpenAI API key must be configured
 * 
 * Use these curl commands or Postman to test:
 */

const TEST_SCENARIOS = {
  // SCENARIO 1: Good message (should increase meter)
  goodMessage: {
    description: 'User sends an engaging, witty message',
    request: {
      roundId: 'YOUR_ROUND_ID',
      message: 'I noticed you love hiking! Ever done the Narrows in Zion? I hear it\'s incredible but also slightly terrifying 😅',
      conversationHistory: []
    },
    expectedDelta: '+3 to +6',
    expectedCategory: 'good or excellent',
    expectedStatus: 'active'
  },

  // SCENARIO 2: Poor message (should decrease meter)
  poorMessage: {
    description: 'User sends boring, generic message',
    request: {
      roundId: 'YOUR_ROUND_ID',
      message: 'hey',
      conversationHistory: []
    },
    expectedDelta: '-1 to -2',
    expectedCategory: 'poor or neutral',
    expectedStatus: 'active'
  },

  // SCENARIO 3: Excellent message (large positive delta)
  excellentMessage: {
    description: 'User sends creative callback with humor',
    request: {
      roundId: 'YOUR_ROUND_ID',
      message: 'Haha I love that you mentioned tacos in your bio. Let me guess - you\'re the type who orders fish tacos but secretly judges people who put ketchup on them? 😏',
      conversationHistory: []
    },
    expectedDelta: '+6 to +8',
    expectedCategory: 'excellent',
    expectedStatus: 'active'
  },

  // SCENARIO 4: Bad message (large negative delta)
  badMessage: {
    description: 'User sends try-hard pickup line',
    request: {
      roundId: 'YOUR_ROUND_ID',
      message: 'Did it hurt when you fell from heaven? Because you\'re absolutely gorgeous and I can\'t stop thinking about you.',
      conversationHistory: []
    },
    expectedDelta: '-5 to -8',
    expectedCategory: 'bad',
    expectedStatus: 'active'
  },

  // SCENARIO 5: Offensive message (instant fail)
  offensiveMessage: {
    description: 'User sends offensive content',
    request: {
      roundId: 'YOUR_ROUND_ID',
      message: 'You stupid [offensive slur], send me nudes right now!',
      conversationHistory: []
    },
    expectedDelta: 'Instant to 0',
    expectedCategory: 'bad',
    expectedStatus: 'lost',
    instantFail: true
  },

  // SCENARIO 6: Gibberish (instant fail)
  gibberishMessage: {
    description: 'User sends nonsense/gibberish',
    request: {
      roundId: 'YOUR_ROUND_ID',
      message: 'asdfghjklzxcvbnmqwertyuiop',
      conversationHistory: []
    },
    expectedDelta: 'Instant to 0',
    expectedCategory: 'bad',
    expectedStatus: 'lost',
    instantFail: true
  },

  // SCENARIO 7: Empty message (validation error)
  emptyMessage: {
    description: 'User sends empty message',
    request: {
      roundId: 'YOUR_ROUND_ID',
      message: '   ',
      conversationHistory: []
    },
    expectedError: 400,
    expectedMessage: 'Message cannot be empty'
  },

  // SCENARIO 8: Win condition (meter reaches 100)
  winScenario: {
    description: 'Multiple good messages leading to win',
    note: 'Send several excellent messages in sequence to reach 100%',
    steps: [
      'Send excellent message (+7)',
      'Send excellent message (+8)',
      'Send excellent message (+7)',
      'Continue until meter >= 100'
    ],
    expectedStatus: 'won',
    expectedResult: 'Round marked as win, completed_at set'
  },

  // SCENARIO 9: Loss condition (meter drops to 5 or below)
  lossScenario: {
    description: 'Multiple poor messages leading to loss',
    note: 'Send several bad messages in sequence to drop below 6%',
    steps: [
      'Send bad message (-7)',
      'Send bad message (-6)',
      'Send poor message (-5)',
      'Continue until meter <= 5'
    ],
    expectedStatus: 'lost',
    expectedResult: 'Round marked as lose, completed_at set'
  },

  // SCENARIO 10: Conversation with history
  conversationWithHistory: {
    description: 'Test with conversation history',
    request: {
      roundId: 'YOUR_ROUND_ID',
      message: 'That sounds amazing! I\'ve always wanted to try it.',
      conversationHistory: [
        { role: 'user', content: 'What do you like to do for fun?' },
        { role: 'assistant', content: 'I love hiking and trying new restaurants! Been exploring a lot of trails lately 🥾' }
      ]
    },
    expectedDelta: '+2 to +5',
    expectedCategory: 'good',
    note: 'AI should reference previous context'
  }
};

/**
 * MANUAL TESTING INSTRUCTIONS:
 * 
 * 1. Start your Next.js dev server:
 *    npm run dev
 * 
 * 2. Get a valid roundId by:
 *    - Navigate to /game/selection
 *    - Select a girl and start a round
 *    - Note the roundId from the URL or browser console
 * 
 * 3. Use this curl template (replace YOUR_ROUND_ID):
 * 
 * curl -X POST http://localhost:3000/api/chat/message \
 *   -H "Content-Type: application/json" \
 *   -H "Cookie: YOUR_SESSION_COOKIE" \
 *   -d '{
 *     "roundId": "YOUR_ROUND_ID",
 *     "message": "Hey! I saw you love hiking, any favorite trails?",
 *     "conversationHistory": []
 *   }'
 * 
 * 4. Check the response format:
 *    {
 *      "userMessage": { "id": "...", "content": "...", "timestamp": "...", "role": "user" },
 *      "aiResponse": { "id": "...", "content": "...", "timestamp": "...", "role": "assistant" },
 *      "successMeter": { "previous": 20, "delta": 5, "current": 25, "category": "good" },
 *      "gameStatus": "active"
 *    }
 * 
 * 5. Verify database updates:
 *    - Check `messages` table for both user and AI messages
 *    - Check `game_rounds` table for updated final_meter and message_count
 *    - If game ended, check result and completed_at fields
 */

export const testInstructions = `
TEST CHECKLIST:

✅ FUNCTIONALITY TESTS:
  [ ] Good message returns positive delta
  [ ] Poor message returns negative delta
  [ ] Excellent message returns +6 to +8
  [ ] Bad message returns -6 to -8
  [ ] Offensive message triggers instant fail
  [ ] Gibberish triggers instant fail
  [ ] Empty message returns 400 error
  [ ] Meter reaches 100 → status = 'won'
  [ ] Meter drops to ≤5 → status = 'lost'
  [ ] Conversation history is respected

✅ DATABASE TESTS:
  [ ] User message saved to messages table
  [ ] AI response saved to messages table
  [ ] Round message_count incremented by 2
  [ ] Round final_meter updated correctly
  [ ] Win: result='win', completed_at set
  [ ] Loss: result='lose', completed_at set
  [ ] Instant fail: is_instant_fail=true, fail_reason set

✅ API RESPONSE TESTS:
  [ ] Response includes userMessage with id
  [ ] Response includes aiResponse with id
  [ ] successMeter shows correct previous/delta/current
  [ ] gameStatus reflects current state
  [ ] instantFail flag present when applicable
  [ ] Timestamps are ISO format

✅ ERROR HANDLING:
  [ ] 400 for missing roundId
  [ ] 400 for missing message
  [ ] 400 for empty message
  [ ] 400 for message >500 chars
  [ ] 401 for unauthenticated request
  [ ] 404 for non-existent roundId
  [ ] 400 for already completed round
  [ ] 500 for OpenAI API errors
  [ ] 503 for AI service unavailable

✅ EDGE CASES:
  [ ] Very short message (1-2 chars)
  [ ] Message with emojis only
  [ ] Message with special characters
  [ ] Multiple rapid messages (race conditions)
  [ ] Message at exactly 100% meter
  [ ] Message at exactly 5% meter
  [ ] Round with no girl_description
  [ ] Round with no girl_persona
`;

console.log('='.repeat(80));
console.log('CHAT API TEST SCENARIOS');
console.log('='.repeat(80));
console.log(testInstructions);
console.log('\nTest Scenarios:', JSON.stringify(TEST_SCENARIOS, null, 2));

export default TEST_SCENARIOS;



