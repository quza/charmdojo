/**
 * Fallback Image Handler
 * 
 * Manages local fallback images when AI generation and Supabase pool fail
 * Provides functions to randomly select unique images from the fallback directory
 */

import fs from 'fs';
import path from 'path';

const FALLBACK_DIR = path.join(process.cwd(), 'public', 'fallback-images', 'fallback-girls');

/**
 * Get list of all fallback image filenames
 */
export function getFallbackImageFiles(): string[] {
  try {
    const files = fs.readdirSync(FALLBACK_DIR);
    return files.filter(file => file.match(/\.(png|jpg|jpeg|webp)$/i));
  } catch (error) {
    console.error('❌ Error reading fallback directory:', error);
    return [];
  }
}

/**
 * Get N random unique fallback image URLs
 * Ensures no duplicate images in the selection
 * 
 * @param count - Number of unique images to select (default: 3)
 * @returns Array of public URLs for the selected images
 */
export function getRandomFallbackImages(count: number = 3): string[] {
  const files = getFallbackImageFiles();
  
  if (files.length === 0) {
    console.error('❌ No fallback images found in directory!');
    return [];
  }
  
  // Shuffle array using Fisher-Yates algorithm to ensure randomness
  const shuffled = [...files];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // Take first N unique images
  const selected = shuffled.slice(0, Math.min(count, files.length));
  
  // Return public URLs
  return selected.map(file => `/fallback-images/fallback-girls/${file}`);
}

/**
 * Extract girl name from fallback filename
 * Format: "sophia_1761428755603_mfsv0gjnll.png" -> "Sophia"
 * 
 * @param filename - The fallback image filename
 * @returns Capitalized girl name
 */
export function getNameFromFallbackFile(filename: string): string {
  // Remove path if provided
  const baseName = filename.split('/').pop() || filename;
  
  // Extract first part before underscore
  const namepart = baseName.split('_')[0];
  
  // Capitalize first letter
  return namepart.charAt(0).toUpperCase() + namepart.slice(1).toLowerCase();
}

/**
 * Verify fallback directory exists and contains images
 * 
 * @returns true if directory exists and has images
 */
export function verifyFallbackDirectory(): boolean {
  try {
    const files = getFallbackImageFiles();
    
    if (files.length === 0) {
      console.error('⚠️ Fallback directory exists but contains no images');
      return false;
    }
    
    console.log(`✓ Fallback directory verified: ${files.length} images available`);
    return true;
  } catch (error) {
    console.error('❌ Fallback directory not accessible:', error);
    return false;
  }
}

/**
 * Get count of available fallback images
 */
export function getFallbackImageCount(): number {
  return getFallbackImageFiles().length;
}

