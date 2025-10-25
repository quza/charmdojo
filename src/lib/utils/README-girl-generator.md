# Girl Profile Generation System

This module implements the attribute randomization logic for generating diverse AI girl profiles.

## Components

### 1. Type Definitions (`src/types/game.ts`)
- `GirlAttributes`: Interface for girl physical attributes
- `Girl`: Complete girl profile with image and description
- `GeneratedGirl`: Simplified girl profile for generation step

### 2. Attribute Reader (`src/lib/utils/attribute-reader.ts`)
Utility functions for reading and parsing attribute data files:
- `readAttributeList()`: Reads comma-separated attribute lists from files
- `getRandomItem()`: Selects a random item from an array
- `getRandomItems()`: Selects multiple random items with optional uniqueness

### 3. Girl Generator (`src/lib/utils/girl-generator.ts`)
Main generation logic with diversity enforcement:
- `generateGirlProfiles(count)`: Generates diverse girl profiles
- `clearAttributeCache()`: Clears cached attribute lists

## Usage

```typescript
import { generateGirlProfiles } from '@/lib/utils/girl-generator';

// Generate 3 diverse girl profiles
const girls = generateGirlProfiles(3);

// Each girl has:
// - name: Random unique name
// - attributes: {
//     ethnicity: string
//     hairColor: string
//     eyeColor: string
//     bodyType: string
//     hairstyle: string
//     setting: string
//   }
```

## Diversity Enforcement

The generator ensures visual diversity by:
1. **Names**: Always unique across all generated profiles
2. **Ethnicity**: Different for each girl (primary diversity factor)
3. **Hairstyle**: Different for each girl (visual variety)
4. **Body Type**: Different for each girl (physical diversity)
5. **Other attributes**: Fully randomized for variety

If fewer unique values are available than requested profiles, the algorithm falls back to random selection.

## Data Files

All attribute lists are stored in `src/data/`:
- `girl_names.txt` - 118 female names
- `ethnicity_list.txt` - 12 ethnicities
- `hairstyle_list.txt` - 20 hairstyles
- `haircolor_list.txt` - 17 hair colors
- `eyecolor_list.txt` - 11 eye colors
- `bodytype_list.txt` - 12 body types
- `setting_list.txt` - 21 settings/locations

## Testing

Run the test script to verify functionality:

```bash
npx tsx src/lib/utils/__tests__/test-girl-generator.ts
```

Expected output:
- 3 unique girl profiles
- Diversity verification showing 3/3 or 2/3 unique values for key attributes
- All attributes properly populated

## Next Steps

This module will be integrated with:
1. **Image Generation** (Step 3.4): Using attributes to generate AI images
2. **API Endpoint** (`POST /api/game/generate-girls`): Exposed for client use
3. **Girl Selection UI**: Display generated profiles to users

