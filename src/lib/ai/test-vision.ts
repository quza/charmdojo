/**
 * Test script for GPT-4 Vision API integration
 * Tests girl description generation with Vision API and fallback
 * 
 * Usage: npx tsx src/lib/ai/test-vision.ts
 */

import { 
  generateGirlDescription, 
  generateFallbackDescription,
  generateGirlDescriptionWithFallback,
  validateDescription 
} from './openai';
import { GirlAttributes } from '@/types/game';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Sample girl attributes for testing
const sampleAttributes: GirlAttributes = {
  ethnicity: 'Asian',
  hairColor: 'Black',
  eyeColor: 'Brown',
  bodyType: 'Slim',
  hairstyle: 'Long straight',
  setting: 'Coffee shop',
};

// Sample image URL (use a real generated image URL for testing)
// This should be replaced with an actual image URL from your storage
const sampleImageUrl = 'https://ketkanvkuzmnbsebeuax.supabase.co/storage/v1/object/public/girl-images/elena_1761427628825_185vz1fbx4u.png';

async function testVisionAPI() {
  console.log('🧪 Testing GPT-4 Vision API Integration\n');
  console.log('='.repeat(60));

  // Test 1: Validate description function
  console.log('\n📋 Test 1: Description Validation');
  console.log('-'.repeat(60));
  
  const validDesc = 'An attractive Asian woman with long straight black hair that frames her face beautifully. Her brown eyes are captivating and expressive, drawing attention with their natural warmth. She has a slim build with graceful proportions and confident posture. Her facial features include well-defined cheekbones, a delicate nose, and full lips that complement her overall appearance. Her skin has a healthy, natural glow with a smooth complexion.';
  const shortDesc = 'A pretty woman.';
  const longDesc = validDesc.repeat(10);

  console.log(`Valid description (150 words): ${validateDescription(validDesc) ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Short description (<100 words): ${!validateDescription(shortDesc) ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Long description (>400 words): ${!validateDescription(longDesc) ? '✅ PASS' : '❌ FAIL'}`);

  // Test 2: Template-based fallback
  console.log('\n📋 Test 2: Template-Based Fallback Generation');
  console.log('-'.repeat(60));
  
  try {
    const fallbackDesc = generateFallbackDescription(sampleAttributes);
    const wordCount = fallbackDesc.split(/\s+/).length;
    const isValid = validateDescription(fallbackDesc);

    console.log(`Fallback description generated: ✅`);
    console.log(`Word count: ${wordCount} words`);
    console.log(`Validation: ${isValid ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`\nSample output (first 200 chars):\n"${fallbackDesc.substring(0, 200)}..."\n`);
  } catch (error) {
    console.error('❌ Fallback generation failed:', error);
  }

  // Test 3: Vision API with fallback (will use fallback if API key not set)
  console.log('\n📋 Test 3: Vision API with Automatic Fallback');
  console.log('-'.repeat(60));

  try {
    const startTime = Date.now();
    const result = await generateGirlDescriptionWithFallback(
      sampleImageUrl,
      sampleAttributes
    );
    const elapsedTime = (Date.now() - startTime) / 1000;

    console.log(`Description generated: ✅`);
    console.log(`Method used: ${result.usedFallback ? 'Template Fallback' : 'Vision API'}`);
    console.log(`Generation time: ${elapsedTime.toFixed(2)}s`);
    console.log(`Word count: ${result.description.split(/\s+/).length} words`);
    console.log(`Validation: ${validateDescription(result.description) ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`\nGenerated description (first 300 chars):\n"${result.description.substring(0, 300)}..."\n`);
  } catch (error) {
    console.error('❌ Description generation failed:', error);
  }

  // Test 4: Direct Vision API call (will fail if no valid image URL or API key)
  console.log('\n📋 Test 4: Direct Vision API Call');
  console.log('-'.repeat(60));

  if (!process.env.OPENAI_API_KEY) {
    console.log('⚠️  SKIPPED: OPENAI_API_KEY not set in environment');
  } else {
    try {
      console.log('⚠️  NOTE: This test requires a valid image URL');
      console.log(`Using image URL: ${sampleImageUrl}`);
      
      const startTime = Date.now();
      const description = await generateGirlDescription(sampleImageUrl, 10000);
      const elapsedTime = (Date.now() - startTime) / 1000;

      console.log(`Vision API call successful: ✅`);
      console.log(`Generation time: ${elapsedTime.toFixed(2)}s`);
      console.log(`Word count: ${description.split(/\s+/).length} words`);
      console.log(`Validation: ${validateDescription(description) ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`\nVision API description (first 300 chars):\n"${description.substring(0, 300)}..."\n`);
    } catch (error) {
      console.log(`❌ Vision API call failed (expected with placeholder URL)`);
      console.log(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('✅ Test suite completed');
  console.log('\n💡 To test with real images:');
  console.log('1. Set OPENAI_API_KEY in .env.local');
  console.log('2. Replace sampleImageUrl with a real generated girl image URL');
  console.log('3. Run: npx tsx src/lib/ai/test-vision.ts\n');
}

// Run tests
testVisionAPI().catch(console.error);

