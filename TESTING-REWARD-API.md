# Testing Guide for Reward Generation API

## Prerequisites

Before testing, ensure:
1. ✅ Migration `003_reward_storage_buckets.sql` has been applied to Supabase
2. ✅ Environment variables are configured in `.env.local`
3. ✅ You have a won game round in the database

## Environment Variables Checklist

```bash
# Verify these are set in .env.local:
ELEVENLABS_API_KEY=sk_...
ELEVENLABS_VOICE_ID=cgSgspJ2msm6clMCkdW9
ELEVENLABS_MODEL_ID=eleven_v3
OPENAI_API_KEY=sk-...
GOOGLE_CLOUD_PROJECT_ID=...
GOOGLE_APPLICATION_CREDENTIALS=...
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Apply Database Migration

```bash
# If using Supabase CLI
supabase db push

# Or manually via SQL editor in Supabase Dashboard
# Copy/paste contents of supabase/migrations/003_reward_storage_buckets.sql
```

## Testing Steps

### 1. Create a Test Round (if needed)

First, ensure you have a won game round. You can create one via the database or through the app.

```sql
-- Check existing rounds
SELECT id, user_id, result, girl_name, girl_description 
FROM game_rounds 
WHERE result = 'win' 
LIMIT 5;

-- Or create a test round (replace USER_ID with your actual user ID)
INSERT INTO game_rounds (
  user_id,
  girl_name,
  girl_image_url,
  girl_description,
  girl_persona,
  initial_meter,
  final_meter,
  result,
  message_count
) VALUES (
  'YOUR_USER_ID',
  'Emma',
  'https://example.com/emma.jpg',
  'A beautiful young woman with long blonde hair, blue eyes, athletic build, and a confident smile. She has a fit physique and wears casual elegant clothing.',
  'playful',
  20,
  100,
  'win',
  15
) RETURNING id;
```

### 2. Test API Endpoint via Frontend

If you have the dev server running:

```bash
npm run dev
```

Then test via browser console or your frontend:

```javascript
// Get your auth token (check cookies or localStorage)
const roundId = 'YOUR_WON_ROUND_ID';

const response = await fetch('/api/reward/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ roundId }),
});

const result = await response.json();
console.log('Reward:', result);

// If successful, test audio playback
if (result.rewardVoiceUrl) {
  const audio = new Audio(result.rewardVoiceUrl);
  audio.play();
}

// Test image display
if (result.rewardImageUrl) {
  window.open(result.rewardImageUrl);
}
```

### 3. Test via curl

```bash
# Replace TOKEN and ROUND_ID with actual values
curl -X POST http://localhost:3000/api/reward/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=YOUR_TOKEN" \
  -d '{"roundId": "YOUR_ROUND_ID"}' \
  -v
```

### 4. Verify Database Storage

```sql
-- Check if reward was saved
SELECT * FROM rewards WHERE round_id = 'YOUR_ROUND_ID';

-- Should return:
-- id, round_id, reward_text, reward_voice_url, reward_image_url, generation_time, created_at
```

### 5. Verify Supabase Storage

Check in Supabase Dashboard:
1. Go to Storage
2. Open `reward-images` bucket → Should see generated image
3. Open `reward-audio` bucket → Should see generated MP3
4. Click file to get public URL and test access

## Expected Results

### Success Response (200)
```json
{
  "rewardText": "Mmm, you definitely know how to keep a girl interested... 😏",
  "rewardVoiceUrl": "https://[supabase]/storage/v1/object/public/reward-audio/reward_audio_xxx.mp3",
  "rewardImageUrl": "https://[supabase]/storage/v1/object/public/reward-images/reward_img_xxx.png",
  "generationTime": 28.4,
  "breakdown": {
    "textGeneration": 2.1,
    "voiceGeneration": 8.3,
    "imageGeneration": 18.0
  }
}
```

### Error Responses

**400 - Invalid Round ID**
```json
{
  "error": "invalid_round_id",
  "message": "Round ID must be a valid UUID"
}
```

**401 - Unauthorized**
```json
{
  "error": "unauthorized",
  "message": "Authentication required"
}
```

**403 - Round Not Won**
```json
{
  "error": "round_not_won",
  "message": "Rewards can only be generated for won rounds",
  "roundResult": "lose"
}
```

**404 - Round Not Found**
```json
{
  "error": "round_not_found",
  "message": "Round with ID 'xyz' not found"
}
```

**409 - Reward Already Exists**
```json
{
  "error": "reward_already_exists",
  "message": "Reward has already been generated for this round",
  "existingReward": {
    "rewardText": "...",
    "rewardVoiceUrl": "...",
    "rewardImageUrl": "...",
    "createdAt": "..."
  }
}
```

## Testing Checklist

- [ ] **Valid won round** → All 3 assets generated (text, voice, image)
- [ ] **Voice file plays correctly** → Audio is audible and sounds seductive
- [ ] **Image displays correctly** → Image loads and shows lingerie photo
- [ ] **Invalid round ID** → Returns 400 error
- [ ] **Non-existent round** → Returns 404 error
- [ ] **Lost round** → Returns 403 error (round_not_won)
- [ ] **Already-generated reward** → Returns 409 error
- [ ] **Unauthenticated request** → Returns 401 error
- [ ] **Database record created** → Reward saved to `rewards` table
- [ ] **Storage files accessible** → Public URLs work in browser
- [ ] **Generation time** → Completes in 25-35 seconds

## Troubleshooting

### Issue: "ELEVENLABS_API_KEY is not set"
**Solution**: Check `.env.local` has the correct key

### Issue: "GOOGLE_APPLICATION_CREDENTIALS is not set"
**Solution**: Ensure Google Cloud credentials are configured for Imagen

### Issue: Voice generation fails
**Solution**: 
- Check ElevenLabs API key is valid
- Check voice ID is correct (cgSgspJ2msm6clMCkdW9)
- Verify ElevenLabs account has credits

### Issue: Image generation fails
**Solution**:
- Check Google Cloud project ID
- Verify Imagen API is enabled
- Check service account has proper permissions

### Issue: Storage upload fails
**Solution**:
- Verify migration `003_reward_storage_buckets.sql` was applied
- Check Supabase service role key is correct
- Verify storage policies allow uploads

### Issue: 409 Reward Already Exists
**Solution**: This is expected behavior. Rewards can only be generated once per round.
To test again:
1. Delete existing reward: `DELETE FROM rewards WHERE round_id = 'YOUR_ROUND_ID';`
2. Or create a new won round

## Logs to Check

The API produces detailed console logs:

```
🎁 Starting complete reward generation for round xxx
================================================
💬 Generating reward text for Emma...
✅ Reward text generated: "Mmm, you definitely know how..."

🔄 Starting parallel generation (voice + image)...
🎤 Generating reward voice...
   Voice ID: cgSgspJ2msm6clMCkdW9
   Model: eleven_v3
   Text length: 45 chars
✅ Voice generated (125.45 KB)
🎤 Uploading reward audio: reward_audio_xxx.mp3
✅ Reward audio uploaded successfully

📸 Generating reward image...
🎨 Generating 1 image(s) with Imagen 4 Fast...
✅ Imagen API returned 1 prediction(s)
📸 Uploading reward image: reward_img_xxx.png
✅ Reward image uploaded successfully

================================================
✅ Complete reward generation finished
   Total time: 28.40s
   Text: 2.10s
   Voice: 8.30s (success)
   Image: 18.00s (success)
```

## Next Steps After Testing

Once all tests pass:
1. ✅ Mark testing todo as complete
2. Move to Phase 5.3-5.4: Build Victory Screen UI
3. Integrate reward display in frontend
4. Add audio player component
5. Implement "Keep Matching" flow



