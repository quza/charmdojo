/**
 * Integration test for girl image generation
 * Tests the complete pipeline from attribute generation to image upload
 * 
 * Run with: npm run test:girl-images
 */

// Load environment variables
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import { generateGirlProfiles } from '@/lib/utils/girl-generator';
import { generateMultipleGirlImages } from '@/lib/services/girl-image-service';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function testGirlImageGeneration() {
  console.log('\n🧪 Testing Girl Image Generation Pipeline\n');
  console.log('=' .repeat(60));
  
  // Environment check
  console.log('\n📋 Environment Check:');
  console.log(`   GOOGLE_CLOUD_PROJECT_ID: ${process.env.GOOGLE_CLOUD_PROJECT_ID ? '✓' : '✗'}`);
  console.log(`   GOOGLE_CLOUD_LOCATION: ${process.env.GOOGLE_CLOUD_LOCATION || 'europe-central2'}`);
  console.log(`   GOOGLE_APPLICATION_CREDENTIALS: ${process.env.GOOGLE_APPLICATION_CREDENTIALS ? '✓' : '✗'}`);
  console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓' : '✗'}`);
  
  if (!process.env.GOOGLE_CLOUD_PROJECT_ID || !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error('\n❌ Missing required environment variables');
    console.error('   Please ensure GOOGLE_CLOUD_PROJECT_ID and GOOGLE_APPLICATION_CREDENTIALS are set');
    process.exit(1);
  }

  try {
    // Step 1: Generate girl profiles
    console.log('\n' + '='.repeat(60));
    console.log('📝 Step 1: Generating Girl Profiles');
    console.log('='.repeat(60));
    
    const girls = generateGirlProfiles(3);
    console.log(`\n✓ Generated ${girls.length} girl profiles:`);
    girls.forEach((girl, i) => {
      console.log(`\n   ${i + 1}. ${girl.name}`);
      console.log(`      Ethnicity: ${girl.attributes.ethnicity}`);
      console.log(`      Hair: ${girl.attributes.hairColor} ${girl.attributes.hairstyle}`);
      console.log(`      Eyes: ${girl.attributes.eyeColor}`);
      console.log(`      Body: ${girl.attributes.bodyType}`);
      console.log(`      Setting: ${girl.attributes.setting}`);
    });

    // Step 2: Generate images
    console.log('\n' + '='.repeat(60));
    console.log('🎨 Step 2: Generating Images (this may take 10-30 seconds)');
    console.log('='.repeat(60));
    
    const startTime = Date.now();
    const results = await generateMultipleGirlImages(girls);
    const totalTime = (Date.now() - startTime) / 1000;

    // Step 3: Analyze results
    console.log('\n' + '='.repeat(60));
    console.log('📊 Step 3: Results Analysis');
    console.log('='.repeat(60));
    
    const successCount = results.filter(r => r.success).length;
    const placeholderCount = results.filter(r => r.usedPlaceholder).length;
    const failedCount = results.filter(r => !r.success).length;

    console.log(`\n📈 Summary:`);
    console.log(`   Total time: ${totalTime.toFixed(2)}s`);
    console.log(`   Average per image: ${(totalTime / results.length).toFixed(2)}s`);
    console.log(`   Success rate: ${successCount}/${results.length} (${((successCount / results.length) * 100).toFixed(1)}%)`);
    console.log(`   Placeholders used: ${placeholderCount}`);
    console.log(`   Failed: ${failedCount}`);

    console.log(`\n📋 Individual Results:`);
    results.forEach((result, i) => {
      const girl = girls[i];
      const status = result.success 
        ? (result.usedPlaceholder ? '⚠️  Placeholder' : '✅ Success')
        : '❌ Failed';
      
      console.log(`\n   ${i + 1}. ${girl.name}: ${status}`);
      console.log(`      Time: ${result.generationTime.toFixed(2)}s`);
      if (result.success) {
        console.log(`      URL: ${result.imageUrl}`);
      } else {
        console.log(`      Error: ${result.error}`);
      }
    });

    // Step 4: Verify URLs are accessible
    console.log('\n' + '='.repeat(60));
    console.log('🔗 Step 4: Verifying Image URLs');
    console.log('='.repeat(60));

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.success && result.imageUrl) {
        try {
          const response = await fetch(result.imageUrl, { method: 'HEAD' });
          const accessible = response.ok;
          console.log(`\n   ${i + 1}. ${girls[i].name}: ${accessible ? '✅ Accessible' : '❌ Not accessible'}`);
          if (!accessible) {
            console.log(`      Status: ${response.status} ${response.statusText}`);
          }
        } catch (error) {
          console.log(`\n   ${i + 1}. ${girls[i].name}: ❌ Error checking URL`);
          console.log(`      ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    // Save test report
    const report = {
      timestamp: new Date().toISOString(),
      girls,
      results,
      summary: {
        totalTime,
        successCount,
        placeholderCount,
        failedCount,
      },
    };

    const reportPath = join(process.cwd(), 'test-girl-images-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Test report saved to: ${reportPath}`);

    // Final result
    console.log('\n' + '='.repeat(60));
    if (successCount === results.length && placeholderCount === 0) {
      console.log('🎉 ALL TESTS PASSED! All images generated successfully.');
    } else if (successCount > 0) {
      console.log(`⚠️  PARTIAL SUCCESS: ${successCount}/${results.length} images generated.`);
      if (placeholderCount > 0) {
        console.log(`   ${placeholderCount} placeholder(s) used due to Imagen failures.`);
      }
    } else {
      console.log('❌ ALL TESTS FAILED! No images were generated successfully.');
      process.exit(1);
    }
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED\n');
    console.error('Error details:', error);
    process.exit(1);
  }
}

// Run the test
testGirlImageGeneration();

