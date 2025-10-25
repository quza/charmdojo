/**
 * Prompt substitution utility for girl photo generation
 * Replaces placeholders in prompt templates with actual attribute values
 */

import fs from 'fs';
import path from 'path';
import type { GirlAttributes } from '@/types/game';

/**
 * Read the girl photo prompt template
 * @returns Raw prompt template content
 */
function readPromptTemplate(): string {
  const promptPath = path.join(
    process.cwd(),
    'src',
    'prompts',
    'girl_photo_prompt.md'
  );
  
  return fs.readFileSync(promptPath, 'utf-8');
}

/**
 * Substitute placeholders in girl photo prompt with actual attributes
 * 
 * Replaces:
 * - <setting> with attributes.setting
 * - <ethnicity> with attributes.ethnicity
 * - <hairstyle> with attributes.hairstyle
 * - <haircolor> with attributes.hairColor
 * - <eyecolor> with attributes.eyeColor
 * - <bodytype> with attributes.bodyType
 * 
 * @param attributes - Girl attributes to substitute
 * @returns Prompt with all placeholders replaced
 */
export function substituteGirlPrompt(attributes: GirlAttributes): string {
  const template = readPromptTemplate();
  
  const substitutions: Record<string, string> = {
    '<setting>': attributes.setting,
    '<ethnicity>': attributes.ethnicity,
    '<hairstyle>': attributes.hairstyle,
    '<haircolor>': attributes.hairColor,
    '<eyecolor>': attributes.eyeColor,
    '<bodytype>': attributes.bodyType,
  };

  let prompt = template;
  
  // Replace all placeholders
  for (const [placeholder, value] of Object.entries(substitutions)) {
    prompt = prompt.replace(new RegExp(placeholder, 'g'), value);
  }

  return prompt;
}

/**
 * Validate that all placeholders have been replaced
 * @param prompt - Prompt to validate
 * @returns True if valid (no placeholders remain)
 */
export function validatePrompt(prompt: string): boolean {
  const placeholderPattern = /<[a-z]+>/g;
  const remainingPlaceholders = prompt.match(placeholderPattern);
  
  if (remainingPlaceholders) {
    console.warn('⚠️ Unreplaced placeholders found:', remainingPlaceholders);
    return false;
  }
  
  return true;
}

