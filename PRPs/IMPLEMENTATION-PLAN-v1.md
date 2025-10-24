# CharmDojo Implementation Plan v1

**Document Version:** 1.0  
**Created:** October 23, 2025  
**Status:** Ready for Execution  
**Based on:** PRD v1.0, API Contracts v1.0

---

## Executive Summary

This implementation plan provides a comprehensive, step-by-step guide to building CharmDojo from absolute zero (no code, no infrastructure, no API keys) to a production-ready application.

### Project Overview

**CharmDojo** is a gamified dating conversation training web application that helps men develop their texting skills through realistic AI-powered chat simulations with virtual women.

**Core Technologies:**
- **Frontend:** Next.js 16, React 19, TypeScript 5.9.3, Tailwind CSS 4.1.16, shadcn/ui 3.4.2
- **Backend:** Next.js API Routes, Supabase (PostgreSQL, Auth, Storage)
- **AI Services:** OpenAI GPT-4 Turbo, GPT-4 Vision, Google Imagen 4 Fast, ElevenLabs v3 (alpha) - Jessica voice / PlayHT
- **Payments:** Stripe Checkout & Subscriptions
- **Hosting:** Vercel (Edge Network, Serverless Functions)

### Implementation Timeline

- **Total Phases:** 9 (Phase 0-8)
- **MVP Completion:** End of Phase 4 (Basic playable game loop)
- **Full Feature Set:** End of Phase 7 (With monetization)
- **Launch Ready:** End of Phase 8 (Tested and optimized)

### Critical Success Factors

1. ✅ **AI Service Integration:** Proper setup of OpenAI, Google Imagen, and voice APIs
2. ✅ **Content Safety:** Multi-layer NSFW filtering and content moderation
3. ✅ **Cost Management:** Aggressive caching and tier-based AI usage
4. ✅ **User Experience:** Smooth, fast interactions with <3s response times
5. ✅ **Payment Flow:** Robust Stripe integration with webhook handling

---

## Quick Reference

### Phase Overview

| Phase | Name | Complexity | Duration | Dependencies | Key Deliverables |
|-------|------|------------|----------|--------------|------------------|
| **0** | Foundation & Environment | Simple | 1-2 days | None | Project setup, dependencies, dev environment |
| **1** | Database & Infrastructure | Medium | 2-3 days | Phase 0 | Supabase configured, all tables with RLS |
| **2** | Authentication System | Medium | 3-4 days | Phase 1 | Email + OAuth login, session management |
| **3** | Girl Generation System | Complex | 4-5 days | Phase 2 | AI image generation, selection screen |
| **4** | Chat Simulation Engine | Complex | 5-7 days | Phase 3 | Working chat with AI, success meter |
| **5** | Reward System | Complex | 3-4 days | Phase 4 | Text, voice, image rewards on victory |
| **6** | Game Loop & UI Polish | Medium | 3-4 days | Phase 5 | All screens, navigation, user stats |
| **7** | Monetization & Subscriptions | Medium | 3-4 days | Phase 6 | Stripe integration, free tier limits |
| **8** | Testing & Launch Prep | Medium | 3-5 days | Phase 7 | QA, optimization, production config |

**Total Estimated Duration:** 27-38 days (assuming 1 developer)

### MVP Scope (End of Phase 4)

**Included:**
- ✅ User authentication (email + OAuth)
- ✅ Girl profile generation (3 options)
- ✅ Chat simulation with AI responses
- ✅ Success meter mechanics (0-100%)
- ✅ Win/loss conditions

**Not Included in MVP:**
- ❌ Reward generation (Phase 5)
- ❌ User statistics dashboard (Phase 6)
- ❌ Payment/subscriptions (Phase 7)
- ❌ Production optimizations (Phase 8)

---

## API Contract Coverage Map

### Authentication Endpoints (Phase 2)

| Endpoint | Method | Phase | Step | Purpose |
|----------|--------|-------|------|---------|
| `/api/auth/signup` | POST | 2 | 2.2 | Email signup |
| `/api/auth/signin` | POST | 2 | 2.2 | Email signin |
| `/api/auth/oauth` | POST | 2 | 2.3 | OAuth flow (Google/Facebook) |
| `/api/auth/reset-password` | POST | 2 | 2.4 | Password reset request |
| `/api/auth/signout` | POST | 2 | 2.2 | User signout |
| `/api/auth/refresh` | POST | 2 | 2.5 | Token refresh |
| `/api/auth/session` | GET | 2 | 2.5 | Get current session |

### Game Endpoints (Phase 3 & 6)

| Endpoint | Method | Phase | Step | Purpose |
|----------|--------|-------|------|---------|
| `/api/game/generate-girls` | POST | 3 | 3.3 | Generate 3 AI girl profiles |
| `/api/game/start-round` | POST | 3 | 3.4 | Initialize conversation round |
| `/api/game/complete-round` | POST | 6 | 6.3 | Finalize round, update stats |
| `/api/game/rounds` | GET | 6 | 6.4 | Get game history |
| `/api/game/limits` | GET | 7 | 7.2 | Check free tier limits |

### Chat Endpoints (Phase 4)

| Endpoint | Method | Phase | Step | Purpose |
|----------|--------|-------|------|---------|
| `/api/chat/message` | POST | 4 | 4.3 | Send message, get AI response |
| `/api/chat/messages/{roundId}` | GET | 4 | 4.4 | Retrieve conversation history |

### Reward Endpoints (Phase 5)

| Endpoint | Method | Phase | Step | Purpose |
|----------|--------|-------|------|---------|
| `/api/reward/generate` | POST | 5 | 5.2 | Generate all reward assets |
| `/api/reward/{roundId}` | GET | 5 | 5.3 | Retrieve existing reward |
| `/api/reward/regenerate` | POST | 5 | 5.4 | Regenerate specific asset |

### User Endpoints (Phase 6)

| Endpoint | Method | Phase | Step | Purpose |
|----------|--------|-------|------|---------|
| `/api/user/profile` | GET | 2 | 2.6 | Get user profile |
| `/api/user/profile` | PATCH | 6 | 6.5 | Update user profile |
| `/api/user/stats` | GET | 6 | 6.6 | Get game statistics |
| `/api/user/achievements` | GET | 6 | 6.7 | View achievements |

### Subscription Endpoints (Phase 7)

| Endpoint | Method | Phase | Step | Purpose |
|----------|--------|-------|------|---------|
| `/api/subscription/create-checkout` | POST | 7 | 7.3 | Create Stripe Checkout |
| `/api/subscription/status` | GET | 7 | 7.4 | Get subscription status |
| `/api/subscription/create-portal` | POST | 7 | 7.5 | Create Customer Portal |
| `/api/subscription/cancel` | POST | 7 | 7.6 | Cancel subscription |
| `/api/subscription/webhook` | POST | 7 | 7.7 | Handle Stripe webhooks |

---

## PRD Story Coverage Map

### Epic 1: User Authentication & Onboarding (Phase 2)

| Story | Description | Phase | Step | Status |
|-------|-------------|-------|------|--------|
| 1.1 | Sign Up with Email | 2 | 2.2 | Planned |
| 1.2 | Sign In with OAuth | 2 | 2.3 | Planned |
| 1.3 | Sign In with Email | 2 | 2.2 | Planned |
| 1.4 | Password Reset | 2 | 2.4 | Planned |

### Epic 2: Girl Selection & Profile Generation (Phase 3)

| Story | Description | Phase | Step | Status |
|-------|-------------|-------|------|--------|
| 2.1 | View Girl Selection Screen | 3 | 3.3 | Planned |
| 2.2 | Select a Girl to Start Game | 3 | 3.4 | Planned |
| 2.3 | Generate Detailed Girl Description | 3 | 3.5 | Planned |

### Epic 3: Chat Simulation Engine (Phase 4)

| Story | Description | Phase | Step | Status |
|-------|-------------|-------|------|--------|
| 3.1 | Send User Message | 4 | 4.3 | Planned |
| 3.2 | Receive AI Girl Response | 4 | 4.3 | Planned |
| 3.3 | Real-Time Success Meter Updates | 4 | 4.5 | Planned |
| 3.4 | Instant Fail Detection | 4 | 4.6 | Planned |

### Epic 4: Success Meter & Game Logic (Phase 4)

| Story | Description | Phase | Step | Status |
|-------|-------------|-------|------|--------|
| 4.1 | Calculate Success Delta | 4 | 4.3 | Planned |
| 4.2 | Win Condition Trigger | 4 | 4.7 | Planned |
| 4.3 | Loss Condition Trigger | 4 | 4.7 | Planned |

### Epic 5: Reward System (Phase 5)

| Story | Description | Phase | Step | Status |
|-------|-------------|-------|------|--------|
| 5.1 | Generate Reward Text | 5 | 5.2 | Planned |
| 5.2 | Generate Reward Voice | 5 | 5.2 | Planned |
| 5.3 | Generate Reward Image | 5 | 5.2 | Planned |
| 5.4 | Display "You Won!" Screen | 5 | 5.5 | Planned |

### Epic 6: Landing Page & Navigation (Phases 2 & 6)

| Story | Description | Phase | Step | Status |
|-------|-------------|-------|------|--------|
| 6.1 | Create Tinder-Style Landing Page | 2 | 2.1 | Planned |
| 6.2 | Navigate to Main Menu After Auth | 2 | 2.6 | Planned |
| 6.3 | Quick Rematch Flow | 6 | 6.2 | Planned |

---

## Detailed Implementation Plan

---

## Phase 0: Foundation & Environment Setup

### Overview

**Goal**: Set up the development environment, project structure, and foundational tooling from absolute scratch.

**Duration Estimate**: 1-2 days (Simple complexity)

**Success Criteria**:
- [ ] Next.js 16 project initialized with TypeScript and Tailwind CSS
- [ ] All required dependencies installed and configured
- [ ] Development server runs successfully
- [ ] Git repository initialized with proper .gitignore
- [ ] Environment variables structure created
- [ ] Code quality tools (ESLint, Prettier) configured
- [ ] Project builds successfully

**Dependencies**: 
- None (starting from zero)

**Deliverables**:
- Runnable Next.js application skeleton
- Complete package.json with all dependencies
- Environment variable templates (.env.example)
- Basic project file structure following PRD specifications
- Development tooling configured

### Technical Foundation

This phase establishes the foundation for the entire project. Since we're starting from absolute zero (no code, no API keys, no infrastructure), we need to:

1. **Initialize the Next.js project** with the latest App Router architecture
2. **Configure TypeScript** for type safety throughout the application
3. **Set up Tailwind CSS** for styling with the brand colors from PRD
4. **Install shadcn/ui** for accessible, customizable components
5. **Create the project structure** as specified in PRD Section "File Structure"

**Key Technologies/Patterns**:
- **Next.js 16 App Router**: Server Components by default, client components as needed
- **TypeScript 5.9.3**: Strict mode for maximum type safety
- **Tailwind CSS 4.1.16**: Utility-first CSS with custom color palette
- **shadcn/ui 3.4.2**: Copy-paste component library (not a dependency)

**Architecture Decisions**:
- **Monorepo structure**: Single repository for frontend and API
- **src/ directory**: All application code in src/ for clean separation
- **App Router**: Utilizing Next.js 16's latest routing features
- **TypeScript strict mode**: Catch errors early, self-documenting code

---

### Step 0.1: Initialize Next.js Project

**Objective**: Create a new Next.js 16 project with TypeScript and essential dependencies.

**Implementation Details**:

1. **Project Initialization**
   ```bash
   # Navigate to workspace root
   cd /home/quza/charmdojo/charmdojov1
   
   # Initialize Next.js with TypeScript (interactive prompts)
   npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"
   
   # Answer prompts:
   # - Would you like to use TypeScript? Yes
   # - Would you like to use ESLint? Yes
   # - Would you like to use Tailwind CSS? Yes
   # - Would you like to use `src/` directory? Yes
   # - Would you like to use App Router? Yes
   # - Would you like to customize the default import alias? Yes (@/*)
   ```

2. **Verify Installation**
   ```bash
   # Check if key files exist
   ls -la
   # Should see: package.json, tsconfig.json, next.config.js, tailwind.config.ts
   
   # Check src directory structure
   ls -la src/
   # Should see: app/ directory
   ```

3. **Install Additional Core Dependencies**
   ```bash
   # Core React and Next.js versions
   npm install react@19.2.0 react-dom@19.2.0
   
   # TypeScript
   npm install --save-dev typescript@5.9.3 @types/node @types/react @types/react-dom
   
   # Tailwind CSS and plugins
   npm install -D tailwindcss@4.1.16 postcss autoprefixer
   npm install -D tailwindcss-animate class-variance-authority clsx tailwind-merge
   
   # Form handling and validation
   npm install react-hook-form zod @hookform/resolvers
   
   # State management
   npm install zustand
   
   # Date utilities
   npm install date-fns
   
   # Icons
   npm install lucide-react
   ```

**Code Structure**:
```
charmdojov1/
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Landing page
│   │   └── globals.css       # Global styles
│   └── [to be created in next steps]
├── public/
│   └── [static assets]
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
└── .gitignore
```

**Validation**:
```bash
# Check TypeScript compilation
npx tsc --noEmit

# Try to start dev server
npm run dev
# Should start on http://localhost:3000

# Verify build
npm run build
# Should complete without errors
```

**Acceptance Criteria**:
- [ ] package.json contains correct dependencies
- [ ] TypeScript compiles without errors
- [ ] Dev server starts successfully
- [ ] Build completes successfully
- [ ] Landing page loads at localhost:3000

**Common Pitfalls**:
- ⚠️ Make sure Node.js version is >=18.17 (check with `node -v`)
- ⚠️ If create-next-app fails, ensure directory is empty or use `--force` flag
- ⚠️ Windows users may need to use Git Bash or WSL for Unix commands

**Reference PRD Sections**: 
- Technology Stack (Page 2153-2254)
- File Structure (Page 2294-2373)

---

### Step 0.2: Configure Git and Version Control

**Objective**: Initialize Git repository with proper ignore patterns.

**Implementation Details**:

1. **Initialize Git**
   ```bash
   # Initialize repository
   git init
   
   # Set up default branch
   git branch -M main
   ```

2. **Create .gitignore**
   ```bash
   # Next.js creates .gitignore, but verify it contains:
   cat .gitignore
   ```
   
   Ensure .gitignore includes:
   ```
   # dependencies
   /node_modules
   /.pnp
   .pnp.js
   
   # testing
   /coverage
   
   # next.js
   /.next/
   /out/
   
   # production
   /build
   
   # misc
   .DS_Store
   *.pem
   
   # debug
   npm-debug.log*
   yarn-debug.log*
   yarn-error.log*
   
   # env files
   .env
   .env*.local
   .env.production
   
   # vercel
   .vercel
   
   # typescript
   *.tsbuildinfo
   next-env.d.ts
   
   # IDE
   .vscode/
   .idea/
   *.swp
   *.swo
   *~
   ```

3. **Initial Commit**
   ```bash
   git add .
   git commit -m "Initial Next.js 16 setup with TypeScript and Tailwind"
   ```

**Validation**:
```bash
# Verify git status
git status
# Should show clean working tree

# Check ignored files
git check-ignore -v .env.local
# Should show .gitignore rule
```

**Acceptance Criteria**:
- [ ] Git repository initialized
- [ ] .gitignore properly configured
- [ ] Initial commit created
- [ ] No sensitive files tracked

**Common Pitfalls**:
- ⚠️ Never commit .env.local or .env files with secrets
- ⚠️ Ensure node_modules/ is ignored (can be huge)

**Reference PRD Sections**: 
- Development & Tooling (Page 2243-2252)

---

### Step 0.3: Set Up Environment Variables Structure

**Objective**: Create environment variable templates for all required services (even though we don't have API keys yet).

**Implementation Details**:

1. **Create .env.example Template**
   
   Create file: `.env.example`
   ```env
   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NODE_ENV=development
   
   # Supabase Configuration
   # Get these from: https://supabase.com/dashboard/project/_/settings/api
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   
   # OpenAI Configuration
   # Get from: https://platform.openai.com/api-keys
   OPENAI_API_KEY=sk-your-api-key-here
   OPENAI_ORG_ID=org-your-org-id-here
   
   # Google Cloud (Imagen 4 Fast) Configuration
   # Get from: https://console.cloud.google.com/apis/credentials
   GOOGLE_CLOUD_PROJECT_ID=your-project-id
   GOOGLE_CLOUD_API_KEY=your-api-key-here
   # Alternative: Use service account JSON
   # GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
   
   # Voice Generation - ElevenLabs v3 (alpha) (Premium)
   # Get from: https://elevenlabs.io/app/settings/api-keys
   # Voice: Jessica (seductive female voice)
   ELEVENLABS_API_KEY=your-api-key-here
   ELEVENLABS_VOICE_ID=cgSgspJ2msm6clMCkdW9
   
   # Voice Generation - PlayHT (Free Tier)
   # Get from: https://play.ht/app/api-access
   PLAYHT_API_KEY=your-api-key-here
   PLAYHT_USER_ID=your-user-id-here
   
   # Stripe Configuration
   # Get from: https://dashboard.stripe.com/apikeys
   STRIPE_SECRET_KEY=sk_test_your-secret-key
   STRIPE_PUBLISHABLE_KEY=pk_test_your-publishable-key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-publishable-key
   STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
   
   # Analytics (Optional)
   NEXT_PUBLIC_POSTHOG_KEY=phc_your-key-here
   SENTRY_DSN=https://your-sentry-dsn
   
   # Development Settings
   NEXT_PUBLIC_DEBUG_MODE=false
   ```

2. **Create .env.local for Development**
   ```bash
   # Copy template
   cp .env.example .env.local
   
   # Edit .env.local with a note for yourself
   echo "# TODO: Fill in API keys as services are set up in later phases" >> .env.local
   ```

3. **Create Environment Type Definitions**
   
   Create file: `src/types/env.d.ts`
   ```typescript
   declare namespace NodeJS {
     interface ProcessEnv {
       // App
       NEXT_PUBLIC_APP_URL: string;
       NODE_ENV: 'development' | 'production' | 'test';
       
       // Supabase
       NEXT_PUBLIC_SUPABASE_URL: string;
       NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
       SUPABASE_SERVICE_ROLE_KEY: string;
       
       // OpenAI
       OPENAI_API_KEY: string;
       OPENAI_ORG_ID?: string;
       
       // Google Cloud
       GOOGLE_CLOUD_PROJECT_ID: string;
       GOOGLE_CLOUD_API_KEY: string;
       GOOGLE_APPLICATION_CREDENTIALS?: string;
       
       // Voice APIs
       ELEVENLABS_API_KEY?: string;
       ELEVENLABS_VOICE_ID?: string;
       PLAYHT_API_KEY?: string;
       PLAYHT_USER_ID?: string;
       
       // Stripe
       STRIPE_SECRET_KEY: string;
       STRIPE_PUBLISHABLE_KEY: string;
       NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string;
       STRIPE_WEBHOOK_SECRET: string;
       
       // Analytics
       NEXT_PUBLIC_POSTHOG_KEY?: string;
       SENTRY_DSN?: string;
       
       // Debug
       NEXT_PUBLIC_DEBUG_MODE?: string;
     }
   }
   ```

**Validation**:
```bash
# Verify .env.example exists
cat .env.example

# Verify .env.local exists (but don't print it)
test -f .env.local && echo ".env.local exists" || echo ".env.local missing"

# Verify .env.local is gitignored
git check-ignore .env.local
# Should output: .env.local
```

**Acceptance Criteria**:
- [ ] .env.example created with all required variables
- [ ] .env.local created (empty or with placeholders)
- [ ] env.d.ts provides TypeScript types for process.env
- [ ] .env.local is gitignored

**Common Pitfalls**:
- ⚠️ Never commit .env.local to Git
- ⚠️ NEXT_PUBLIC_ prefix exposes variables to browser (only use for non-sensitive data)
- ⚠️ Keep .env.example up-to-date as you add new variables

**Reference PRD Sections**: 
- Environment Variables Structure (Page 2256-2288)

---

### Step 0.4: Configure Tailwind CSS with Brand Colors

**Objective**: Customize Tailwind CSS with CharmDojo's brand colors and design system.

**Implementation Details**:

1. **Update tailwind.config.ts**
   
   Replace/update the file: `tailwind.config.ts`
   ```typescript
   import type { Config } from 'tailwindcss'
   
   const config: Config = {
     darkMode: ['class'],
     content: [
       './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
       './src/components/**/*.{js,ts,jsx,tsx,mdx}',
       './src/app/**/*.{js,ts,jsx,tsx,mdx}',
     ],
     theme: {
       extend: {
         colors: {
           // CharmDojo Brand Colors (from PRD)
           primary: {
             DEFAULT: '#e15f6e', // Coral-Pink (Headlines)
             light: '#ef8391',
             dark: '#c73d4f',
           },
           secondary: {
             DEFAULT: '#f53049', // Bright Red-Pink (Gradient 1)
             light: '#ff5a70',
             dark: '#d91c38',
           },
           accent: {
             DEFAULT: '#f22a5a', // Magenta-Pink (Gradient 2)
             light: '#ff4d79',
             dark: '#d11545',
           },
           neutral: {
             DEFAULT: '#04060c', // Dark Background
             50: '#f8f9fa',
             100: '#e9ecef',
             200: '#dee2e6',
             300: '#adb5bd',
             400: '#6c757d',
             500: '#495057',
             600: '#343a40',
             700: '#212529',
             800: '#0a0d12',
             900: '#04060c',
           },
           // Semantic colors
           success: {
             DEFAULT: '#10B981',
             light: '#34D399',
             dark: '#059669',
           },
           warning: {
             DEFAULT: '#F59E0B',
             light: '#FBBF24',
             dark: '#D97706',
           },
           error: {
             DEFAULT: '#EF4444',
             light: '#F87171',
             dark: '#DC2626',
           },
           // UI colors
           background: 'hsl(var(--background))',
           foreground: 'hsl(var(--foreground))',
           card: {
             DEFAULT: 'hsl(var(--card))',
             foreground: 'hsl(var(--card-foreground))'
           },
           popover: {
             DEFAULT: 'hsl(var(--popover))',
             foreground: 'hsl(var(--popover-foreground))'
           },
           muted: {
             DEFAULT: 'hsl(var(--muted))',
             foreground: 'hsl(var(--muted-foreground))'
           },
           accent: {
             DEFAULT: 'hsl(var(--accent))',
             foreground: 'hsl(var(--accent-foreground))'
           },
           destructive: {
             DEFAULT: 'hsl(var(--destructive))',
             foreground: 'hsl(var(--destructive-foreground))'
           },
           border: 'hsl(var(--border))',
           input: 'hsl(var(--input))',
           ring: 'hsl(var(--ring))',
           chart: {
             '1': 'hsl(var(--chart-1))',
             '2': 'hsl(var(--chart-2))',
             '3': 'hsl(var(--chart-3))',
             '4': 'hsl(var(--chart-4))',
             '5': 'hsl(var(--chart-5))'
           }
         },
         borderRadius: {
           lg: 'var(--radius)',
           md: 'calc(var(--radius) - 2px)',
           sm: 'calc(var(--radius) - 4px)'
         },
         keyframes: {
           'accordion-down': {
             from: { height: '0' },
             to: { height: 'var(--radix-accordion-content-height)' }
           },
           'accordion-up': {
             from: { height: 'var(--radix-accordion-content-height)' },
             to: { height: '0' }
           },
           'pulse-success': {
             '0%, 100%': { opacity: '1' },
             '50%': { opacity: '0.7', backgroundColor: '#10B981' }
           },
           'pulse-error': {
             '0%, 100%': { opacity: '1' },
             '50%': { opacity: '0.7', backgroundColor: '#EF4444' }
           }
         },
         animation: {
           'accordion-down': 'accordion-down 0.2s ease-out',
           'accordion-up': 'accordion-up 0.2s ease-out',
           'pulse-success': 'pulse-success 0.5s ease-in-out',
           'pulse-error': 'pulse-error 0.5s ease-in-out'
         }
       },
     },
     plugins: [require('tailwindcss-animate')],
   } satisfies Config
   
   export default config
   ```

2. **Update globals.css with CSS Variables**
   
   Update file: `src/app/globals.css`
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   
   @layer base {
     :root {
       --background: 215 50% 3%; /* #04060c */
       --foreground: 0 0% 100%; /* #ffffff */
       --card: 215 40% 8%;
       --card-foreground: 0 0% 100%;
       --popover: 215 45% 6%;
       --popover-foreground: 0 0% 100%;
       --primary: 354 65% 63%; /* #e15f6e */
       --primary-foreground: 0 0% 100%;
       --secondary: 352 90% 58%; /* #f53049 */
       --secondary-foreground: 0 0% 100%;
       --muted: 215 35% 15%;
       --muted-foreground: 0 0% 70%;
       --accent: 346 87% 56%; /* #f22a5a */
       --accent-foreground: 0 0% 100%;
       --destructive: 0 84.2% 60.2%;
       --destructive-foreground: 0 0% 100%;
       --border: 215 30% 18%;
       --input: 215 30% 18%;
       --ring: 354 65% 63%;
       --chart-1: 354 65% 63%;
       --chart-2: 352 90% 58%;
       --chart-3: 346 87% 56%;
       --chart-4: 340 82% 52%;
       --chart-5: 335 78% 48%;
       --radius: 0.5rem;
     }
   
     .dark {
       --background: 215 50% 3%;
       --foreground: 0 0% 100%;
       --card: 215 40% 8%;
       --card-foreground: 0 0% 100%;
       --popover: 215 45% 6%;
       --popover-foreground: 0 0% 100%;
       --primary: 354 65% 63%;
       --primary-foreground: 0 0% 100%;
       --secondary: 352 90% 58%;
       --secondary-foreground: 0 0% 100%;
       --muted: 215 35% 15%;
       --muted-foreground: 0 0% 70%;
       --accent: 346 87% 56%;
       --accent-foreground: 0 0% 100%;
       --destructive: 0 62.8% 30.6%;
       --destructive-foreground: 0 0% 100%;
       --border: 215 30% 18%;
       --input: 215 30% 18%;
       --ring: 354 65% 63%;
       --chart-1: 354 65% 63%;
       --chart-2: 352 90% 58%;
       --chart-3: 346 87% 56%;
       --chart-4: 340 82% 52%;
       --chart-5: 335 78% 48%;
     }
   }
   
   @layer base {
     * {
       @apply border-border;
     }
     body {
       @apply bg-background text-foreground;
     }
   }
   ```

**API Endpoints Used**: None

**Validation**:
```bash
# Start dev server and check styling
npm run dev

# Build to check for CSS errors
npm run build

# Should complete without CSS errors
```

**Acceptance Criteria**:
- [ ] Tailwind config includes brand colors
- [ ] CSS variables defined in globals.css
- [ ] Dev server shows no CSS warnings
- [ ] Build completes successfully

**Common Pitfalls**:
- ⚠️ Ensure tailwindcss-animate is installed before referencing in config
- ⚠️ CSS variable format must be HSL values (hue saturation lightness)

**Reference PRD Sections**: 
- Landing Page & Navigation (Page 1008-1035)
- Updated Brand Colors: Dark (#04060c), Coral-Pink (#e15f6e), Gradient Reds (#f53049, #f22a5a)

---

### Step 0.5: Initialize shadcn/ui Components Library

**Objective**: Set up shadcn/ui for reusable, accessible components.

**Implementation Details**:

1. **Initialize shadcn/ui**
   ```bash
   # Initialize shadcn/ui (interactive)
   npx shadcn@latest init
   
   # Answer prompts:
   # - Would you like to use TypeScript? Yes
   # - Which style would you like to use? New York
   # - Which color would you like to use as base color? Neutral
   # - Where is your global CSS file? src/app/globals.css
   # - Would you like to use CSS variables for colors? Yes
   # - Where is your tailwind.config.js located? tailwind.config.ts
   # - Configure the import alias for components? @/components
   # - Configure the import alias for utils? @/lib/utils
   # - Are you using React Server Components? Yes
   ```

2. **Install Essential shadcn Components**
   ```bash
   # UI Components we'll need throughout the app
   npx shadcn@latest add button
   npx shadcn@latest add card
   npx shadcn@latest add input
   npx shadcn@latest add label
   npx shadcn@latest add dialog
   npx shadcn@latest add toast
   npx shadcn@latest add avatar
   npx shadcn@latest add progress
   npx shadcn@latest add separator
   npx shadcn@latest add tabs
   ```

3. **Verify Component Installation**
   ```bash
   # Check that components directory exists
   ls src/components/ui/
   # Should see: button.tsx, card.tsx, input.tsx, etc.
   
   # Check utils lib
   ls src/lib/
   # Should see: utils.ts
   ```

**Code Structure**:
```
src/
├── components/
│   └── ui/               # shadcn components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── dialog.tsx
│       ├── toast.tsx
│       ├── avatar.tsx
│       ├── progress.tsx
│       ├── separator.tsx
│       └── tabs.tsx
└── lib/
    └── utils.ts          # Utility functions (cn helper)
```

**Validation**:
```bash
# Check TypeScript compilation
npx tsc --noEmit

# Try importing a component in page.tsx temporarily
# Add to src/app/page.tsx:
# import { Button } from '@/components/ui/button'
# <Button>Test</Button>

npm run dev
# Visit localhost:3000, should see button without errors
```

**Acceptance Criteria**:
- [ ] shadcn/ui initialized successfully
- [ ] Essential UI components installed
- [ ] Components import without errors
- [ ] Test button renders on page

**Common Pitfalls**:
- ⚠️ If imports fail, check tsconfig.json has correct path mapping
- ⚠️ Ensure @/components and @/lib aliases are configured

**Reference PRD Sections**: 
- Technology Stack (Page 2158, shadcn/ui)

---

### Step 0.6: Configure ESLint and Prettier

**Objective**: Set up code quality tools for consistent, error-free code.

**Implementation Details**:

1. **Install Prettier and Extensions**
   ```bash
   npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier
   npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser
   ```

2. **Create .prettierrc Configuration**
   
   Create file: `.prettierrc`
   ```json
   {
     "semi": true,
     "trailingComma": "es5",
     "singleQuote": true,
     "printWidth": 80,
     "tabWidth": 2,
     "useTabs": false,
     "endOfLine": "lf",
     "arrowParens": "always"
   }
   ```

3. **Create .prettierignore**
   
   Create file: `.prettierignore`
   ```
   node_modules
   .next
   out
   build
   dist
   *.min.js
   package-lock.json
   yarn.lock
   pnpm-lock.yaml
   ```

4. **Update .eslintrc.json**
   
   Update file: `.eslintrc.json`
   ```json
   {
     "extends": [
       "next/core-web-vitals",
       "next/typescript",
       "prettier"
     ],
     "plugins": ["prettier"],
     "rules": {
       "prettier/prettier": "warn",
       "@typescript-eslint/no-unused-vars": ["warn", {
         "argsIgnorePattern": "^_",
         "varsIgnorePattern": "^_"
       }],
       "@typescript-eslint/no-explicit-any": "warn",
       "react-hooks/exhaustive-deps": "warn",
       "no-console": ["warn", { "allow": ["warn", "error"] }]
     }
   }
   ```

5. **Add Scripts to package.json**
   
   Add to `package.json` scripts section:
   ```json
   {
     "scripts": {
       "dev": "next dev",
       "build": "next build",
       "start": "next start",
       "lint": "next lint",
       "lint:fix": "next lint --fix",
       "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json,css,md}\"",
       "format:check": "prettier --check \"src/**/*.{js,jsx,ts,tsx,json,css,md}\"",
       "type-check": "tsc --noEmit"
     }
   }
   ```

6. **Format Existing Code**
   ```bash
   # Format all code
   npm run format
   
   # Run linter
   npm run lint
   ```

**Validation**:
```bash
# Check formatting
npm run format:check

# Check linting
npm run lint

# Check TypeScript
npm run type-check

# All should pass without errors
```

**Acceptance Criteria**:
- [ ] Prettier configured and installed
- [ ] ESLint configured with Prettier integration
- [ ] Scripts added to package.json
- [ ] All existing code formatted
- [ ] Linting passes

**Common Pitfalls**:
- ⚠️ Make sure eslint-config-prettier is loaded LAST in extends array
- ⚠️ If format conflicts with lint, Prettier should win

**Reference PRD Sections**: 
- Development & Tooling (Page 2243-2252)

---

### Step 0.7: Create Project Directory Structure

**Objective**: Set up the complete folder structure as specified in the PRD.

**Implementation Details**:

1. **Create Directory Structure**
   ```bash
   # Navigate to project root
   cd /home/quza/charmdojo/charmdojov1
   
   # Create all directories at once
   mkdir -p src/app/\(auth\)/login
   mkdir -p src/app/\(auth\)/signup
   mkdir -p src/app/\(app\)/main-menu
   mkdir -p src/app/\(app\)/game/selection
   mkdir -p src/app/\(app\)/game/chat
   mkdir -p src/app/\(app\)/game/victory
   mkdir -p src/app/\(app\)/profile
   mkdir -p src/app/\(app\)/settings
   mkdir -p src/app/api/auth
   mkdir -p src/app/api/game
   mkdir -p src/app/api/chat
   mkdir -p src/app/api/reward
   mkdir -p src/app/api/user
   mkdir -p src/app/api/subscription
   mkdir -p src/components/auth
   mkdir -p src/components/game
   mkdir -p src/components/chat
   mkdir -p src/components/layout
   mkdir -p src/lib/supabase
   mkdir -p src/lib/ai
   mkdir -p src/lib/stripe
   mkdir -p src/lib/utils
   mkdir -p src/lib/validations
   mkdir -p src/hooks
   mkdir -p src/types
   mkdir -p src/prompts
   mkdir -p src/data
   mkdir -p public/images
   mkdir -p public/fallback-images
   mkdir -p supabase/migrations
   ```

2. **Create .gitkeep Files (to track empty directories)**
   ```bash
   # Add .gitkeep to empty directories
   touch src/components/auth/.gitkeep
   touch src/components/game/.gitkeep
   touch src/components/chat/.gitkeep
   touch src/lib/ai/.gitkeep
   touch src/lib/stripe/.gitkeep
   touch src/prompts/.gitkeep
   touch src/data/.gitkeep
   touch public/fallback-images/.gitkeep
   touch supabase/migrations/.gitkeep
   ```

3. **Create Placeholder Data Files**
   
   Create file: `src/data/girl_names.txt`
   ```
   Emma, Olivia, Sophia, Isabella, Mia, Charlotte, Amelia, Harper, Evelyn, Abigail
   ```
   
   Create file: `src/data/ethnicity_list.txt`
   ```
   Caucasian, Asian, Hispanic/Latina, African American, Middle Eastern, Mixed race
   ```
   
   Create file: `src/data/hairstyle_list.txt`
   ```
   Long straight, Long wavy, Long curly, Medium length straight, Short bob
   ```
   
   Create file: `src/data/haircolor_list.txt`
   ```
   Blonde, Brunette, Black, Auburn, Red, Light brown
   ```
   
   Create file: `src/data/eyecolor_list.txt`
   ```
   Blue, Green, Brown, Hazel, Gray
   ```
   
   Create file: `src/data/bodytype_list.txt`
   ```
   Slim, Athletic, Curvy, Average, Fit
   ```
   
   Create file: `src/data/setting_list.txt`
   ```
   Outdoor park, Coffee shop, Urban street, Beach, Mountain hiking trail
   ```

**Code Structure**:
```
charmdojov1/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Auth route group
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (app)/               # Protected app routes
│   │   │   ├── main-menu/
│   │   │   ├── game/
│   │   │   │   ├── selection/
│   │   │   │   ├── chat/
│   │   │   │   └── victory/
│   │   │   ├── profile/
│   │   │   └── settings/
│   │   ├── api/                 # API routes
│   │   │   ├── auth/
│   │   │   ├── game/
│   │   │   ├── chat/
│   │   │   ├── reward/
│   │   │   ├── user/
│   │   │   └── subscription/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                  # shadcn components
│   │   ├── auth/
│   │   ├── game/
│   │   ├── chat/
│   │   └── layout/
│   ├── lib/
│   │   ├── supabase/
│   │   ├── ai/
│   │   ├── stripe/
│   │   ├── utils/
│   │   └── validations/
│   ├── hooks/
│   ├── types/
│   ├── prompts/                 # AI prompt templates
│   └── data/                    # Static data files
├── public/
│   ├── images/
│   └── fallback-images/
├── supabase/
│   └── migrations/
└── PRPs/
```

**Validation**:
```bash
# Verify directory structure
tree src/ -L 3
# Or use ls -R if tree is not installed

# Check data files exist
ls src/data/
# Should see all .txt files

# Verify git tracks .gitkeep files
git add .
git status
```

**Acceptance Criteria**:
- [ ] All directories created as per PRD structure
- [ ] Data files created with sample content
- [ ] .gitkeep files in empty directories
- [ ] Directory structure matches PRD specification

**Common Pitfalls**:
- ⚠️ Parentheses in directory names (auth), (app) create route groups in Next.js
- ⚠️ Don't forget to escape parentheses in bash: \( and \)

**Reference PRD Sections**: 
- File Structure (Page 2294-2373)
- Data Files Content (Appendix B, Page 3142-3176)

---

### Phase 0 Completion Checklist

- [ ] Next.js 16 project initialized with TypeScript
- [ ] All dependencies installed (React 19, Tailwind 4.1, shadcn/ui, etc.)
- [ ] Git repository initialized with .gitignore
- [ ] Environment variables structure created (.env.example, .env.local, env.d.ts)
- [ ] Tailwind CSS configured with brand colors
- [ ] shadcn/ui initialized with essential components
- [ ] ESLint and Prettier configured
- [ ] Complete directory structure created
- [ ] Data files created with sample content
- [ ] Dev server runs successfully (npm run dev)
- [ ] Build completes successfully (npm run build)
- [ ] All linting/formatting passes

**Post-Phase Commit**:
```bash
git add .
git commit -m "Phase 0 complete: Foundation & Environment Setup"
```

---

