# CharmDojo Implementation Plan - Phase Summaries

This document provides actionable summaries for each implementation phase. For detailed step-by-step instructions, refer to IMPLEMENTATION-PLAN-v1.md.

---

## ✅ Phase 0: Foundation & Environment Setup [COMPLETE]

**Status:** Ready to execute  
**Duration:** 1-2 days  
**Complexity:** Simple

### What Was Set Up:
- ✅ Next.js 16 project with TypeScript & Tailwind CSS
- ✅ Git repository with proper .gitignore
- ✅ Environment variable structure (.env.example, .env.local)
- ✅ Tailwind configured with brand colors
- ✅ shadcn/ui components library
- ✅ ESLint & Prettier for code quality
- ✅ Complete directory structure
- ✅ Sample data files for girl attributes

### Next Step:
Execute Phase 0 steps in IMPLEMENTATION-PLAN-v1.md, then proceed to Phase 1.

---

## 📋 Phase 1: Database & Infrastructure Setup

**Duration:** 2-3 days  
**Complexity:** Medium  
**Dependencies:** Phase 0 complete

### Objectives:
1. Create Supabase project and get API keys
2. Design and create all database tables with proper schemas
3. Set up Row Level Security (RLS) policies
4. Create database migrations
5. Configure Supabase Storage buckets
6. Set up Supabase client libraries (client-side & server-side)

### Key Deliverables:
- Supabase project with PostgreSQL database
- All tables: `users`, `game_rounds`, `messages`, `rewards`, `subscriptions`
- RLS policies for data security
- Storage buckets: `avatars`, `girl-images`, `reward-images`, `reward-audio`
- Supabase client utilities in `src/lib/supabase/`

### API Endpoints Prepared:
None yet (infrastructure only)

### Steps Summary:
1. **Step 1.1:** Create Supabase project, get API keys
2. **Step 1.2:** Fill in Supabase env variables in .env.local
3. **Step 1.3:** Create database schema (all tables from PRD Data Models)
4. **Step 1.4:** Set up Row Level Security policies
5. **Step 1.5:** Create Storage buckets and policies
6. **Step 1.6:** Install Supabase JavaScript client
7. **Step 1.7:** Create Supabase client utilities (client.ts, server.ts, middleware.ts)
8. **Step 1.8:** Create TypeScript types from database schema
9. **Step 1.9:** Test connection and RLS policies

### Key Files Created:
- `supabase/migrations/001_initial_schema.sql`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/middleware.ts`
- `src/types/database.ts`

### Reference:
- PRD Section: Data Models (Page 1746-2150)
- API Contracts: Global Standards

---

## 🔐 Phase 2: Authentication System

**Duration:** 3-4 days  
**Complexity:** Medium  
**Dependencies:** Phase 1 complete

### Objectives:
1. Implement email signup/signin
2. Set up OAuth (Google & Facebook)
3. Create password reset flow
4. Build authentication UI components
5. Set up session management
6. Create protected route middleware
7. Build landing page
8. Create main menu screen

### Key Deliverables:
- Working email authentication
- OAuth integration (Google, Facebook)
- Password reset functionality
- Auth modal components
- Landing page (Tinder-style)
- Main menu screen
- Protected routes middleware
- User profile API endpoints

### API Endpoints Implemented:
- ✅ `POST /api/auth/signup` - Email signup
- ✅ `POST /api/auth/signin` - Email signin  
- ✅ `POST /api/auth/oauth` - OAuth flow
- ✅ `POST /api/auth/reset-password` - Password reset
- ✅ `POST /api/auth/signout` - Signout
- ✅ `POST /api/auth/refresh` - Token refresh
- ✅ `GET /api/auth/session` - Current session
- ✅ `GET /api/user/profile` - Get user profile

### Steps Summary:
1. **Step 2.1:** Create landing page UI
2. **Step 2.2:** Implement email auth API routes & UI
3. **Step 2.3:** Set up OAuth providers (Google, Facebook)
4. **Step 2.4:** Create password reset flow
5. **Step 2.5:** Implement session management
6. **Step 2.6:** Create auth middleware for protected routes
7. **Step 2.7:** Build main menu screen
8. **Step 2.8:** Create auth context/hooks

### Key Files Created:
- `src/app/page.tsx` - Landing page
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/signup/page.tsx`
- `src/app/api/auth/signup/route.ts`
- `src/app/api/auth/signin/route.ts`
- `src/app/api/auth/oauth/route.ts`
- `src/components/auth/AuthModal.tsx`
- `src/components/auth/SignupForm.tsx`
- `src/components/auth/SigninForm.tsx`
- `src/app/(app)/main-menu/page.tsx`
- `src/hooks/useUser.ts`
- `src/middleware.ts`

### Reference:
- PRD Epic 1: User Authentication (Page 489-592)
- PRD Epic 6.1-6.2: Landing Page (Page 1008-1063)
- API Contract: Authentication API

---

## 🎭 Phase 3: Girl Generation System

**Duration:** 4-5 days  
**Complexity:** Complex  
**Dependencies:** Phase 2 complete

### Objectives:
1. Set up Google Cloud account & enable Imagen API
2. Create image generation prompt templates
3. Build girl attribute randomization logic
4. Implement girl profile generation (3 profiles with images)
5. Set up GPT-4 Vision for detailed descriptions
6. Create girl selection UI
7. Implement fallback images for failures

### Key Deliverables:
- Google Imagen 4 Fast integration
- Girl profile image generation
- Vision AI descriptions
- Girl selection screen
- Attribute randomization system
- Fallback image handling
- Caching system for generated images

### API Endpoints Implemented:
- ✅ `POST /api/game/generate-girls` - Generate 3 girl profiles
- ✅ `POST /api/game/start-round` - Start game round with selected girl

### Steps Summary:
1. **Step 3.1:** Set up Google Cloud & Imagen API, add keys to .env.local
2. **Step 3.2:** Create prompt templates (girl_photo_prompt.md, etc.)
3. **Step 3.3:** Build attribute randomization logic
4. **Step 3.4:** Implement image generation API integration
5. **Step 3.5:** Set up GPT-4 Vision for girl descriptions
6. **Step 3.6:** Create girl selection UI component
7. **Step 3.7:** Implement NSFW filtering and retry logic
8. **Step 3.8:** Set up image caching in Supabase Storage
9. **Step 3.9:** Create fallback image system

### Key Files Created:
- `src/prompts/girl_photo_prompt.md`
- `src/lib/ai/imagen.ts` - Imagen API client
- `src/lib/ai/openai.ts` - OpenAI client
- `src/lib/utils/girl-generator.ts`
- `src/app/api/game/generate-girls/route.ts`
- `src/app/api/game/start-round/route.ts`
- `src/app/(app)/game/selection/page.tsx`
- `src/components/game/GirlCard.tsx`
- `src/components/game/GirlSelection.tsx`

### Reference:
- PRD Epic 2: Girl Selection (Page 596-677)
- PRD Appendix A: Prompts (Page 2922-2990)
- API Contract: Game API

---

## 💬 Phase 4: Chat Simulation Engine

**Duration:** 5-7 days  
**Complexity:** Complex  
**Dependencies:** Phase 3 complete

### Objectives:
1. Build chat interface (Tinder-style)
2. Implement message sending/receiving
3. Create AI girl response generation system
4. Build success meter calculation logic
5. Implement content moderation
6. Create instant fail detection
7. Implement win/loss conditions
8. Build game state management

### Key Deliverables:
- Working chat interface
- AI-powered girl responses
- Success meter with real-time updates
- Content moderation system
- Win/loss detection
- Game state persistence
- Chat history

### API Endpoints Implemented:
- ✅ `POST /api/chat/message` - Send message & get AI response
- ✅ `GET /api/chat/messages/{roundId}` - Get conversation history
- ✅ `POST /api/game/complete-round` - Complete game round

### Steps Summary:
1. **Step 4.1:** Create chat UI component (message bubbles, input)
2. **Step 4.2:** Build success meter UI with animations
3. **Step 4.3:** Implement AI chat API (GPT-4 with girl persona)
4. **Step 4.4:** Create success delta calculation logic
5. **Step 4.5:** Implement content moderation (OpenAI Moderation API)
6. **Step 4.6:** Build instant fail detection (gibberish, offensive)
7. **Step 4.7:** Implement win/loss condition checking
8. **Step 4.8:** Create game state management (Zustand)
9. **Step 4.9:** Build "Game Over" screen

### Key Files Created:
- `src/prompts/ai_girl_instructions.md`
- `src/app/(app)/game/chat/[roundId]/page.tsx`
- `src/components/chat/ChatInterface.tsx`
- `src/components/chat/MessageBubble.tsx`
- `src/components/chat/MessageInput.tsx`
- `src/components/chat/SuccessMeter.tsx`
- `src/app/api/chat/message/route.ts`
- `src/lib/ai/chat.ts`
- `src/lib/ai/moderation.ts`
- `src/hooks/useChat.ts`
- `src/hooks/useGame.ts`
- `src/components/game/GameOverScreen.tsx`

### Reference:
- PRD Epic 3: Chat Simulation (Page 680-740)
- PRD Epic 4: Success Meter (Page 797-881)
- PRD Appendix A.4: AI Instructions (Page 3016-3137)
- API Contract: Chat API

---

## 🎁 Phase 5: Reward System

**Duration:** 3-4 days  
**Complexity:** Complex  
**Dependencies:** Phase 4 complete

### Objectives:
1. Set up ElevenLabs API for voice generation
2. Set up PlayHT API as fallback/free tier
3. Implement reward text generation
4. Implement reward voice generation
5. Implement reward image generation (lingerie photo)
6. Create victory screen UI
7. Build audio player component
8. Implement NSFW filtering for reward images

### Key Deliverables:
- Text, voice, and image reward generation
- Victory screen with all rewards
- Audio playback component
- Parallel asset generation for speed
- NSFW filtering and regeneration
- Reward caching system

### API Endpoints Implemented:
- ✅ `POST /api/reward/generate` - Generate all reward assets
- ✅ `GET /api/reward/{roundId}` - Get existing reward
- ✅ `POST /api/reward/regenerate` - Regenerate specific asset

### Steps Summary:
1. **Step 5.1:** Set up ElevenLabs & PlayHT APIs, add keys
2. **Step 5.2:** Create reward generation API (text, voice, image in parallel)
3. **Step 5.3:** Implement reward text generation (GPT-4)
4. **Step 5.4:** Implement voice generation (ElevenLabs/PlayHT)
5. **Step 5.5:** Implement reward image generation (Imagen with description)
6. **Step 5.6:** Create victory screen UI
7. **Step 5.7:** Build audio player with auto-play & replay
8. **Step 5.8:** Add confetti/celebration animation
9. **Step 5.9:** Implement reward caching

### Key Files Created:
- `src/prompts/reward_text_prompt.md`
- `src/prompts/reward_photo_prompt.md`
- `src/app/(app)/game/victory/[roundId]/page.tsx`
- `src/app/api/reward/generate/route.ts`
- `src/lib/ai/voice.ts` - ElevenLabs/PlayHT client
- `src/components/game/VictoryScreen.tsx`
- `src/components/game/AudioPlayer.tsx`
- `src/components/game/RewardImage.tsx`

### Reference:
- PRD Epic 5: Reward System (Page 884-1003)
- PRD Appendix A: Reward Prompts (Page 2959-3013)
- API Contract: Reward API

---

## 🎮 Phase 6: Game Loop & UI Polish

**Duration:** 3-4 days  
**Complexity:** Medium  
**Dependencies:** Phase 5 complete

### Objectives:
1. Implement quick rematch flow
2. Build user statistics tracking
3. Create profile editing page
4. Create settings page
5. Build game history view
6. Implement achievement system
7. Polish all transitions and animations
8. Optimize performance

### Key Deliverables:
- Seamless rematch flow
- User statistics dashboard
- Profile editing page
- Settings page
- Game history with pagination
- Achievement system
- Polished UI animations
- Performance optimizations

### API Endpoints Implemented:
- ✅ `GET /api/game/rounds` - Game history
- ✅ `PATCH /api/user/profile` - Update profile
- ✅ `GET /api/user/stats` - Game statistics
- ✅ `GET /api/user/achievements` - Achievements

### Steps Summary:
1. **Step 6.1:** Implement "Keep Matching" rematch flow
2. **Step 6.2:** Build user statistics calculation & display
3. **Step 6.3:** Create profile editing page
4. **Step 6.4:** Create settings page
5. **Step 6.5:** Build game history view with pagination
6. **Step 6.6:** Implement achievement system
7. **Step 6.7:** Polish all UI transitions
8. **Step 6.8:** Optimize lazy loading & code splitting
9. **Step 6.9:** Add loading states everywhere

### Key Files Created:
- `src/app/(app)/profile/page.tsx`
- `src/app/(app)/settings/page.tsx`
- `src/components/game/StatsCard.tsx`
- `src/components/game/GameHistory.tsx`
- `src/components/game/AchievementBadge.tsx`
- `src/app/api/user/stats/route.ts`
- `src/app/api/game/rounds/route.ts`

### Reference:
- PRD Epic 6.3: Quick Rematch (Page 1066-1089)
- API Contract: User API, Game API

---

## 💰 Phase 7: Monetization & Subscriptions

**Duration:** 3-4 days  
**Complexity:** Medium  
**Dependencies:** Phase 6 complete

### Objectives:
1. Set up Stripe account and products
2. Implement Stripe Checkout integration
3. Create pricing page
4. Implement free tier limits
5. Build subscription status checking
6. Implement Stripe webhooks
7. Create upgrade prompts
8. Integrate Customer Portal

### Key Deliverables:
- Stripe integration
- Pricing page
- Free tier limits (5 rounds/day)
- Subscription management
- Webhook handling
- Upgrade prompts
- Customer Portal

### API Endpoints Implemented:
- ✅ `POST /api/subscription/create-checkout` - Stripe Checkout
- ✅ `GET /api/subscription/status` - Subscription status
- ✅ `POST /api/subscription/create-portal` - Customer Portal
- ✅ `POST /api/subscription/cancel` - Cancel subscription
- ✅ `POST /api/subscription/webhook` - Stripe webhooks
- ✅ `GET /api/game/limits` - Check daily limits

### Steps Summary:
1. **Step 7.1:** Set up Stripe account, create products/prices
2. **Step 7.2:** Implement free tier limit checking
3. **Step 7.3:** Create Stripe Checkout API route
4. **Step 7.4:** Build pricing page
5. **Step 7.5:** Implement subscription status checking
6. **Step 7.6:** Set up Stripe webhook handling
7. **Step 7.7:** Create upgrade prompts (when limit reached)
8. **Step 7.8:** Integrate Customer Portal
9. **Step 7.9:** Test full payment flow

### Key Files Created:
- `src/app/pricing/page.tsx`
- `src/app/api/subscription/create-checkout/route.ts`
- `src/app/api/subscription/webhook/route.ts`
- `src/lib/stripe/client.ts`
- `src/components/subscription/PricingCard.tsx`
- `src/components/subscription/UpgradePrompt.tsx`

### Reference:
- PRD Phase 6: Monetization (Page 2543-2572)
- API Contract: Subscription API
- PRD Appendix C: Free vs Premium (Page 3179-3193)

---

## 🚀 Phase 8: Testing, Optimization & Launch Prep

**Duration:** 3-5 days  
**Complexity:** Medium  
**Dependencies:** Phase 7 complete

### Objectives:
1. Comprehensive QA testing
2. Performance optimization
3. SEO optimization
4. Analytics integration
5. Error tracking setup
6. Load testing
7. Security audit
8. Production environment setup
9. Documentation

### Key Deliverables:
- All bugs fixed
- Optimized performance (Lighthouse >90)
- SEO configured
- Analytics tracking
- Error monitoring
- Production config
- User documentation
- Launch checklist

### Steps Summary:
1. **Step 8.1:** Manual QA testing all user flows
2. **Step 8.2:** Performance audit & optimization
3. **Step 8.3:** SEO setup (meta tags, sitemap, robots.txt)
4. **Step 8.4:** Integrate PostHog/Mixpanel analytics
5. **Step 8.5:** Set up Sentry error tracking
6. **Step 8.6:** Load test API endpoints
7. **Step 8.7:** Security audit (OWASP checklist)
8. **Step 8.8:** Configure production environment
9. **Step 8.9:** Create privacy policy & terms of service
10. **Step 8.10:** Deploy to Vercel production

### Key Files Created:
- `public/sitemap.xml`
- `public/robots.txt`
- `src/app/privacy/page.tsx`
- `src/app/terms/page.tsx`
- `.env.production`
- `vercel.json`

### Reference:
- PRD Phase 7: Testing & Refinement (Page 2575-2605)
- PRD Phase 8: Launch Preparation (Page 2608-2637)

---

## 📚 Appendix: Quick Reference

### Cost Per Game Round (Estimated)

**MVP with Imagen 4 Fast:**
- Girl images (3): ~$0.12 ($0.04 each)
- Chat conversation (~15 messages): ~$0.15
- Reward text: ~$0.01
- Reward voice (PlayHT): ~$0.004
- Reward image: ~$0.04
- **Total per win:** ~$0.32
- **Per loss (no reward):** ~$0.12

### API Keys Needed

| Service | Purpose | Phase | How to Get |
|---------|---------|-------|------------|
| Supabase | Database, Auth, Storage | 1 | https://supabase.com/dashboard |
| OpenAI | Chat, Vision, Text | 3, 4, 5 | https://platform.openai.com/api-keys |
| Google Cloud | Imagen 4 Fast | 3, 5 | https://console.cloud.google.com |
| ElevenLabs | Voice (Premium) | 5 | https://elevenlabs.io/app/settings/api-keys |
| PlayHT | Voice (Free tier) | 5 | https://play.ht/app/api-access |
| Stripe | Payments | 7 | https://dashboard.stripe.com/apikeys |

### Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues
npm run format           # Format with Prettier
npm run type-check       # TypeScript check

# Database
npx supabase db push     # Push migrations (if using Supabase CLI)
npx supabase db pull     # Pull schema

# Deployment
vercel                   # Deploy to Vercel
vercel --prod            # Deploy to production
```

### Tech Stack Summary

- **Frontend:** Next.js 16, React 19, TypeScript 5.9.3
- **Styling:** Tailwind CSS 4.1.16, shadcn/ui 3.4.2
- **Backend:** Next.js API Routes, Supabase
- **Database:** PostgreSQL (Supabase)
- **Auth:** Supabase Auth
- **AI:** OpenAI GPT-4, Google Imagen 4, ElevenLabs/PlayHT
- **Payments:** Stripe
- **Hosting:** Vercel

### Next Steps

1. **Execute Phase 0** steps from IMPLEMENTATION-PLAN-v1.md
2. **Proceed sequentially** through phases 1-8
3. **Test thoroughly** at the end of each phase
4. **Keep this summary** as a roadmap reference

---

**Document Status:** Ready for Execution  
**Total Estimated Duration:** 27-38 days (1 developer)  
**MVP Ready After:** Phase 4 (Basic gameplay)  
**Full Launch After:** Phase 8


