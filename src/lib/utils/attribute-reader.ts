/**
 * Utility functions for reading and parsing attribute data files
 */

import fs from 'fs';
import path from 'path';

/**
 * Read and parse an attribute list file
 * @param filename - Name of the file in src/data/
 * @returns Array of attribute values
 */
export function readAttributeList(filename: string): string[] {
  const filePath = path.join(process.cwd(), 'src', 'data', filename);
  const content = fs.readFileSync(filePath, 'utf-8');
  return content.split(',').map(item => item.trim());
}

/**
 * Get a random item from an array
 * @param array - Source array
 * @returns Random item from the array
 */
export function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get multiple random items from an array
 * @param array - Source array
 * @param count - Number of items to select
 * @param unique - Whether items should be unique (default: true)
 * @returns Array of random items
 */
export function getRandomItems<T>(array: T[], count: number, unique: boolean = true): T[] {
  if (!unique) {
    return Array.from({ length: count }, () => getRandomItem(array));
  }
  
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, array.length));
}

