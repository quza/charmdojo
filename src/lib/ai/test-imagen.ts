// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

import { generateImage } from './imagen';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function testImagenGeneration() {
  console.log('\n🧪 Testing Imagen 4 Fast Image Generation\n');
  console.log('Environment check:');
  console.log('- Project ID:', process.env.GOOGLE_CLOUD_PROJECT_ID);
  console.log('- Location:', process.env.GOOGLE_CLOUD_LOCATION);
  console.log('- Model:', process.env.IMAGEN_MODEL_ID);
  console.log('- Credentials:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
  console.log('\n');

  try {
    const startTime = Date.now();

    const images = await generateImage({
      prompt: 'A professional portrait photo of a beautiful woman with long brown hair, warm smile, photorealistic, studio lighting, high quality',
      sampleCount: 1,
      aspectRatio: '3:4',
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`\n✅ SUCCESS!`);
    console.log(`⏱️  Generation time: ${duration}s`);
    console.log(`📊 Generated ${images.length} image(s)`);
    console.log(`💾 Image size: ${(images[0].buffer.length / 1024).toFixed(2)} KB`);
    console.log(`🎨 MIME type: ${images[0].mimeType}`);

    // Save to file
    const outputPath = join(process.cwd(), 'test-imagen-output.png');
    writeFileSync(outputPath, images[0].buffer);
    console.log(`\n✅ Image saved to: ${outputPath}`);
    console.log('\n🎉 Test completed successfully!\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED\n');
    console.error('Error details:', error);
    process.exit(1);
  }
}

// Run the test
testImagenGeneration();
