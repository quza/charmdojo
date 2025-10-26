# Chat API Implementation - Complete

## Overview

This implementation provides a complete AI-powered chat system for CharmDojo using GPT-4. It includes content moderation, success meter calculation, and full database persistence.

## Files Created

### 1. Core Services

#### `/src/lib/ai/moderation.ts`
Content moderation service using OpenAI Moderation API.

**Features:**
- Offensive content detection (harassment, hate speech, sexual content, violence)
- Gibberish detection using entropy analysis
- Empty message validation
- Configurable instant fail reasons

**Key Functions:**
```typescript
checkMessageSafety(message: string): Promise<ModerationResult>
shouldInstantFail(message: string): Promise<boolean>
```

#### `/src/lib/ai/chat.ts`
GPT-4 chat service with girl persona and success delta calculation.

**Features:**
- Loads `ai_girl_instructions.md` as system prompt
- Uses GPT-4 function calling for structured output
- Returns AI response + success delta + category + reasoning
- Context-aware (includes last 10 messages)
- Meter-adaptive responses (warmer at higher meters)

**Key Functions:**
```typescript
generateChatResponse(params: GenerateChatParams): Promise<ChatAIOutput>
calculateNewMeter(currentMeter: number, delta: number): number
determineGameStatus(meter: number): 'active' | 'won' | 'lost'
getCategoryFromDelta(delta: number): MessageCategory
```

### 2. Type Definitions

#### `/src/types/chat.ts`
TypeScript interfaces for chat system.

**Types:**
- `MessageCategory`: 'excellent' | 'good' | 'neutral' | 'poor' | 'bad'
- `GameStatus`: 'active' | 'won' | 'lost'
- `ChatMessage`: Message structure with id, content, timestamp, role
- `SuccessMeterUpdate`: Meter change details
- `ChatMessageRequest`: API request body
- `ChatMessageResponse`: API response body
- `ChatAIOutput`: GPT-4 structured output
- `GenerateChatParams`: Parameters for AI generation
- `ConversationContext`: Girl context for AI

### 3. API Endpoint

#### `/src/app/api/chat/message/route.ts`
POST endpoint for sending messages and receiving AI responses.

**Request:**
```json
{
  "roundId": "uuid",
  "message": "User's message text",
  "conversationHistory": [
    { "role": "user", "content": "...", "timestamp": "..." },
    { "role": "assistant", "content": "...", "timestamp": "..." }
  ]
}
```

**Response (200 OK):**
```json
{
  "userMessage": {
    "id": "uuid",
    "content": "User's message",
    "timestamp": "2025-10-26T12:00:00Z",
    "role": "user"
  },
  "aiResponse": {
    "id": "uuid",
    "content": "AI girl's response",
    "timestamp": "2025-10-26T12:00:01Z",
    "role": "assistant"
  },
  "successMeter": {
    "previous": 20,
    "delta": 5,
    "current": 25,
    "category": "good"
  },
  "gameStatus": "active"
}
```

**Response (403 Forbidden - Instant Fail):**
```json
{
  "userMessage": { ... },
  "aiResponse": {
    "id": "system",
    "content": "That was inappropriate. Game over.",
    "timestamp": "...",
    "role": "assistant"
  },
  "successMeter": {
    "previous": 25,
    "delta": -25,
    "current": 0,
    "category": "bad"
  },
  "gameStatus": "lost",
  "instantFail": true,
  "failReason": "Offensive content detected"
}
```

**Error Responses:**
- `400`: Invalid request (missing fields, empty message, message too long)
- `401`: Unauthorized (no session)
- `404`: Round not found
- `500`: Internal server error
- `503`: AI service unavailable

## Flow Diagram

```
User sends message
    ↓
1. Validate request (roundId, message)
    ↓
2. Authenticate user
    ↓
3. Fetch round data from database
    ↓
4. Check message safety (moderation)
    ↓
    ├─→ [UNSAFE] → Set meter to 0 → Save instant fail → Return 403
    ↓
5. Generate AI response with GPT-4
    ↓
6. Calculate new meter value
    ↓
7. Save user message to database
    ↓
8. Save AI response to database
    ↓
9. Update round (meter, message count)
    ↓
10. Check win/loss conditions
    ↓
    ├─→ [Meter ≥ 100] → Set result='win', completed_at
    ├─→ [Meter ≤ 5] → Set result='lose', completed_at
    └─→ [6-99] → Keep round active
    ↓
11. Return response to client
```

## Database Schema

### Tables Modified

**`messages` table:**
- Stores both user and AI messages
- User messages include: success_delta, meter_after, category, reasoning
- AI messages include: meter_after
- Instant fails flagged with: is_instant_fail=true, fail_reason

**`game_rounds` table:**
- `final_meter`: Updated after each message
- `message_count`: Incremented by 2 (user + AI)
- `result`: Set to 'win' or 'lose' when game ends
- `completed_at`: Timestamp when game ends

## Success Delta Calculation

GPT-4 analyzes user messages based on:

**Positive Factors (+):**
- Wit and humor
- Observational references to profile/conversation
- Open-ended questions showing interest
- Playful teasing
- Confidence without arrogance
- Authenticity and vulnerability
- Smooth flirtation

**Negative Factors (-):**
- Generic opening lines ("hey", "what's up")
- Excessive compliments (seeming desperate)
- Interview-style boring questions
- Try-hard pickup lines
- One-word responses
- Talking only about self
- Negativity or complaining

**Delta Ranges:**
- `+6 to +8`: Excellent (witty, creative, perfect callback)
- `+3 to +5`: Good (interesting, playful, shows personality)
- `+1 to +2`: Slightly positive (decent, keeps flow)
- `0`: Neutral (acceptable but boring)
- `-1 to -2`: Slightly negative (boring, awkward)
- `-3 to -5`: Poor (try-hard, excessive compliments, cringy)
- `-6 to -8`: Bad (very boring, inappropriate, red flags)
- **Instant 0%**: Offensive, sexual, harassment, gibberish

## Content Moderation

### OpenAI Moderation API
Checks for:
- Harassment and threatening language
- Hate speech
- Self-harm content
- Sexual content (explicit)
- Violence and graphic content

### Custom Gibberish Detection
Checks for:
- High character entropy (random characters)
- Excessive repeated characters (e.g., "aaaaaaaaaa")
- Keyboard mashing patterns (e.g., "asdfghjkl")
- Poor vowel-to-consonant ratio
- Excessive special characters

## Win/Loss Conditions

**Win Condition:**
- Success meter reaches ≥100%
- Meter capped at 100%
- Round marked as `result='win'`
- `completed_at` timestamp set
- Triggers reward generation (Phase 5)

**Loss Condition:**
- Success meter drops to ≤5%
- OR instant fail triggered by moderation
- Round marked as `result='lose'`
- `completed_at` timestamp set
- User sees "Game Over" screen

**Active State:**
- Meter between 6-99%
- User can continue conversation

## Testing

### Unit Tests
Run core function tests:
```bash
npx tsx src/app/api/chat/test-chat-functions.ts
```

Tests:
- ✓ Safe message moderation
- ✓ Gibberish detection
- ✓ Empty message handling
- ✓ Meter calculations (with bounds)
- ✓ Game status determination
- ✓ Category from delta mapping

### Integration Tests
See `TEST_SCENARIOS.md` for manual API testing scenarios.

Test checklist:
- [ ] Good message → positive delta
- [ ] Poor message → negative delta
- [ ] Excellent message → +6 to +8
- [ ] Bad message → -6 to -8
- [ ] Offensive content → instant fail
- [ ] Gibberish → instant fail
- [ ] Win condition (meter ≥100)
- [ ] Loss condition (meter ≤5)
- [ ] Database persistence
- [ ] Error handling

### Manual Testing
1. Start dev server: `npm run dev`
2. Navigate to `/game/selection` and start a round
3. Note the `roundId` from the URL
4. Use curl or Postman:

```bash
curl -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_SESSION_COOKIE" \
  -d '{
    "roundId": "YOUR_ROUND_ID",
    "message": "Hey! I noticed you love hiking, any favorite trails?",
    "conversationHistory": []
  }'
```

5. Verify response format and database updates

## Environment Variables

Required in `.env.local`:
```bash
OPENAI_API_KEY=sk-xxx
OPENAI_ORG_ID=org-xxx  # Optional
```

## Cost Estimates

Per message exchange:
- GPT-4 Turbo for chat: ~$0.01 per message
- OpenAI Moderation: Free
- Average conversation (15 messages): ~$0.15

## Next Steps

1. **Frontend Integration** (Phase 4.1-4.2)
   - Build chat UI component
   - Implement success meter visualization
   - Add typing indicators
   - Handle real-time updates

2. **Game State Management** (Phase 4.8)
   - Create Zustand store for game state
   - Handle conversation history
   - Manage meter animations

3. **Game Over Screens** (Phase 4.9)
   - Victory screen (triggers reward generation)
   - Defeat screen with retry option

4. **Reward System** (Phase 5)
   - Integrate reward generation
   - Display rewards on victory

## Known Limitations

1. **Rate Limiting**: Not yet implemented - should add rate limiting per user
2. **Retry Logic**: No automatic retry for AI failures (returns 503)
3. **Caching**: No caching of AI responses (could cache similar messages)
4. **Real-time**: Uses polling, not WebSockets (acceptable for MVP)
5. **Conversation History**: Client sends full history (could optimize with server-side storage)

## Troubleshooting

**Issue: "OPENAI_API_KEY not set"**
- Ensure `.env.local` has `OPENAI_API_KEY=sk-...`
- Restart dev server after adding env vars

**Issue: "Moderation API failed, allowing message through"**
- Non-critical warning
- Message allowed to proceed
- Check OpenAI API status and limits

**Issue: "GPT-4 did not return expected function call"**
- Rare GPT-4 response format issue
- Returns 503 error
- User can retry

**Issue: Meter calculation seems off**
- Check GPT-4 reasoning in database
- Verify `messages.reasoning` field
- Delta should be -8 to +8

**Issue: Game doesn't end at 100% or 5%**
- Check `determineGameStatus()` logic
- Verify database `final_meter` value
- Should be ≥100 for win, ≤5 for loss

## Files Reference

```
src/
├── lib/
│   └── ai/
│       ├── moderation.ts       # Content moderation
│       └── chat.ts             # GPT-4 chat service
├── types/
│   └── chat.ts                 # TypeScript interfaces
└── app/
    └── api/
        └── chat/
            ├── message/
            │   └── route.ts    # POST endpoint
            ├── TEST_SCENARIOS.md          # Manual test cases
            ├── test-chat-functions.ts     # Unit tests
            └── CHAT_API_README.md         # This file
```

## Implementation Status

✅ Step 4.3: AI chat API with GPT-4 and girl persona  
✅ Step 4.4: Success delta calculation logic  
✅ Step 4.5: Content moderation integration  
✅ Database persistence and game state management  
✅ Win/loss condition detection  
✅ Error handling and validation  
✅ Test scenarios and documentation

**Ready for:** Frontend integration (Phase 4.1-4.2, 4.6-4.9)



