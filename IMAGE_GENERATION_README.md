# Girl Image Generation System

Complete implementation of Step 3.4: Image Generation API Integration from the CharmDojo implementation plan.

## Overview

This system generates AI-powered girl profile images using Google Imagen 4 Fast, with automatic fallback to placeholder images when generation fails. Images are uploaded to Supabase Storage and served via public CDN URLs.

## Architecture

```
User Request
    ↓
POST /api/game/generate-girls
    ↓
Generate 3 girl profiles (attributes)
    ↓
For each girl (in parallel):
    ├─ Substitute prompt template with attributes
    ├─ Call Imagen API (with 3 retries)
    ├─ If success: Upload to Supabase Storage
    ├─ If fail: Generate placeholder → Upload
    └─ Return public URL
    ↓
Return Girl[] with imageUrls
```

## Components

### 1. Supabase Storage Setup
**File:** `supabase/migrations/002_storage_buckets.sql`

Creates the `girl-images` storage bucket with:
- Public read access (anyone can view images)
- Authenticated upload access (only logged-in users can upload)
- 5MB file size limit
- PNG/JPEG/WebP allowed

**To apply:**
```bash
npx supabase db push
# or manually run the SQL in Supabase SQL Editor
```

### 2. Storage Utilities
**File:** `src/lib/supabase/storage.ts`

Functions:
- `uploadGirlImage(buffer, filename)` - Upload image and get public URL
- `deleteGirlImage(filename)` - Remove image from storage
- `getPublicUrl(path)` - Get public URL for a stored image
- `generateImageFilename(girlName)` - Create unique filename

### 3. Prompt Substitution
**File:** `src/lib/utils/prompt-substitutor.ts`

Replaces placeholders in `girl_photo_prompt.md` with actual attributes:
- `<setting>` → "Coffee shop"
- `<ethnicity>` → "Asian"
- `<hairstyle>` → "Long wavy"
- `<haircolor>` → "Black"
- `<eyecolor>` → "Brown"
- `<bodytype>` → "Slim"

### 4. Placeholder Generator
**File:** `src/lib/utils/placeholder-generator.ts`

Creates SVG placeholder images when Imagen fails:
- Deterministic color based on girl's name
- Shows girl's name and key attributes
- 512x768 resolution matching Imagen output
- Fast generation (<100ms)

### 5. Image Generation Service
**File:** `src/lib/services/girl-image-service.ts`

Main orchestration layer:
- `generateGirlImage(girl)` - Generate single image with retry and fallback
- `generateMultipleGirlImages(girls)` - Generate multiple images in parallel
- Automatic retry with exponential backoff (3 attempts)
- Detailed logging for debugging

### 6. API Endpoint
**File:** `src/app/api/game/generate-girls/route.ts`

`POST /api/game/generate-girls`
- Requires authentication
- Rate limiting: 5 requests per minute per user
- Generates 3 girl profiles with images
- Returns Girl[] objects with public image URLs
- Handles errors gracefully

### 7. Type Definitions
**File:** `src/types/game.ts`

Updated with:
- `GenerateGirlsResponse` - API response structure
- `ImageGenerationError` - Error types
- `APIError` - Standard error response

### 8. Integration Test
**File:** `src/lib/services/test-girl-image-generation.ts`

End-to-end test that:
- Generates 3 girl profiles
- Creates images for each
- Uploads to Supabase Storage
- Verifies URLs are accessible
- Reports detailed statistics

**Run with:**
```bash
npm run test:girl-images
```

## Usage

### API Usage

```typescript
// Client-side API call
const response = await fetch('/api/game/generate-girls', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
});

const data: GenerateGirlsResponse = await response.json();

// data.girls = [
//   { id, name, imageUrl, attributes },
//   { id, name, imageUrl, attributes },
//   { id, name, imageUrl, attributes }
// ]
```

### Direct Service Usage

```typescript
import { generateGirlProfiles } from '@/lib/utils/girl-generator';
import { generateMultipleGirlImages } from '@/lib/services/girl-image-service';

// Generate profiles
const girls = generateGirlProfiles(3);

// Generate images
const results = await generateMultipleGirlImages(girls);

// results = [
//   { success: true, imageUrl: "https://...", usedPlaceholder: false, generationTime: 3.2 },
//   { success: true, imageUrl: "https://...", usedPlaceholder: false, generationTime: 2.8 },
//   { success: true, imageUrl: "https://...", usedPlaceholder: true, generationTime: 0.5 }
// ]
```

## Configuration

### Environment Variables

Required:
```bash
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Optional:
```bash
GOOGLE_CLOUD_LOCATION=europe-central2
IMAGEN_MODEL_ID=imagen-4.0-fast-generate-001
```

See `ENV_SETUP.md` for detailed setup instructions.

## Testing

### 1. Test Imagen API Connection
```bash
npm run test:imagen
```

Expected output:
- ✅ Image generated successfully
- ⏱️  Generation time: ~2-4 seconds
- 💾 Image saved to `test-imagen-output.png`

### 2. Test Complete Pipeline
```bash
npm run test:girl-images
```

Expected output:
- ✅ 3 girl profiles generated
- ✅ 3 images generated (or placeholders if Imagen unavailable)
- ✅ All URLs accessible
- 📄 Test report saved to `test-girl-images-report.json`

### 3. Test API Endpoint
```bash
# Start dev server
npm run dev

# In another terminal, test the endpoint
curl -X POST http://localhost:3000/api/game/generate-girls \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-<your-session-cookie>"
```

## Performance

### Benchmarks

**With Imagen 4 Fast:**
- Single image: ~2-4 seconds
- 3 images in parallel: ~5-8 seconds total
- Upload to Supabase: ~200-500ms per image

**With Placeholders (fallback):**
- Single placeholder: ~50-100ms
- 3 placeholders: ~200-300ms total

**API Response Times:**
- Successful generation: 6-10 seconds
- With placeholders: 1-2 seconds
- With failures: 10-15 seconds (includes retries)

### Optimization Tips

1. **Parallel Generation**: Images are generated in parallel using `Promise.all()`
2. **Caching**: Consider caching girl images for 1 hour to avoid regeneration
3. **CDN**: Supabase Storage serves images via CDN for fast global access
4. **Retry Logic**: Exponential backoff (2s, 4s, 8s) prevents rate limiting

## Error Handling

### Common Errors

#### "Missing GOOGLE_CLOUD_PROJECT_ID"
- Ensure `.env.local` has `GOOGLE_CLOUD_PROJECT_ID` set
- Restart dev server after adding

#### "Failed to obtain Google Cloud access token"
- Check `GOOGLE_APPLICATION_CREDENTIALS` points to valid JSON
- Verify service account has "Vertex AI User" role
- Ensure JSON file is not corrupted

#### "Error uploading image to Supabase"
- Verify Supabase credentials are correct
- Run `002_storage_buckets.sql` migration
- Check bucket exists in Supabase Dashboard → Storage

#### "Imagen API failed: 403"
- Enable Vertex AI API in Google Cloud Console
- Verify service account permissions
- Check project billing is enabled

### Graceful Degradation

The system handles failures gracefully:

1. **Imagen API timeout** → Retry with exponential backoff (3 attempts)
2. **All retries fail** → Generate placeholder image automatically
3. **Supabase upload fails** → Return error, allow retry
4. **Rate limit exceeded** → Return 429 with clear message

## Monitoring

### Logs

The system provides detailed logging:

```
🎨 Generating 3 girl images in parallel...

🎨 Generating image for Emma...
   Attributes: { ethnicity: 'Asian', ... }
   ✓ Prompt generated (1247 chars)
   ✓ Image generated via Imagen (127.45 KB)
   ✅ Complete for Emma (3.21s)

✅ Batch generation complete:
   Total time: 7.45s
   Success rate: 3/3
   Placeholders used: 0
```

### Metrics to Track

- **Success rate**: % of images generated successfully
- **Placeholder rate**: % of images that fell back to placeholders
- **Average generation time**: Per image and per batch
- **API response time**: Total time from request to response
- **Storage usage**: Total size of girl-images bucket

## Cost Analysis

### Per Generation (3 girls)

**Successful generation:**
- Imagen 4 Fast: 3 × $0.04 = **$0.12**
- Supabase Storage: ~0.4 MB × $0.021/GB = **~$0.000008**
- Total: **~$0.12 per generation**

**With placeholders (fallback):**
- Imagen failed, placeholder used: **$0** (free)
- Supabase Storage: ~0.02 MB × $0.021/GB = **~$0.0000004**
- Total: **~$0 per generation**

### Cost Optimization

1. **Cache images**: Store generated images for reuse (1 hour TTL)
2. **Use placeholders strategically**: For non-critical flows
3. **Batch requests**: Generate multiple profiles at once
4. **Monitor usage**: Set up billing alerts in Google Cloud

## Security

### Access Control

- **Storage bucket**: Public read, authenticated write
- **API endpoint**: Requires valid session token
- **Rate limiting**: Max 5 requests/minute per user
- **Service role**: Only server-side code has full access

### Content Safety

- **SFW prompts**: All prompts specify "Safe For Work" content
- **Google's filters**: Imagen has built-in safety filters
- **Review system**: Failed generations can be manually reviewed

## Next Steps

### Integration with UI (Phase 3 continued)

1. **Girl Selection Screen** (`src/app/(app)/game/selection/page.tsx`)
   - Call `/api/game/generate-girls` on page load
   - Display 3 girl cards with images
   - Handle loading states (shimmer placeholders)
   - Allow user to select one girl

2. **Girl Card Component** (`src/components/game/GirlCard.tsx`)
   - Display girl image
   - Show name and attributes
   - Clickable to select
   - Smooth hover effects

3. **Loading States**
   - Skeleton loading for images
   - Progress indicator showing "Generating profiles..."
   - Estimated time remaining

### Future Enhancements

- [ ] Image caching layer (Redis or database)
- [ ] Image variations (multiple images per girl)
- [ ] User preference-based generation
- [ ] NSFW filter with custom model
- [ ] Image quality options (standard vs HD)
- [ ] Batch cleanup of old unused images

## Troubleshooting

### Development Issues

**Images not appearing in browser:**
- Check browser console for CORS errors
- Verify image URLs are publicly accessible
- Ensure bucket policies allow public read

**Slow generation times:**
- Check Google Cloud region (use closest to users)
- Verify network connectivity
- Consider upgrading to Imagen 4 (non-Fast) for better quality

**High costs:**
- Implement caching to reuse images
- Use placeholders for testing
- Set daily spending limits in Google Cloud

### Production Issues

**Monitor these metrics:**
- API response times (target: <10s)
- Error rates (target: <1%)
- Placeholder usage (target: <10%)
- Storage costs (track monthly)

## Support

For issues or questions:
1. Check logs for detailed error messages
2. Run test scripts to diagnose issues
3. Review `ENV_SETUP.md` for configuration help
4. Check Google Cloud and Supabase dashboards for API status

## License

Part of CharmDojo project - Proprietary

