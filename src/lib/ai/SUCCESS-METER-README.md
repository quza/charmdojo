# Success Meter Calculation Module

**Location:** `src/lib/ai/success-meter.ts`  
**Purpose:** Independent message quality analysis and success delta calculation

## Overview

The success meter module provides message quality evaluation for CharmDojo's dating simulation game. It analyzes user messages and assigns a success delta (-8 to +8) based on conversation quality, engagement, humor, and other factors.

## Architecture

### Separation of Concerns

Previously, message evaluation and response generation were tightly coupled in `chat.ts`. The new architecture separates these responsibilities:

```
User Message → [1. Analyze Quality] → [2. Generate Response]
                    ↓                        ↓
               success-meter.ts            chat.ts
```

**Benefits:**
- ✅ Testable evaluation logic
- ✅ Reusable for analytics and debugging
- ✅ Clearer separation of concerns
- ✅ Easier to iterate on evaluation criteria

## Core Functions

### `analyzeMessageQuality(params)`

**Main entry point for message evaluation.**

```typescript
const analysis = await analyzeMessageQuality({
  userMessage: "Hey! I noticed you like hiking, ever done the Narrows?",
  conversationHistory: [...],
  context: {
    girlName: "Emma",
    girlPersona: "playful",
    currentMeter: 25,
    messageCount: 3,
  },
});

// Returns:
// {
//   delta: 5,
//   category: "good",
//   reasoning: "Shows attention to profile, asks specific interesting question..."
// }
```

**Parameters:**
- `userMessage` - The user's text message to evaluate
- `conversationHistory` - Array of previous messages (last 10 used for context)
- `context` - Conversation state (girl's name, persona, current meter, message count)

**Returns:** `MessageAnalysisResult`
- `delta` - Integer from -8 to +8
- `category` - One of: excellent, good, neutral, poor, bad
- `reasoning` - Brief explanation of the evaluation

### Utility Functions

#### `calculateNewMeter(currentMeter, delta)`
Calculate new meter value, clamped to 0-100 range.

```typescript
const newMeter = calculateNewMeter(50, 7); // Returns 57
const capped = calculateNewMeter(95, 8);   // Returns 100 (capped)
const floored = calculateNewMeter(3, -8);  // Returns 0 (floored)
```

#### `determineGameStatus(meter)`
Determine if the game should continue, end in victory, or defeat.

```typescript
determineGameStatus(100); // "won"
determineGameStatus(50);  // "active"
determineGameStatus(3);   // "lost"
```

#### `getCategoryFromDelta(delta)`
Map delta to message category (fallback function).

```typescript
getCategoryFromDelta(7);  // "excellent"
getCategoryFromDelta(0);  // "neutral"
getCategoryFromDelta(-6); // "bad"
```

#### `validateAnalysisResult(result)`
Validate and sanitize AI output.

```typescript
const validated = validateAnalysisResult({
  delta: 12,  // Will clamp to 8
  category: "invalid",  // Will fallback to correct category
  reasoning: "short",  // Will use default if too short
});
```

#### `validateUserMessage(message)`
Check if user message is valid before analysis.

```typescript
validateUserMessage("Hello!"); // null (valid)
validateUserMessage("");       // "Message cannot be empty"
validateUserMessage("a".repeat(600)); // "Message too long..."
```

#### `batchAnalyzeMessages(messages, context)`
Analyze multiple messages in sequence (useful for testing/analytics).

```typescript
const results = await batchAnalyzeMessages(
  ["hey", "What do you like to do?", "That sounds amazing!"],
  context
);
// Returns array of MessageAnalysisResult
```

## Evaluation Criteria

The AI evaluates messages based on:

1. **Engagement** - Does it invite continued conversation?
2. **Humor** - Witty, playful, or funny without being try-hard?
3. **Flirtation** - Appropriate romantic tension for the conversation stage?
4. **Respect** - Genuine interest without being creepy?
5. **Authenticity** - Feels genuine and personal, not copied?
6. **Confidence** - Self-assured without arrogance?

### Delta Ranges

| Delta | Category | Description | Example |
|-------|----------|-------------|---------|
| +6 to +8 | Excellent | Laugh out loud, impressive wit, perfect callbacks | "haha worth it though right? I'm convinced my calves are still traumatized from Half Dome" |
| +3 to +5 | Good | Interesting questions, playful teasing, shows personality | "I saw you're into hiking! Ever done the Narrows in Zion?" |
| +1 to +2 | Slightly Positive | Decent, keeps conversation flowing, appropriate | "That sounds really cool! How long have you been into hiking?" |
| 0 | Neutral | Acceptable but boring, generic questions | "That's cool. What else do you like to do?" |
| -1 to -2 | Slightly Negative | Somewhat boring, too many questions, awkward | "You're pretty. So what do you do? Do you like it?" |
| -3 to -5 | Poor | Try-hard, excessive compliments, cringy | "Wow you have the most beautiful eyes I've ever seen..." |
| -6 to -8 | Bad | Very boring, lazy, inappropriate, red flags | "k" or "hey beautiful, wyd tonight? 😏😏😏" |

**Note:** Offensive content triggers instant fail before reaching evaluation (handled by moderation.ts).

## Context Considerations

The evaluation adjusts based on:

### Conversation Stage
- **Early (1-3 messages):** More forgiving, rewards good openers
- **Mid (4-10 messages):** Expects personality, callbacks
- **Late (11+ messages):** Rewards vulnerability, escalation

### Current Meter
- **Low (<30%):** Slight improvements rewarded (recovery mode)
- **Medium (30-70%):** Standard evaluation
- **High (>70%):** Maintains high bar to reach 100%

### Girl's Persona
- **Playful/Witty:** Rewards humor and banter
- **Intellectual:** Rewards depth and observations
- **Adventurous:** Rewards spontaneity and boldness
- **Confident:** Less tolerant of try-hard behavior

### Message Context
- **Callbacks:** Referencing earlier topics = +1 to +3 bonus
- **Follow-up quality:** Building on her last response vs ignoring it
- **Escalation:** Is romantic escalation matching the vibe?

## Integration with Chat Generation

The refactored flow:

```typescript
// In chat.ts
export async function generateChatResponse(params) {
  // Step 1: Analyze message quality
  const analysis = await analyzeMessageQuality({
    userMessage: params.userMessage,
    conversationHistory: params.conversationHistory,
    context: {
      girlName: params.girlName,
      girlPersona: params.girlPersona,
      currentMeter: params.currentMeter,
      messageCount: params.conversationHistory.length / 2,
    },
  });

  // Step 2: Generate response informed by quality
  const systemPrompt = buildSystemPrompt(context, analysis.delta);
  const response = await openai.chat.completions.create({...});

  // Step 3: Return combined result
  return {
    response: aiResponse,
    successDelta: analysis.delta,
    category: analysis.category,
    reasoning: analysis.reasoning,
  };
}
```

## Testing

Run tests with:
```bash
npm test src/lib/ai/__tests__/success-meter.test.ts
```

### Test Coverage
- ✅ Delta clamping (-8 to +8)
- ✅ Meter calculations (0-100 bounds)
- ✅ Game status determination
- ✅ Category mapping
- ✅ Validation and sanitization
- ✅ Message validation
- ✅ Integration scenarios (winning/losing flows)

## Error Handling

The module includes robust error handling:

1. **API Failures:** Falls back to neutral evaluation (delta: 0)
2. **Invalid Responses:** Validates and sanitizes all AI output
3. **Timeout:** 30-second timeout on OpenAI calls
4. **Malformed Data:** Clamps deltas, validates categories, ensures reasoning

## Performance Considerations

- **Two API Calls:** One for evaluation, one for response generation
  - Evaluation: ~1-2 seconds, 200 tokens max
  - Response: ~1-2 seconds, 200 tokens max
  - **Total:** ~2-4 seconds per message exchange

- **Optimization Options:**
  - Could parallelize for faster response (trade-off: response won't know evaluation)
  - Current sequential approach ensures response matches evaluation

## Future Enhancements

Potential improvements:

1. **Caching:** Cache evaluations for identical messages
2. **Batch Processing:** Analyze multiple historical conversations
3. **Analytics:** Track delta distributions, category frequencies
4. **A/B Testing:** Experiment with different evaluation criteria
5. **User Feedback:** Allow users to rate evaluation accuracy
6. **Difficulty Modes:** Stricter evaluation for "hard mode"

## Example Usage

### Basic Evaluation

```typescript
import { analyzeMessageQuality } from '@/lib/ai/success-meter';

const result = await analyzeMessageQuality({
  userMessage: "I love hiking too! What's your favorite trail?",
  conversationHistory: [
    { role: "user", content: "Hey!" },
    { role: "assistant", content: "hey yourself" },
  ],
  context: {
    girlName: "Emma",
    girlPersona: "adventurous",
    currentMeter: 20,
    messageCount: 1,
  },
});

console.log(result);
// {
//   delta: 4,
//   category: "good",
//   reasoning: "Shows shared interest, asks engaging question..."
// }
```

### Batch Analysis

```typescript
const messages = [
  "hey",
  "What do you like to do?",
  "That's so cool! I love outdoor activities too",
];

const results = await batchAnalyzeMessages(messages, context);

results.forEach((result, i) => {
  console.log(`Message ${i + 1}: Delta ${result.delta}, Category: ${result.category}`);
});
```

## Debugging

Enable detailed logging:

```typescript
// The module logs analysis details automatically:
// 📊 Message Analysis: { delta: 5, category: 'good', messagePreview: '...', reasoning: '...' }
```

Check console output for:
- Delta values and categories
- Message previews (first 50 chars)
- Reasoning summaries (first 80 chars)

## Related Files

- **Prompt:** `src/prompts/success_delta_evaluation.md`
- **Types:** `src/types/chat.ts` (MessageAnalysisParams, MessageAnalysisResult)
- **Chat Generation:** `src/lib/ai/chat.ts`
- **API Route:** `src/app/api/chat/message/route.ts`
- **Tests:** `src/lib/ai/__tests__/success-meter.test.ts`

## Migration Notes

### Breaking Changes
None - backward compatibility maintained through re-exports in `chat.ts`.

### Deprecated
Nothing deprecated, but note that evaluation now happens separately from response generation.

### Updates Required
No updates required to existing code. The API route continues to work as before.

---

**Last Updated:** October 26, 2025  
**Version:** 1.0.0  
**Status:** Production Ready

