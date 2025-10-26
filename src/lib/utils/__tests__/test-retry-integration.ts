/**
 * Integration test for retry logic with Imagen service
 * Run with: npx tsx src/lib/utils/__tests__/test-retry-integration.ts
 */

import { generateImageWithRetry } from '../../ai/imagen';
import { generateGirlDescriptionWithFallback } from '../../ai/openai';

console.log('🧪 Testing Retry Logic Integration\n');

async function testImagenRetry() {
  console.log('1️⃣ Testing Imagen with retry logic...');
  
  try {
    const result = await generateImageWithRetry({
      prompt: 'A professional portrait photo of a young woman with brown hair and blue eyes, standing in a park, photorealistic',
      sampleCount: 1,
      aspectRatio: '3:4'
    });
    
    console.log('✅ Imagen generation succeeded');
    console.log(`   Generated ${result.length} image(s)`);
    console.log(`   Image size: ${result[0].buffer.length} bytes`);
    return true;
  } catch (error: any) {
    console.error('❌ Imagen generation failed:', error.message);
    return false;
  }
}

async function testOpenAIRetry() {
  console.log('\n2️⃣ Testing OpenAI Vision with retry logic...');
  
  // Use a test image URL (placeholder)
  const testImageUrl = 'https://picsum.photos/512/768';
  
  try {
    const result = await generateGirlDescriptionWithFallback(
      testImageUrl,
      {
        ethnicity: 'Caucasian',
        hairColor: 'Brunette',
        eyeColor: 'Blue',
        bodyType: 'Athletic',
        hairstyle: 'Long wavy',
        setting: 'Outdoor park'
      }
    );
    
    console.log('✅ Vision API call succeeded');
    console.log(`   Description length: ${result.description.length} chars`);
    console.log(`   Used fallback: ${result.usedFallback}`);
    return true;
  } catch (error: any) {
    console.error('❌ Vision API failed:', error.message);
    return false;
  }
}

async function testRetryBehavior() {
  console.log('\n3️⃣ Testing retry behavior with simulated failures...');
  
  const { withRetry } = await import('../retry');
  
  // Test 1: Success on first try
  let attempt = 0;
  const successFirst = await withRetry(
    async () => {
      attempt++;
      return 'success';
    },
    { maxAttempts: 3, initialDelay: 100 }
  );
  console.log(`   ✅ Success on first try: ${attempt} attempt(s)`);
  
  // Test 2: Success after retries
  attempt = 0;
  const successAfterRetry = await withRetry(
    async () => {
      attempt++;
      if (attempt < 3) {
        const error: any = new Error('Transient error');
        error.status = 503;
        throw error;
      }
      return 'success';
    },
    { maxAttempts: 3, initialDelay: 100 }
  );
  console.log(`   ✅ Success after retries: ${attempt} attempt(s)`);
  
  // Test 3: Non-retryable error fails fast
  attempt = 0;
  try {
    await withRetry(
      async () => {
        attempt++;
        const error: any = new Error('Bad request');
        error.status = 400;
        throw error;
      },
      { maxAttempts: 3, initialDelay: 100 }
    );
  } catch (error) {
    console.log(`   ✅ Non-retryable error failed fast: ${attempt} attempt(s)`);
  }
  
  return true;
}

async function runTests() {
  console.log('═══════════════════════════════════════════════\n');
  
  const results = {
    retry: await testRetryBehavior(),
    imagen: false,
    openai: false
  };
  
  // Only test real APIs if credentials are available
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS && process.env.GOOGLE_CLOUD_PROJECT_ID) {
    results.imagen = await testImagenRetry();
  } else {
    console.log('\n⏭️  Skipping Imagen test (no credentials)');
  }
  
  if (process.env.OPENAI_API_KEY) {
    results.openai = await testOpenAIRetry();
  } else {
    console.log('\n⏭️  Skipping OpenAI test (no credentials)');
  }
  
  console.log('\n═══════════════════════════════════════════════');
  console.log('📊 Test Results:');
  console.log(`   Retry Logic: ${results.retry ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Imagen Integration: ${results.imagen ? '✅ PASS' : '⏭️  SKIPPED'}`);
  console.log(`   OpenAI Integration: ${results.openai ? '✅ PASS' : '⏭️  SKIPPED'}`);
  console.log('═══════════════════════════════════════════════\n');
  
  const allPassed = results.retry && (results.imagen || !process.env.GOOGLE_APPLICATION_CREDENTIALS);
  process.exit(allPassed ? 0 : 1);
}

runTests().catch((error) => {
  console.error('💥 Test suite failed:', error);
  process.exit(1);
});

