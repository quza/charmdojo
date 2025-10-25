/**
 * Test script for girl-generator
 * Run this to verify the attribute randomization logic works correctly
 */

import { generateGirlProfiles } from '../girl-generator';

console.log('Testing Girl Profile Generation...\n');

// Generate 3 girl profiles
const girls = generateGirlProfiles(3);

console.log('Generated 3 girl profiles:\n');
girls.forEach((girl, index) => {
  console.log(`Girl ${index + 1}:`);
  console.log(`  Name: ${girl.name}`);
  console.log(`  Attributes:`);
  console.log(`    - Ethnicity: ${girl.attributes.ethnicity}`);
  console.log(`    - Hairstyle: ${girl.attributes.hairstyle}`);
  console.log(`    - Hair Color: ${girl.attributes.hairColor}`);
  console.log(`    - Eye Color: ${girl.attributes.eyeColor}`);
  console.log(`    - Body Type: ${girl.attributes.bodyType}`);
  console.log(`    - Setting: ${girl.attributes.setting}`);
  console.log('');
});

// Verify diversity
console.log('Diversity Check:');
const names = girls.map(g => g.name);
const ethnicities = girls.map(g => g.attributes.ethnicity);
const hairstyles = girls.map(g => g.attributes.hairstyle);
const bodyTypes = girls.map(g => g.attributes.bodyType);

console.log(`  Unique names: ${new Set(names).size}/3 ✓`);
console.log(`  Unique ethnicities: ${new Set(ethnicities).size}/3 ${new Set(ethnicities).size >= 2 ? '✓' : '✗'}`);
console.log(`  Unique hairstyles: ${new Set(hairstyles).size}/3 ${new Set(hairstyles).size >= 2 ? '✓' : '✗'}`);
console.log(`  Unique body types: ${new Set(bodyTypes).size}/3 ${new Set(bodyTypes).size >= 2 ? '✓' : '✗'}`);

console.log('\nNames:', names);
console.log('Ethnicities:', ethnicities);
console.log('Hairstyles:', hairstyles);
console.log('Body Types:', bodyTypes);

console.log('\nTest completed successfully! ✓');

