/**
 * Girl profile generation with diversity enforcement
 * 
 * This module generates diverse girl profiles by randomly selecting attributes
 * from predefined lists while ensuring variety in key visual attributes.
 */

import { readAttributeList, getRandomItem } from './attribute-reader';
import type { GeneratedGirl, GirlAttributes } from '@/types/game';

interface AttributeLists {
  names: string[];
  ethnicities: string[];
  hairstyles: string[];
  hairColors: string[];
  eyeColors: string[];
  bodyTypes: string[];
  settings: string[];
}

let attributeCache: AttributeLists | null = null;

/**
 * Load attribute lists from data files
 * Caches results for performance on repeated calls
 */
function loadAttributeLists(): AttributeLists {
  if (attributeCache) {
    return attributeCache;
  }

  attributeCache = {
    names: readAttributeList('girl_names.txt'),
    ethnicities: readAttributeList('ethnicity_list.txt'),
    hairstyles: readAttributeList('hairstyle_list.txt'),
    hairColors: readAttributeList('haircolor_list.txt'),
    eyeColors: readAttributeList('eyecolor_list.txt'),
    bodyTypes: readAttributeList('bodytype_list.txt'),
    settings: readAttributeList('setting_list.txt'),
  };

  return attributeCache;
}

/**
 * Generate attributes for a single girl profile
 * Enforces diversity by tracking and avoiding recently used attributes
 * 
 * @param usedEthnicities - Set of ethnicities already used
 * @param usedHairstyles - Set of hairstyles already used
 * @param usedBodyTypes - Set of body types already used
 * @param lists - Attribute lists to select from
 * @returns Generated girl attributes
 */
function generateSingleGirlAttributes(
  usedEthnicities: Set<string>,
  usedHairstyles: Set<string>,
  usedBodyTypes: Set<string>,
  lists: AttributeLists
): GirlAttributes {
  // Select ethnicity (ensure diversity)
  const availableEthnicities = lists.ethnicities.filter(e => !usedEthnicities.has(e));
  const ethnicity = availableEthnicities.length > 0 
    ? getRandomItem(availableEthnicities)
    : getRandomItem(lists.ethnicities);
  usedEthnicities.add(ethnicity);

  // Select hairstyle (ensure diversity)
  const availableHairstyles = lists.hairstyles.filter(h => !usedHairstyles.has(h));
  const hairstyle = availableHairstyles.length > 0
    ? getRandomItem(availableHairstyles)
    : getRandomItem(lists.hairstyles);
  usedHairstyles.add(hairstyle);

  // Select body type (ensure diversity)
  const availableBodyTypes = lists.bodyTypes.filter(b => !usedBodyTypes.has(b));
  const bodyType = availableBodyTypes.length > 0
    ? getRandomItem(availableBodyTypes)
    : getRandomItem(lists.bodyTypes);
  usedBodyTypes.add(bodyType);

  // Other attributes can be fully random
  const hairColor = getRandomItem(lists.hairColors);
  const eyeColor = getRandomItem(lists.eyeColors);
  const setting = getRandomItem(lists.settings);

  return {
    ethnicity,
    hairColor,
    eyeColor,
    bodyType,
    hairstyle,
    setting,
  };
}

/**
 * Generate multiple diverse girl profiles
 * 
 * This function creates the specified number of girl profiles with randomized
 * attributes. It enforces diversity across key visual attributes (ethnicity,
 * hairstyle, body type) to ensure the generated profiles look distinct.
 * 
 * @param count - Number of girl profiles to generate (default: 3)
 * @returns Array of generated girl profiles
 * 
 * @example
 * ```typescript
 * const girls = generateGirlProfiles(3);
 * console.log(girls);
 * // Output: [
 * //   { name: "Emma", attributes: { ethnicity: "Asian", ... } },
 * //   { name: "Sophia", attributes: { ethnicity: "Hispanic/Latina", ... } },
 * //   { name: "Olivia", attributes: { ethnicity: "Caucasian", ... } }
 * // ]
 * ```
 */
export function generateGirlProfiles(count: number = 3): GeneratedGirl[] {
  const lists = loadAttributeLists();
  const usedNames = new Set<string>();
  const usedEthnicities = new Set<string>();
  const usedHairstyles = new Set<string>();
  const usedBodyTypes = new Set<string>();

  const girls: GeneratedGirl[] = [];

  for (let i = 0; i < count; i++) {
    // Select unique name
    const availableNames = lists.names.filter(n => !usedNames.has(n));
    const name = availableNames.length > 0
      ? getRandomItem(availableNames)
      : getRandomItem(lists.names);
    usedNames.add(name);

    // Generate diverse attributes
    const attributes = generateSingleGirlAttributes(
      usedEthnicities,
      usedHairstyles,
      usedBodyTypes,
      lists
    );

    girls.push({
      name,
      attributes,
    });
  }

  return girls;
}

/**
 * Clear the attribute cache
 * Useful for testing or forcing a reload of attribute lists
 */
export function clearAttributeCache(): void {
  attributeCache = null;
}

