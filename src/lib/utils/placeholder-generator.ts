/**
 * Placeholder image generator for when AI image generation fails
 * Creates a simple colored PNG with the girl's name
 */

import type { GeneratedGirl } from '@/types/game';

/**
 * Generate a simple SVG placeholder image
 * @param girl - Girl profile data
 * @returns Buffer containing PNG image data
 */
export async function generatePlaceholderImage(
  girl: GeneratedGirl
): Promise<Buffer> {
  // Generate a deterministic color based on the girl's name
  const color = stringToColor(girl.name);
  
  // Create SVG with girl's name and basic info
  const svg = `
    <svg width="512" height="768" xmlns="http://www.w3.org/2000/svg">
      <rect width="512" height="768" fill="${color}"/>
      <text 
        x="256" 
        y="350" 
        font-family="Arial, sans-serif" 
        font-size="48" 
        font-weight="bold" 
        fill="white" 
        text-anchor="middle"
      >${girl.name}</text>
      <text 
        x="256" 
        y="400" 
        font-family="Arial, sans-serif" 
        font-size="20" 
        fill="rgba(255,255,255,0.8)" 
        text-anchor="middle"
      >Profile Image</text>
      <text 
        x="256" 
        y="430" 
        font-family="Arial, sans-serif" 
        font-size="16" 
        fill="rgba(255,255,255,0.6)" 
        text-anchor="middle"
      >${girl.attributes.ethnicity} • ${girl.attributes.hairColor} hair</text>
    </svg>
  `;

  // Convert SVG to Buffer
  // In a real implementation, you might use a library like 'sharp' or 'canvas'
  // For simplicity, we'll return the SVG as a buffer that can be saved as .svg
  // The client can render SVG directly, or we can add a proper image conversion library
  
  return Buffer.from(svg, 'utf-8');
}

/**
 * Generate a deterministic color from a string
 * @param str - Input string (e.g., girl's name)
 * @returns Hex color code
 */
function stringToColor(str: string): string {
  // Simple hash function to convert string to number
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convert hash to HSL color (varying hue, fixed saturation and lightness)
  const hue = Math.abs(hash % 360);
  const saturation = 60; // Pleasant saturation
  const lightness = 45; // Medium lightness
  
  return hslToHex(hue, saturation, lightness);
}

/**
 * Convert HSL to hex color
 */
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/**
 * Create a simple gradient placeholder (alternative implementation)
 */
export function generateGradientPlaceholder(girl: GeneratedGirl): Buffer {
  const color1 = stringToColor(girl.name);
  const color2 = stringToColor(girl.name + girl.attributes.ethnicity);
  
  const svg = `
    <svg width="512" height="768" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="512" height="768" fill="url(#grad)"/>
      <circle cx="256" cy="330" r="80" fill="rgba(255,255,255,0.2)"/>
      <text 
        x="256" 
        y="460" 
        font-family="Arial, sans-serif" 
        font-size="40" 
        font-weight="bold" 
        fill="white" 
        text-anchor="middle"
      >${girl.name}</text>
      <text 
        x="256" 
        y="500" 
        font-family="Arial, sans-serif" 
        font-size="18" 
        fill="rgba(255,255,255,0.9)" 
        text-anchor="middle"
      >${girl.attributes.ethnicity}</text>
    </svg>
  `;
  
  return Buffer.from(svg, 'utf-8');
}

