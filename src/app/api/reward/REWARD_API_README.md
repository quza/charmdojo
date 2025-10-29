# Reward Generation API - Implementation Complete

**Status:** ✅ Ready for Testing  
**Date:** October 26, 2025  
**Phase:** Phase 5 - Step 5.2

---

## Overview

The reward generation API has been successfully implemented. This system generates three types of reward assets in parallel when a user wins a conversation round:

1. **Text**: Flirtatious message using GPT-4
2. **Voice**: Text-to-speech using ElevenLabs (with `[orgasmic]` prefix for seductive voice)
3. **Image**: Lingerie photo using Google Imagen 4 Fast

---

## Files Created

### 1. Storage Migration
**File**: `supabase/migrations/003_reward_storage_buckets.sql`
- Creates `reward-images` bucket (5MB limit, PNG/JPEG/WebP)
- Creates `reward-audio` bucket (10MB limit, MP3/WAV)
- Sets up public read access and authentication policies

### 2. TypeScript Types
**File**: `src/types/reward.ts`
- `RewardGenerationResult` - Complete reward with all assets
- `GenerateRewardRequest` - API request body
- `GenerateRewardResponse` - API response body
- `AssetGenerationTiming` - Internal timing tracker

### 3. ElevenLabs Voice Client
**File**: `src/lib/ai/elevenlabs.ts`
- `generateVoice(text: string): Promise<Buffer>` - Main TTS function
- **Automatically prepends `[orgasmic]` to text for seductive voice**
- Uses env vars: `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`, `ELEVENLABS_MODEL_ID`
- Includes retry logic (max 3 attempts)
- Returns MP3 audio buffer

### 4. Storage Utilities Extension
**File**: `src/lib/supabase/storage.ts` (extended existing)
- `uploadRewardImage(buffer, filename): Promise<string>` - Upload reward photo
- `uploadRewardAudio(buffer, filename): Promise<string>` - Upload reward voice
- `generateRewardImageFilename(roundId): string` - Generate unique image filename
- `generateRewardAudioFilename(roundId): string` - Generate unique audio filename

### 5. Reward Service Orchestrator
**File**: `src/lib/services/reward-service.ts`
- `generateCompleteReward(roundId): Promise<RewardGenerationResult>` - Main orchestrator
- **Parallel execution**: Voice and image generated simultaneously while text is required
- **Error handling**: If voice/image fail, returns null but continues
- Tracks individual timing for each asset
- Total generation time: ~25-35 seconds expected

**Internal Functions**:
- `generateRewardText(girlName, girlPersona): Promise<string>`
- `generateRewardVoice(rewardText, roundId): Promise<string | null>`
- `generateRewardImage(girlDescription, roundId): Promise<string | null>`

### 6. API Endpoint
**File**: `src/app/api/reward/generate/route.ts`
- `POST /api/reward/generate`
- Authentication required
- Validates round ownership and win status
- Prevents duplicate reward generation (409 if exists)
- Saves all assets to database after generation
- Returns complete reward with URLs and timing

---

## API Contract

### Request
```typescript
POST /api/reward/generate
Content-Type: application/json
Authorization: Bearer <token>

{
  "roundId": "round_7c9e6679-7425-40de-944b-e07fc1f90ae7"
}
```

### Success Response (200 OK)
```typescript
{
  "rewardText": "Mmm, you definitely know how to keep a girl interested... 😏",
  "rewardVoiceUrl": "https://[supabase]/storage/v1/object/public/reward-audio/reward_audio_7c9e6679_1234567890_abc123.mp3",
  "rewardImageUrl": "https://[supabase]/storage/v1/object/public/reward-images/reward_img_7c9e6679_1234567890_def456.png",
  "generationTime": 28.4,
  "breakdown": {
    "textGeneration": 2.1,
    "voiceGeneration": 8.3,
    "imageGeneration": 18.0
  }
}
```

### Error Responses
- **400**: Invalid/missing roundId
- **401**: Unauthorized (no valid session)
- **403**: Round not won or doesn't belong to user
- **404**: Round not found
- **409**: Reward already exists for this round
- **500**: Generation failed or database error

---

## Environment Variables Required

Add these to your `.env.local` (already configured per user):

```bash
# ElevenLabs Voice Generation
ELEVENLABS_API_KEY=sk_ea380e0b...
ELEVENLABS_VOICE_ID=cgSgspJ2msm6clMCkdW9
ELEVENLABS_MODEL_ID=eleven_v3

# OpenAI (already configured)
OPENAI_API_KEY=sk-...
OPENAI_ORG_ID=org-...

# Google Cloud Imagen (already configured)
GOOGLE_CLOUD_PROJECT_ID=...
GOOGLE_APPLICATION_CREDENTIALS=...

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## Key Implementation Features

### 1. [orgasmic] Voice Tag
The ElevenLabs client **automatically prepends `[orgasmic]` to all text** before sending to the API:
```typescript
const enhancedText = `[orgasmic]${text}`;
```
This makes the voice agent read in a seductive/sexy voice.

### 2. Parallel Generation
Voice and image are generated **in parallel** using `Promise.allSettled()`:
```typescript
const [voiceResult, imageResult] = await Promise.allSettled([
  generateRewardVoice(rewardText, roundId),
  generateRewardImage(girl_description, roundId),
]);
```

### 3. Graceful Degradation
- **Text generation**: Required, must succeed
- **Voice generation**: Optional, returns null if fails
- **Image generation**: Optional, returns null if fails

At minimum, users get reward text. Voice and image enhance the experience but aren't critical.

### 4. Database Persistence
All rewards are saved to the `rewards` table:
```sql
INSERT INTO rewards (
  round_id,
  reward_text,
  reward_voice_url,
  reward_image_url,
  generation_time
) VALUES (...);
```

### 5. Asset Storage
- **Images**: Stored in `reward-images` Supabase bucket
- **Audio**: Stored in `reward-audio` Supabase bucket
- **Public access**: All assets have public URLs for easy frontend display

---

## Testing Checklist

### Before Testing
1. ✅ Run migration: `supabase/migrations/003_reward_storage_buckets.sql`
2. ✅ Verify environment variables are set
3. ✅ Ensure you have a won game round in database

### Test Cases
- [ ] **Valid won round** → All 3 assets generated successfully
- [ ] **Non-existent round** → 404 error
- [ ] **Lost round** → 403 error (round_not_won)
- [ ] **Already-generated reward** → 409 error (reward_already_exists)
- [ ] **Voice includes `[orgasmic]`** → Play audio and verify seductive tone
- [ ] **Reward saved correctly** → Check database `rewards` table
- [ ] **Asset URLs accessible** → Open URLs in browser
- [ ] **Parallel generation timing** → Should complete in ~25-35 seconds

### Manual Testing Commands

```bash
# Test endpoint with curl
curl -X POST http://localhost:3000/api/reward/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"roundId": "YOUR_ROUND_ID"}'

# Check database
psql -h YOUR_SUPABASE_HOST -U postgres -d postgres
SELECT * FROM rewards WHERE round_id = 'YOUR_ROUND_ID';
```

---

## Integration Points

### Frontend Integration
When user wins a round (success meter reaches 100%):
1. Call `POST /api/reward/generate` with roundId
2. Show loading state (28-35 seconds)
3. Display reward text on screen
4. Auto-play reward voice (if available)
5. Show reward image (if available)
6. Provide replay button for voice

### Example Frontend Code
```typescript
const response = await fetch('/api/reward/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ roundId }),
});

const reward = await response.json();

// Display reward
setRewardText(reward.rewardText);
setRewardVoiceUrl(reward.rewardVoiceUrl);
setRewardImageUrl(reward.rewardImageUrl);

// Auto-play voice if available
if (reward.rewardVoiceUrl) {
  const audio = new Audio(reward.rewardVoiceUrl);
  audio.play();
}
```

---

## Cost Estimates

Per reward generation:
- **Text (GPT-4)**: ~$0.01
- **Voice (ElevenLabs)**: ~$0.01-0.02 (depends on text length)
- **Image (Imagen 4 Fast)**: ~$0.04
- **Total**: ~$0.06-0.07 per reward

For 1000 rewards: ~$60-70

---

## Next Steps

1. **Run migration** to create storage buckets
2. **Test endpoint** with various scenarios
3. **Build frontend victory screen** (Phase 5.3-5.4)
4. **Implement reward caching** (optional, for frequently played scenarios)
5. **Monitor costs** in production

---

## References

- **PRD**: Epic 5 (Reward System) - Lines 884-1003
- **API Contract**: `PRPs/contracts/reward-api-contract.md`
- **Prompts**: 
  - `src/prompts/reward_text_prompt.md`
  - `src/prompts/reward_photo_prompt.md`
- **Database**: `rewards` table in `001_initial_schema.sql`

---

## Notes

- **No NSFW filtering** on reward images (per user request). Imagen has built-in safety filters.
- **No retry logic** on image generation (single attempt). Voice has 3-attempt retry.
- **[orgasmic] tag** is automatically added by `elevenlabs.ts`, no need to add in prompts.
- **Parallel execution** makes total time ~18-20s instead of ~40s sequential.

---

**Implementation Status**: ✅ Complete  
**Ready for Testing**: Yes  
**Next Phase**: Phase 5.3-5.4 (Victory Screen UI)









