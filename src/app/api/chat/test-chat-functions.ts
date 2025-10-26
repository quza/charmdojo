#!/usr/bin/env node
/**
 * Simple Test Runner for Chat API Moderation and Chat Logic
 * Tests the core functions without requiring a full API setup
 * 
 * Run with: npx tsx src/app/api/chat/test-chat-functions.ts
 */

import { checkMessageSafety } from '@/lib/ai/moderation';
import { calculateNewMeter, determineGameStatus, getCategoryFromDelta } from '@/lib/ai/chat';

async function runTests() {
  console.log('🧪 Testing Chat API Core Functions\n');
  console.log('='.repeat(80));

  // Test 1: Moderation - Safe Messages
  console.log('\n📋 Test 1: Moderation - Safe Messages');
  const safeMessages = [
    'Hey! I saw you love hiking, any favorite trails?',
    'That sounds amazing! Tell me more 😊',
    'I totally agree with you on that',
  ];

  for (const msg of safeMessages) {
    const result = await checkMessageSafety(msg);
    console.log(`  ✓ "${msg.substring(0, 40)}..." → Safe: ${result.isSafe}`);
  }

  // Test 2: Moderation - Gibberish Detection
  console.log('\n📋 Test 2: Moderation - Gibberish Detection');
  const gibberishMessages = [
    'asdfghjklzxcvbnmqwertyuiop',
    'aaaaaaaaaaaaaaaa',
    'jfkdlsjfkldsjfkldsjfklds',
    '!@#$%^&*()!@#$%^&*()',
  ];

  for (const msg of gibberishMessages) {
    const result = await checkMessageSafety(msg);
    console.log(`  ${result.isSafe ? '✗' : '✓'} "${msg.substring(0, 30)}" → Flagged: ${!result.isSafe} (${result.failReason})`);
  }

  // Test 3: Moderation - Empty Messages
  console.log('\n📋 Test 3: Moderation - Empty Messages');
  const emptyMessages = ['', '   ', '\n\n', '\t'];

  for (const msg of emptyMessages) {
    const result = await checkMessageSafety(msg);
    console.log(`  ✓ Empty message → Flagged: ${!result.isSafe} (${result.failReason})`);
  }

  // Test 4: Success Meter Calculations
  console.log('\n📋 Test 4: Success Meter Calculations');
  const meterTests = [
    { current: 20, delta: 5, expected: 25 },
    { current: 95, delta: 8, expected: 100 },  // Should cap at 100
    { current: 10, delta: -8, expected: 2 },
    { current: 3, delta: -5, expected: 0 },     // Should floor at 0
    { current: 50, delta: 0, expected: 50 },
  ];

  for (const test of meterTests) {
    const result = calculateNewMeter(test.current, test.delta);
    const pass = result === test.expected;
    console.log(`  ${pass ? '✓' : '✗'} ${test.current} + (${test.delta}) = ${result} (expected ${test.expected})`);
  }

  // Test 5: Game Status Determination
  console.log('\n📋 Test 5: Game Status Determination');
  const statusTests = [
    { meter: 100, expected: 'won' },
    { meter: 105, expected: 'won' },  // Over 100 still wins
    { meter: 5, expected: 'lost' },
    { meter: 0, expected: 'lost' },
    { meter: 3, expected: 'lost' },
    { meter: 6, expected: 'active' },
    { meter: 50, expected: 'active' },
    { meter: 99, expected: 'active' },
  ];

  for (const test of statusTests) {
    const result = determineGameStatus(test.meter);
    const pass = result === test.expected;
    console.log(`  ${pass ? '✓' : '✗'} Meter ${test.meter}% → ${result} (expected ${test.expected})`);
  }

  // Test 6: Category from Delta
  console.log('\n📋 Test 6: Category from Delta');
  const categoryTests = [
    { delta: 8, expected: 'excellent' },
    { delta: 6, expected: 'excellent' },
    { delta: 5, expected: 'good' },
    { delta: 3, expected: 'good' },
    { delta: 2, expected: 'neutral' },
    { delta: 0, expected: 'neutral' },
    { delta: -2, expected: 'neutral' },
    { delta: -3, expected: 'poor' },
    { delta: -5, expected: 'poor' },
    { delta: -6, expected: 'bad' },
    { delta: -8, expected: 'bad' },
  ];

  for (const test of categoryTests) {
    const result = getCategoryFromDelta(test.delta);
    const pass = result === test.expected;
    console.log(`  ${pass ? '✓' : '✗'} Delta ${test.delta > 0 ? '+' : ''}${test.delta} → ${result} (expected ${test.expected})`);
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ Core Function Tests Complete!\n');
  console.log('Next Steps:');
  console.log('1. Start your dev server: npm run dev');
  console.log('2. Create a game round via /game/selection');
  console.log('3. Test the full API endpoint using the scenarios in TEST_SCENARIOS.md');
  console.log('4. Check database tables to verify persistence\n');
}

// Run tests
runTests().catch(console.error);



