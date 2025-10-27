# Reward Image Generation Retry Implementation

## Overview
This implementation adds retry logic for reward image generation when Google's Responsible AI content filter blocks an image, and displays a "Re-trying reward generation" message to the user during retries.

## Changes Made

### 1. Status Tracking System (`src/lib/services/reward-status.ts`)
- **New file** that provides in-memory status tracking for ongoing reward generations
- Stores status, messages, and retry attempt information
- Automatically cleans up old statuses (older than 10 minutes)
- Functions:
  - `setRewardStatus()` - Update the status of a reward generation
  - `getRewardStatus()` - Retrieve current status
  - `clearRewardStatus()` - Remove status entry
  - `cleanupOldStatuses()` - Periodic cleanup

### 2. Reward Service Updates (`src/lib/services/reward-service.ts`)
- **Enhanced `generateRewardImage()` function** with retry logic:
  - Up to 3 attempts for image generation
  - Detects content filtering errors specifically
  - Adds safety text to prompt on retry attempts
  - Implements exponential backoff between retries (1s, 2s)
  - Accepts optional `onRetry` callback for status updates

- **Updated `generateCompleteReward()` function**:
  - Sets initial status to 'generating'
  - Creates callback to notify status system on retry
  - Updates status to 'completed' or 'failed' at the end
  - Passes retry callback to `generateRewardImage()`

### 3. Status API Endpoint (`src/app/api/reward/status/route.ts`)
- **New GET endpoint** at `/api/reward/status?roundId=xxx`
- Allows frontend to poll for generation status updates
- Returns current status, message, and retry attempt information
- No authentication required (status data is non-sensitive)

### 4. Frontend Updates (`src/components/chat/VictoryOverlay.tsx`)
- **Added status polling**:
  - Polls `/api/reward/status` every 2 seconds during generation
  - Updates loading message based on status
  
- **Dynamic loading messages**:
  - "Generating reward..." - Initial state
  - "Re-trying reward generation" - When retry is in progress
  
- **State management**:
  - New `loadingMessage` state to track current message
  - Properly cleans up polling interval on unmount or completion

## How It Works

### Flow Diagram
```
1. User wins game
   ↓
2. VictoryOverlay calls /api/reward/generate
   ↓
3. Backend sets status: 'generating'
   ↓
4. Frontend starts polling /api/reward/status
   ↓
5. Image generation attempts:
   - Attempt 1: Content filtered → retry
   - Backend sets status: 'retrying'
   - Frontend updates message: "Re-trying reward generation"
   - Attempt 2: Success or fail
   ↓
6. Backend sets status: 'completed' or 'failed'
   ↓
7. Frontend stops polling and shows result
```

### Retry Strategy
When image generation fails due to content filtering:
1. Log the content filter reason
2. Wait with exponential backoff (1s, 2s)
3. Modify prompt to add safety guidelines
4. Retry generation
5. After 3 attempts, continue without image

### Frontend Experience
- **Normal generation**: Shows "Generating reward..."
- **During retry**: Shows "Re-trying reward generation"
- **After success**: Shows reward with image
- **After all retries fail**: Shows reward without image (graceful degradation)

## Benefits

1. **Better User Experience**
   - User knows when retries are happening
   - Clear feedback on generation status
   - No silent failures

2. **Higher Success Rate**
   - Multiple attempts increase chance of success
   - Modified prompts on retry may pass filters
   - Temporary API issues can be overcome

3. **Graceful Degradation**
   - System continues without image if all attempts fail
   - User still gets text and voice rewards
   - No complete failure due to image issues

4. **Debugging**
   - Status tracking helps diagnose issues
   - Retry logging shows patterns
   - Clear distinction between different error types

## Testing

### Manual Testing
1. Trigger a round win
2. Observe loading message changes
3. Check console logs for retry attempts
4. Verify final reward display

### Things to Monitor
- Content filtering frequency
- Retry success rate
- User experience during retries
- Performance impact of polling

## Configuration

### Retry Settings (in `reward-service.ts`)
```typescript
const maxAttempts = 3;  // Number of attempts
const delay = 1000 * attempt;  // Exponential backoff
```

### Polling Settings (in `VictoryOverlay.tsx`)
```typescript
const pollInterval = 2000;  // Poll every 2 seconds
```

### Status Cleanup (in `reward-status.ts`)
```typescript
const retention = 10 * 60 * 1000;  // Keep statuses for 10 minutes
const cleanupInterval = 5 * 60 * 1000;  // Cleanup every 5 minutes
```

## Future Enhancements

1. **Prompt Variation**
   - Try different prompt variations on each retry
   - Learn which prompts work better

2. **Retry Statistics**
   - Track retry rates and success patterns
   - Optimize retry strategy based on data

3. **Alternative Providers**
   - Fall back to different image generation service
   - Use cached images as fallback

4. **Real-time Status**
   - WebSocket or Server-Sent Events instead of polling
   - More immediate status updates

## Notes

- The in-memory status store is sufficient for single-instance deployments
- For multi-instance deployments, consider Redis or database storage
- Status polling adds minimal overhead (lightweight GET request every 2s)
- The retry logic only triggers for content filtering errors, not all errors

