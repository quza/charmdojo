/**
 * Test script for reward generation
 * Run with: node --loader ts-node/esm src/lib/services/test-reward-service.ts
 * Or use npm script if configured
 */

import { generateVoice, validateTextForVoice } from '../ai/elevenlabs';

/**
 * Test 1: ElevenLabs Voice Generation
 */
async function testElevenLabsVoice() {
  console.log('\n🧪 Test 1: ElevenLabs Voice Generation');
  console.log('=====================================\n');

  const testText = "You definitely know how to keep a girl interested... 😏";

  try {
    // Validate text
    console.log('1. Validating text...');
    validateTextForVoice(testText);
    console.log('   ✅ Text validation passed');

    // Generate voice
    console.log('\n2. Generating voice with [orgasmic] tag...');
    console.log(`   Input text: "${testText}"`);
    const audioBuffer = await generateVoice(testText);

    console.log(`\n✅ Voice generation successful!`);
    console.log(`   Buffer size: ${(audioBuffer.length / 1024).toFixed(2)} KB`);
    console.log(`   Format: MP3`);
    console.log(`   Note: Audio includes [orgasmic] prefix automatically`);

    return audioBuffer;
  } catch (error: any) {
    console.error('\n❌ Voice generation failed:', error.message);
    throw error;
  }
}

/**
 * Test 2: Text Validation
 */
function testTextValidation() {
  console.log('\n🧪 Test 2: Text Validation');
  console.log('===========================\n');

  const testCases = [
    { text: 'Valid text', shouldPass: true },
    { text: '', shouldPass: false },
    { text: '   ', shouldPass: false },
    { text: 'x'.repeat(6000), shouldPass: false },
  ];

  testCases.forEach((testCase, idx) => {
    try {
      validateTextForVoice(testCase.text);
      if (testCase.shouldPass) {
        console.log(`✅ Test ${idx + 1}: Passed (expected pass)`);
      } else {
        console.log(`❌ Test ${idx + 1}: Failed (expected fail but passed)`);
      }
    } catch (error) {
      if (!testCase.shouldPass) {
        console.log(`✅ Test ${idx + 1}: Passed (expected fail)`);
      } else {
        console.log(`❌ Test ${idx + 1}: Failed (expected pass but failed)`);
      }
    }
  });
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('\n🚀 Starting Reward Service Tests');
  console.log('=================================\n');

  try {
    // Test text validation
    testTextValidation();

    // Test ElevenLabs voice generation
    await testElevenLabsVoice();

    console.log('\n\n✅ All tests completed!');
    console.log('=======================\n');
  } catch (error: any) {
    console.error('\n\n❌ Tests failed:', error.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

export { testElevenLabsVoice, testTextValidation };


