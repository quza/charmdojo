# Chat Integration - Quick Reference

## Component Hierarchy

```
ChatPage (Server Component)
├── Fetches data from Supabase
│   ├── Round data (girl info, meter)
│   └── Message history
│
└── ChatInterface (Client Component)
    ├── Props: roundId, girl, initialMessages, initialMeter
    │
    ├── ChatHeader
    │   └── Displays girl name and image
    │
    ├── SuccessMeter
    │   ├── Shows current meter value (0-100%)
    │   ├── Animated progress bar
    │   ├── Color coding (red/yellow/green)
    │   └── Delta display (+X% / -X%)
    │
    ├── Messages Container
    │   ├── MessageBubble (for each message)
    │   ├── Loading indicator
    │   └── Error messages
    │
    ├── MessageInput
    │   └── Text input + send button
    │
    └── GameOverOverlay (conditional)
        └── Shows on loss condition
```

## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│  1. User sends message                                   │
│     "Hey! I saw you love hiking, any favorite trails?"   │
└─────────────────────────────┬───────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│  2. ChatInterface.tsx                                    │
│     - Adds message to UI (optimistic update)            │
│     - Calls POST /api/chat/message                      │
│     - Sends: roundId, message, conversationHistory      │
└─────────────────────────────┬───────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│  3. API Route: /api/chat/message/route.ts               │
│     - Validates request                                  │
│     - Checks authentication                              │
│     - Fetches round data from DB                         │
│     - Calls moderation API                               │
│     - Calls GPT-4 chat service                           │
└─────────────────────────────┬───────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│  4. GPT-4 (chat.ts)                                      │
│     - Loads ai_girl_instructions.md                      │
│     - Applies girl persona (name, personality)           │
│     - Analyzes message quality                           │
│     - Returns: response + delta + category + reasoning   │
└─────────────────────────────┬───────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│  5. API saves to database                                │
│     - User message → messages table                      │
│     - AI response → messages table                       │
│     - Updates game_rounds:                               │
│       * final_meter = 25                                 │
│       * message_count += 2                               │
└─────────────────────────────┬───────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│  6. Response sent back                                   │
│     {                                                    │
│       userMessage: {...},                                │
│       aiResponse: {                                      │
│         content: "omg yes! Did it last summer..."        │
│       },                                                 │
│       successMeter: {                                    │
│         previous: 20, delta: 5, current: 25              │
│       },                                                 │
│       gameStatus: "active"                               │
│     }                                                    │
└─────────────────────────────┬───────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│  7. ChatInterface updates UI                             │
│     - Replaces temp message with real one                │
│     - Adds AI response                                   │
│     - Animates meter: 20% → 25% (+5%)                    │
│     - Shows delta for 2 seconds                          │
│     - Checks game status                                 │
└─────────────────────────────────────────────────────────┘
```

## Success Meter States

```
┌──────────────────────────────────────┐
│  0-5%: LOSS CONDITION ⚠️              │
│  ├─ Color: RED                       │
│  ├─ Status: "Danger Zone!"           │
│  └─ Action: Show Game Over Overlay   │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  6-29%: LOW                          │
│  ├─ Color: RED                       │
│  ├─ Status: "Not looking good"       │
│  └─ Action: Continue game            │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  30-59%: MEDIUM                      │
│  ├─ Color: YELLOW                    │
│  ├─ Status: "Keep going"             │
│  └─ Action: Continue game            │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  60-79%: GOOD                        │
│  ├─ Color: YELLOW                    │
│  ├─ Status: "Good progress"          │
│  └─ Action: Continue game            │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  80-99%: GREAT                       │
│  ├─ Color: GREEN                     │
│  ├─ Status: "You're doing great!"    │
│  └─ Action: Continue game            │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  100%+: WIN CONDITION 🎉              │
│  ├─ Color: GREEN                     │
│  ├─ Status: "Victory!"               │
│  └─ Action: Navigate to victory      │
└──────────────────────────────────────┘
```

## API Endpoints Used

```
┌─────────────────────────────────────────────────┐
│  POST /api/chat/message                         │
├─────────────────────────────────────────────────┤
│  Purpose: Send user message, get AI response    │
│  Auth: Required (session cookie)                │
│  Rate Limit: Yes (backend)                      │
│  Returns: Message data + meter update + status  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Supabase: game_rounds table                    │
├─────────────────────────────────────────────────┤
│  Read: Round data, girl info, meter             │
│  Write: Update meter, message count, result     │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Supabase: messages table                       │
├─────────────────────────────────────────────────┤
│  Read: Conversation history                     │
│  Write: User messages + AI responses            │
└─────────────────────────────────────────────────┘
```

## Files Changed

```
src/
├── app/
│   └── (app)/
│       └── game/
│           └── chat/
│               └── [roundId]/
│                   └── page.tsx ✏️ MODIFIED
│                       - Made async (server component)
│                       - Fetches round data from DB
│                       - Passes real data to ChatInterface
│
└── components/
    └── chat/
        ├── ChatInterface.tsx ✏️ MODIFIED
        │   - Added roundId, initialMeter props
        │   - Replaced mock with real API call
        │   - Added success meter integration
        │   - Added win/loss handling
        │
        ├── SuccessMeter.tsx ✨ NEW
        │   - Animated progress bar
        │   - Color-coded display
        │   - Delta animations
        │
        └── GameOverOverlay.tsx ✨ NEW
            - Loss condition modal
            - Final meter display
            - Action buttons
```

## Testing Quick Commands

```bash
# Start dev server
npm run dev

# Test endpoints
curl -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_SESSION_COOKIE" \
  -d '{"roundId":"UUID","message":"Hey there!","conversationHistory":[]}'

# Check database
# Go to Supabase dashboard → Table Editor
# Tables: messages, game_rounds
```

## Common Issues & Solutions

**Issue**: "Round not found" error
**Solution**: Make sure you started a round from /game/selection first

**Issue**: Messages not appearing
**Solution**: Check browser console for API errors, verify authentication

**Issue**: Meter not updating
**Solution**: Check network tab, verify API response includes successMeter

**Issue**: Game doesn't end at 100%
**Solution**: Check gameStatus in API response, verify navigation logic

**Issue**: "Failed to send message"
**Solution**: Check API logs, verify OpenAI API key is set

## Next: Phase 5 - Reward System

When meter reaches 100%, user should be redirected to:
```
/game/victory/[roundId]
```

This page needs to be implemented to:
1. Generate reward text (GPT-4)
2. Generate reward voice (ElevenLabs)
3. Generate reward image (Imagen)
4. Display all rewards with animations
5. Play audio automatically
6. Show "Keep Matching" button

