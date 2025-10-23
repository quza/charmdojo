# CharmDojo API Contracts - Master Index

**Version:** 1.0  
**Last Updated:** October 23, 2025  
**Status:** Ready for Implementation

---

## Overview

This directory contains comprehensive API contracts for the CharmDojo application. These contracts define the interface between the frontend (Next.js/React) and backend (Next.js API Routes + Supabase) for all major features.

---

## Contract Documents

### 1. [Authentication API](./auth-api-contract.md)
**Endpoints:** 7 endpoints  
**Base URL:** `/api/auth`

**Key Features:**
- Email signup and signin
- OAuth integration (Google, Facebook)
- Password reset flow
- Session management
- Token refresh

**Critical Endpoints:**
- `POST /signup` - Create new user account
- `POST /signin` - Authenticate user
- `POST /oauth` - Initiate OAuth flow
- `POST /reset-password` - Request password reset

---

### 2. [Game API](./game-api-contract.md)
**Endpoints:** 6 endpoints  
**Base URL:** `/api/game`

**Key Features:**
- AI girl profile generation (3 profiles with images)
- Round initialization with Vision AI descriptions
- Round completion and statistics
- Game history with pagination
- Free tier limit enforcement

**Critical Endpoints:**
- `POST /generate-girls` - Generate 3 AI girl profiles
- `POST /start-round` - Initialize conversation round
- `POST /complete-round` - Finalize round and update stats
- `GET /rounds` - Retrieve game history

**Business Logic:**
- Free tier: 5 rounds/day
- Premium tier: Unlimited rounds
- Success meter: 0-100%, starts at 20%

---

### 3. [Chat API](./chat-api-contract.md)
**Endpoints:** 2 endpoints  
**Base URL:** `/api/chat`

**Key Features:**
- Send user messages and receive AI responses
- Real-time success meter updates (-8 to +8 delta)
- Content moderation (offensive language detection)
- Gibberish detection and instant fail
- Win/loss condition detection

**Critical Endpoints:**
- `POST /message` - Send message, get AI response, update meter
- `GET /messages/{roundId}` - Retrieve conversation history

**Game Mechanics:**
- Win: Success meter ≥ 100%
- Loss: Success meter ≤ 5%
- Instant fail: Offensive content or gibberish → meter = 0%

---

### 4. [Reward API](./reward-api-contract.md)
**Endpoints:** 3 endpoints  
**Base URL:** `/api/reward`

**Key Features:**
- Generate reward text (flirtatious message)
- Generate reward voice (seductive female voice)
- Generate reward image (lingerie photo, SFW)
- Parallel asset generation for speed
- NSFW filtering and fallback handling

**Critical Endpoints:**
- `POST /generate` - Generate all reward assets (text, voice, image)
- `GET /{roundId}` - Retrieve existing reward
- `POST /regenerate` - Regenerate specific asset (premium only)

**Generation Pipeline:**
- Text: GPT-4 Turbo (~2-3s)
- Voice: ElevenLabs/PlayHT (~8-10s)
- Image: Google Imagen 4 Fast (~15-20s)
- **Total:** ~25-33 seconds

**Cost per reward:** ~$0.06 (premium) / ~$0.053 (free tier)

---

### 5. [User API](./user-api-contract.md)
**Endpoints:** 6 endpoints  
**Base URL:** `/api/user`

**Key Features:**
- Profile management (name, avatar)
- Comprehensive game statistics
- Win rate and streak tracking
- Daily usage limits (free tier)
- Achievement system
- Account deletion

**Critical Endpoints:**
- `GET /profile` - Get user profile
- `PATCH /profile` - Update profile
- `GET /stats` - Get game statistics
- `GET /limits` - Check daily usage limits
- `GET /achievements` - View achievements

**Key Metrics:**
- Win rate, current/best streak
- Average messages to win/loss
- Favorite girl ethnicity
- Total rounds, wins, losses

---

### 6. [Subscription API](./subscription-api-contract.md)
**Endpoints:** 6 endpoints  
**Base URL:** `/api/subscription`

**Key Features:**
- Stripe Checkout integration
- Subscription status management
- Customer Portal for self-service
- Webhook handling for subscription lifecycle
- Cancel and reactivate subscriptions

**Critical Endpoints:**
- `POST /create-checkout` - Create Stripe Checkout session
- `GET /status` - Get subscription status
- `POST /create-portal` - Create Customer Portal session
- `POST /cancel` - Cancel subscription
- `POST /webhook` - Handle Stripe webhook events

**Pricing:**
- Monthly: $19.99/month
- Yearly: $179.99/year (save $60, 25% off)

**Webhook Events Handled:**
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

---

## Global Standards

### Authentication

**Method:** Bearer token (Supabase Auth)

**Header Format:**
```
Authorization: Bearer <access_token>
```

**Token Lifecycle:**
- Access token: 1 hour expiry
- Refresh token: 7 days expiry
- Automatic refresh on frontend

---

### Request/Response Format

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "field": "value",
  "nestedObject": {
    "key": "value"
  }
}
```

**Success Response:**
```json
{
  "data": { ... },
  "message": "Success message"
}
```

**Error Response:**
```json
{
  "error": "error_code",
  "message": "Human-readable error message",
  "details": [...],  // Optional: validation errors
  "timestamp": "2025-10-23T10:30:00Z"
}
```

---

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH, DELETE |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Validation error, invalid input |
| 401 | Unauthorized | Missing or invalid auth token |
| 402 | Payment Required | Free tier limit reached |
| 403 | Forbidden | Insufficient permissions, content policy violation |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists, state conflict |
| 413 | Payload Too Large | File upload exceeds size limit |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |
| 503 | Service Unavailable | External service (AI) unavailable |
| 504 | Gateway Timeout | Request timeout (typically AI generation) |

---

### Error Handling

**Validation Errors (400):**
```json
{
  "error": "validation_error",
  "message": "Invalid input data",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ],
  "timestamp": "2025-10-23T10:30:00Z"
}
```

**Rate Limit Errors (429):**
```json
{
  "error": "rate_limit_exceeded",
  "message": "Too many requests",
  "retry_after": 60,
  "limit": 10,
  "used": 10,
  "reset_at": "2025-10-23T10:31:00Z",
  "timestamp": "2025-10-23T10:30:00Z"
}
```

**Free Tier Limit (402):**
```json
{
  "error": "free_tier_limit_reached",
  "message": "You've reached your daily limit of 5 rounds",
  "limit": 5,
  "used": 5,
  "reset_at": "2025-10-24T00:00:00Z",
  "upgrade_url": "/pricing",
  "timestamp": "2025-10-23T10:30:00Z"
}
```

---

### Rate Limiting

**Global Limits:**
- Anonymous: 100 requests/15 minutes per IP
- Authenticated: 1000 requests/15 minutes per user

**Endpoint-Specific Limits:** See individual contract documents

**Rate Limit Headers:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1698067200
```

---

### CORS Configuration

**Allowed Origins:**
- Production: `https://charmdojo.com`
- Development: `http://localhost:3000`

**Allowed Methods:**
- GET, POST, PATCH, DELETE, OPTIONS

**Allowed Headers:**
- Content-Type, Authorization

**Credentials:** Included (cookies for Supabase Auth)

---

## Data Models

### Common Types

**Timestamps:**
- Format: ISO 8601 (UTC)
- Example: `"2025-10-23T10:30:00Z"`

**UUIDs:**
- Format: UUID v4
- Example: `"550e8400-e29b-41d4-a716-446655440000"`

**Pagination:**
```typescript
interface PaginationParams {
  page: number;      // 1-indexed
  size: number;      // Default: 10, Max: 50
  sort?: string;     // Format: "field,direction" e.g., "createdAt,desc"
}

interface PaginationResponse {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
```

---

## Security Considerations

### 1. Authentication
- All protected endpoints require valid Bearer token
- Tokens auto-refresh on frontend before expiry
- Rate limiting on auth endpoints to prevent brute force

### 2. Content Safety
- OpenAI Moderation API on all user messages
- NSFW filtering on generated images (Google's built-in filters)
- Gibberish detection (entropy analysis + character ratio)
- Instant fail for offensive content

### 3. Data Privacy
- Row Level Security (RLS) on all Supabase tables
- Users can only access their own data
- No PII exposed in error messages

### 4. Payment Security
- Stripe handles all payment processing (PCI compliant)
- Webhook signature verification required
- No credit card data stored in database

### 5. API Security
- CORS restricted to allowed origins
- CSRF protection via SameSite cookies
- Input validation on all endpoints
- SQL injection prevention via Supabase client

---

## Testing Guidelines

### Unit Tests
- Test validation logic for all DTOs
- Test error handling for each endpoint
- Test business logic (meter calculation, streak tracking)

### Integration Tests
- Test full user flows (signup → game → win → reward)
- Test webhook processing end-to-end
- Test free tier limits enforcement

### E2E Tests
- Test complete game round (selection → chat → victory)
- Test subscription flow (checkout → webhook → access)
- Test error scenarios (network failures, AI service down)

### Performance Tests
- Load test chat endpoint (60 req/min per user)
- Stress test girl generation (parallel image generation)
- Measure reward generation time (target <35s)

---

## Deployment Checklist

### Environment Variables
- [ ] All Supabase credentials configured
- [ ] OpenAI API key set
- [ ] Google Cloud (Imagen) credentials configured
- [ ] ElevenLabs/PlayHT API keys set
- [ ] Stripe keys (secret, publishable, webhook secret)
- [ ] App URL set correctly

### Database
- [ ] All tables created with RLS policies
- [ ] Indexes created for performance
- [ ] Triggers set up (user stats update)
- [ ] Storage buckets configured (avatars, girls, rewards)

### External Services
- [ ] Stripe products and prices created
- [ ] Stripe webhook endpoint configured
- [ ] OAuth providers configured (Google, Facebook)
- [ ] Email templates set up (password reset, etc.)

### Monitoring
- [ ] Error tracking (Sentry) configured
- [ ] Analytics (PostHog) events set up
- [ ] API performance monitoring
- [ ] AI generation cost tracking
- [ ] Rate limit monitoring

---

## API Evolution

### Versioning Strategy
- Current version: v1 (implicit, no version in URL)
- Future versions: `/api/v2/...` when breaking changes needed
- Backward compatibility maintained for 6 months

### Deprecation Process
1. Announce deprecation with 3-month notice
2. Add deprecation headers to responses
3. Provide migration guide
4. Remove deprecated endpoints after 6 months

---

## Support & Maintenance

**Documentation Owner:** Backend Team  
**Review Frequency:** Monthly or when adding new features  
**Change Request Process:** PR to this repository  

**Contact:**
- Technical Questions: #backend-dev (Slack)
- Contract Issues: Open GitHub issue
- Emergency: @backend-on-call

---

## Appendix: Quick Reference

### Base URLs by Environment

| Environment | Base URL |
|-------------|----------|
| Production | `https://charmdojo.com/api` |
| Staging | `https://staging.charmdojo.com/api` |
| Development | `http://localhost:3000/api` |

### Stripe Price IDs

| Plan | Environment | Price ID |
|------|-------------|----------|
| Monthly | Test | `price_test_monthly` |
| Monthly | Live | `price_live_monthly` |
| Yearly | Test | `price_test_yearly` |
| Yearly | Live | `price_live_yearly` |

### AI Service Endpoints

| Service | Purpose | Fallback |
|---------|---------|----------|
| OpenAI GPT-4 Turbo | Chat, Reward Text | Claude Sonnet |
| OpenAI GPT-4 Vision | Girl Descriptions | Template-based |
| Google Imagen 4 Fast | Image Generation | Cached images |
| ElevenLabs | Voice (Premium) | PlayHT |
| PlayHT | Voice (Free) | Text-only |
| OpenAI Moderation | Content Safety | Pattern matching |

---

**End of Master Index**

For detailed specifications, refer to individual contract documents linked above.

