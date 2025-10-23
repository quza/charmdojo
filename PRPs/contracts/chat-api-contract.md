# Chat API Contract

**Version:** 1.0  
**Last Updated:** October 23, 2025  
**Base URL:** `/api/chat`

---

## Overview

Chat simulation endpoints for sending messages, receiving AI responses, and managing conversation flow.

---

## Endpoints

### 1. Send Message

**Endpoint:** `POST /api/chat/message`  
**Purpose:** Send user message and receive AI girl response with success meter update  
**Authentication:** Required (Bearer token)

#### Request

```typescript
interface SendMessageRequest {
  roundId: string;                    // UUID, required
  message: string;                    // User's message, required
  conversationHistory: Message[];     // Previous messages for context
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;  // ISO 8601
}
```

**Validation Rules:**
- `roundId`: Required, valid UUID, round must exist and be active
- `message`: Required, min 1 char, max 500 chars, not just whitespace
- `conversationHistory`: Required array, max 20 messages (last 10 exchanges)

**Example Request:**
```json
{
  "roundId": "round_7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "message": "Hey! I noticed you're into hiking, any favorite trails?",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Hi there!",
      "timestamp": "2025-10-23T10:30:00Z"
    },
    {
      "role": "assistant",
      "content": "hey! 😊",
      "timestamp": "2025-10-23T10:30:02Z"
    }
  ]
}
```

#### Response (200 OK)

```typescript
interface SendMessageResponse {
  userMessage: {
    id: string;              // UUID
    content: string;
    timestamp: string;       // ISO 8601
  };
  aiResponse: {
    id: string;
    content: string;
    timestamp: string;
  };
  successMeter: {
    previous: number;        // 0-100
    delta: number;           // -8 to +8
    current: number;         // 0-100
    category: 'excellent' | 'good' | 'neutral' | 'poor' | 'bad';
  };
  gameStatus: 'active' | 'won' | 'lost';
  reasoning?: string;        // AI's explanation for delta (dev mode only)
}
```

**Example Response (Good Message):**
```json
{
  "userMessage": {
    "id": "msg_123e4567-e89b-12d3-a456-426614174000",
    "content": "Hey! I noticed you're into hiking, any favorite trails?",
    "timestamp": "2025-10-23T10:30:05Z"
  },
  "aiResponse": {
    "id": "msg_223e4567-e89b-12d3-a456-426614174001",
    "content": "omg yes! Did Eagle Peak last weekend, the views were insane 😍 You a hiker too?",
    "timestamp": "2025-10-23T10:30:08Z"
  },
  "successMeter": {
    "previous": 20,
    "delta": 6,
    "current": 26,
    "category": "good"
  },
  "gameStatus": "active"
}
```

**Example Response (Victory - Meter Reaches 100%):**
```json
{
  "userMessage": {
    "id": "msg_...",
    "content": "How about we continue this over coffee this weekend?",
    "timestamp": "2025-10-23T10:45:00Z"
  },
  "aiResponse": {
    "id": "msg_...",
    "content": "I'd love that! 😊 Here's my number...",
    "timestamp": "2025-10-23T10:45:03Z"
  },
  "successMeter": {
    "previous": 94,
    "delta": 6,
    "current": 100,
    "category": "excellent"
  },
  "gameStatus": "won"
}
```

#### Error Responses

**400 Bad Request - Validation Error**
```json
{
  "error": "validation_error",
  "message": "Invalid message data",
  "details": [
    {
      "field": "message",
      "message": "Message must be between 1 and 500 characters"
    }
  ],
  "timestamp": "2025-10-23T10:30:00Z"
}
```

**400 Bad Request - Empty Message**
```json
{
  "error": "empty_message",
  "message": "Message cannot be empty or only whitespace",
  "timestamp": "2025-10-23T10:30:00Z"
}
```

**403 Forbidden - Instant Fail (Offensive Content)**
```json
{
  "error": "instant_fail",
  "message": "Message contains offensive or inappropriate content",
  "reason": "offensive_language",
  "successMeter": {
    "previous": 45,
    "delta": -45,
    "current": 0,
    "category": "instant_fail"
  },
  "gameStatus": "lost",
  "timestamp": "2025-10-23T10:30:00Z"
}
```

**403 Forbidden - Instant Fail (Gibberish)**
```json
{
  "error": "instant_fail",
  "message": "Message appears to be nonsense or gibberish",
  "reason": "gibberish_detected",
  "successMeter": {
    "previous": 30,
    "delta": -30,
    "current": 0,
    "category": "instant_fail"
  },
  "gameStatus": "lost",
  "timestamp": "2025-10-23T10:30:00Z"
}
```

**404 Not Found - Round Not Found**
```json
{
  "error": "round_not_found",
  "message": "Round with ID 'xyz' not found or has already ended",
  "timestamp": "2025-10-23T10:30:00Z"
}
```

**409 Conflict - Round Already Completed**
```json
{
  "error": "round_already_completed",
  "message": "This round has already been completed",
  "result": "win",
  "completedAt": "2025-10-23T10:25:00Z",
  "timestamp": "2025-10-23T10:30:00Z"
}
```

**429 Too Many Requests**
```json
{
  "error": "rate_limit_exceeded",
  "message": "Too many messages sent. Please wait a moment.",
  "retry_after": 2,
  "timestamp": "2025-10-23T10:30:00Z"
}
```

**500 Internal Server Error - AI Service Failure**
```json
{
  "error": "ai_service_error",
  "message": "Failed to generate AI response. Please try again.",
  "timestamp": "2025-10-23T10:30:00Z"
}
```

**503 Service Unavailable - AI Service Down**
```json
{
  "error": "ai_service_unavailable",
  "message": "AI service is temporarily unavailable. Please try again later.",
  "timestamp": "2025-10-23T10:30:00Z"
}
```

---

### 2. Get Conversation History

**Endpoint:** `GET /api/chat/messages/{roundId}`  
**Purpose:** Retrieve full conversation history for a round  
**Authentication:** Required (Bearer token)

#### Request

**Path Parameters:**
- `roundId` (string, UUID): The round identifier

**Query Parameters:**
- `limit` (number, optional, default: 50, max: 100): Number of messages to retrieve
- `before` (string, optional, UUID): Get messages before this message ID (for pagination)

#### Response (200 OK)

```typescript
interface ConversationHistoryResponse {
  messages: MessageDetail[];
  pagination: {
    hasMore: boolean;
    nextCursor: string | null;  // UUID of last message for pagination
  };
  roundInfo: {
    id: string;
    girlName: string;
    currentMeter: number;
    status: 'active' | 'won' | 'lost' | 'abandoned';
  };
}

interface MessageDetail {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  successDelta: number | null;      // Only for user messages
  meterAfter: number | null;        // Meter value after this message
  category: string | null;          // Only for user messages
  timestamp: string;
  isInstantFail: boolean;
  failReason: string | null;
}
```

**Example Response:**
```json
{
  "messages": [
    {
      "id": "msg_001",
      "role": "user",
      "content": "Hey! I noticed you're into hiking",
      "successDelta": 5,
      "meterAfter": 25,
      "category": "good",
      "timestamp": "2025-10-23T10:30:00Z",
      "isInstantFail": false,
      "failReason": null
    },
    {
      "id": "msg_002",
      "role": "assistant",
      "content": "omg yes! I love hiking 😊",
      "successDelta": null,
      "meterAfter": 25,
      "category": null,
      "timestamp": "2025-10-23T10:30:03Z",
      "isInstantFail": false,
      "failReason": null
    }
  ],
  "pagination": {
    "hasMore": false,
    "nextCursor": null
  },
  "roundInfo": {
    "id": "round_7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "girlName": "Emma",
    "currentMeter": 25,
    "status": "active"
  }
}
```

#### Error Responses

**404 Not Found**
```json
{
  "error": "round_not_found",
  "message": "Round with ID 'xyz' not found",
  "timestamp": "2025-10-23T10:30:00Z"
}
```

**403 Forbidden - Not Owner**
```json
{
  "error": "forbidden",
  "message": "You don't have permission to access this conversation",
  "timestamp": "2025-10-23T10:30:00Z"
}
```

---

## Message Processing Flow

### 1. Content Moderation

**First Layer: OpenAI Moderation API**
- Check for offensive language
- Check for sexual content
- Check for hate speech
- Check for violence

**Second Layer: Gibberish Detection**
- Calculate entropy of message
- Check ratio of random characters
- Threshold: >70% random = instant fail

### 2. AI Response Generation

**Context Window:**
- Last 10 message pairs (20 messages total)
- Girl persona and description
- Current success meter value
- Conversation stage (early, mid, late)

**AI System Prompt Includes:**
- Girl personality traits
- Response guidelines (length, tone, emoji usage)
- Success delta calculation rules
- Conversation context awareness

**Response Generation:**
- Temperature: 0.8 (for variety)
- Max tokens: 100
- Stop sequences: None
- Stream: false

### 3. Success Delta Calculation

**AI Analyzes Message Based On:**
1. **Engagement** - Does it invite conversation?
2. **Humor** - Is it funny or witty?
3. **Flirtation** - Appropriate level of flirting?
4. **Authenticity** - Genuine or try-hard?
5. **Respect** - Is it respectful?
6. **Creativity** - Original or generic?

**Delta Categories:**
- `excellent`: +6 to +8
- `good`: +3 to +5
- `neutral`: -2 to +2
- `poor`: -3 to -5
- `bad`: -6 to -8
- `instant_fail`: Meter goes to 0

---

## Status Codes Summary

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful message sent, conversation retrieved |
| 400 | Bad Request | Invalid message, validation error |
| 401 | Unauthorized | Missing or invalid auth token |
| 403 | Forbidden | Instant fail (offensive/gibberish), not round owner |
| 404 | Not Found | Round not found |
| 409 | Conflict | Round already completed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | AI service failure |
| 503 | Service Unavailable | AI service down |

---

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `POST /message` | 60 requests | 1 minute per user |
| `GET /messages/{roundId}` | 30 requests | 1 minute per user |

**Note:** Prevents spam and rapid-fire message attempts.

---

## Integration Notes

### Backend Implementation

```typescript
// src/app/api/chat/message/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { moderateContent } from '@/lib/ai/moderation';
import { generateAIResponse } from '@/lib/ai/chat';
import { detectGibberish } from '@/lib/utils/gibberish';

export async function POST(request: Request) {
  const { roundId, message, conversationHistory } = await request.json();
  
  // 1. Validate input
  // 2. Authenticate user and verify round ownership
  // 3. Check if round is still active
  // 4. Moderate content (offensive check)
  // 5. Check for gibberish
  // 6. Generate AI response and calculate delta
  // 7. Update success meter
  // 8. Check win/loss conditions
  // 9. Save messages to database
  // 10. Return response
}
```

### Frontend Implementation

```typescript
// src/lib/api/chat.ts
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';

export const sendMessageSchema = z.object({
  roundId: z.string().uuid(),
  message: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(500, 'Message is too long')
    .refine((msg) => msg.trim().length > 0, 'Message cannot be only whitespace'),
  conversationHistory: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
      timestamp: z.string(),
    })
  ),
});

export type SendMessageRequest = z.infer<typeof sendMessageSchema>;

export function useSendMessage() {
  return useMutation({
    mutationFn: async (data: SendMessageRequest) => {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ChatError(error);
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Handle win/loss conditions
      if (data.gameStatus === 'won') {
        // Navigate to victory screen
      } else if (data.gameStatus === 'lost') {
        // Navigate to game over screen
      }
    },
  });
}
```

### UI Implementation Notes

**Optimistic Updates:**
- Show user message immediately in UI
- Show typing indicator while waiting for AI
- Update UI when response arrives
- Animate success meter changes

**Error Handling:**
- Show inline error for validation failures
- Show modal for instant fail with explanation
- Allow retry for network errors
- Graceful degradation for AI service failures

---

## Success Meter Edge Cases

### Meter Calculation Rules

1. **Meter cannot go below 0:**
   ```typescript
   newMeter = Math.max(0, currentMeter + delta);
   ```

2. **Meter cannot exceed 100:**
   ```typescript
   newMeter = Math.min(100, currentMeter + delta);
   ```

3. **Instant fail always goes to 0:**
   ```typescript
   if (isOffensive || isGibberish) {
     newMeter = 0;
     gameStatus = 'lost';
   }
   ```

4. **Win at exactly 100:**
   ```typescript
   if (newMeter >= 100) {
     newMeter = 100;
     gameStatus = 'won';
   }
   ```

5. **Loss at or below 5:**
   ```typescript
   if (newMeter <= 5) {
     gameStatus = 'lost';
   }
   ```

---

## Testing Checklist

### Happy Path
- [ ] Send valid message, receive AI response
- [ ] Success meter updates correctly
- [ ] Conversation history persists
- [ ] Win condition triggers at 100%
- [ ] Game transitions to victory screen

### Validation
- [ ] Empty message rejected (400)
- [ ] Message >500 chars rejected (400)
- [ ] Invalid roundId rejected (400)
- [ ] Whitespace-only message rejected (400)

### Content Moderation
- [ ] Offensive language triggers instant fail (403)
- [ ] Gibberish triggers instant fail (403)
- [ ] Mild profanity doesn't instant fail (context-dependent)
- [ ] Foreign languages don't trigger gibberish detection

### Game Logic
- [ ] Loss condition triggers at ≤5% (not 0%)
- [ ] Meter cannot go below 0
- [ ] Meter cannot go above 100
- [ ] Messages to completed round rejected (409)
- [ ] Success delta ranges from -8 to +8

### Performance
- [ ] AI response within 3 seconds average
- [ ] AI response timeout at 10 seconds
- [ ] Rate limiting triggers at 60 requests/min
- [ ] Graceful fallback if AI service down

### Edge Cases
- [ ] Rapid message sending handled correctly
- [ ] Very long conversation history (20+ messages)
- [ ] Special characters in messages
- [ ] Emoji-only messages
- [ ] Messages with URLs
- [ ] Messages with profanity in non-offensive context

