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

> **Note**: This project uses **Tailwind CSS v4** which has a different configuration approach than v3. Instead of using a `tailwind.config.ts` file, Tailwind v4 uses **CSS-based configuration** via the `@theme` directive and `@import "tailwindcss"`. This is the modern approach and provides better performance.

1. **Verify PostCSS Configuration**
   
   Check that `postcss.config.mjs` has the correct Tailwind v4 plugin:
   ```javascript
   const config = {
     plugins: {
       "@tailwindcss/postcss": {},
     },
   };
   
   export default config;
   ```

2. **Configure globals.css with Brand Colors**
   
   Update file: `src/app/globals.css`
   ```css
   @import "tailwindcss";
   
   @theme {
     /* CharmDojo Brand Colors (from PRD) */
     --color-primary: #e15f6e;
     --color-primary-light: #ef8391;
     --color-primary-dark: #c73d4f;
     
     --color-secondary: #f53049;
     --color-secondary-light: #ff5a70;
     --color-secondary-dark: #d91c38;
     
     --color-accent: #f22a5a;
     --color-accent-light: #ff4d79;
     --color-accent-dark: #d11545;
     
     --color-neutral: #04060c;
     --color-neutral-50: #f8f9fa;
     --color-neutral-100: #e9ecef;
     --color-neutral-200: #dee2e6;
     --color-neutral-300: #adb5bd;
     --color-neutral-400: #6c757d;
     --color-neutral-500: #495057;
     --color-neutral-600: #343a40;
     --color-neutral-700: #212529;
     --color-neutral-800: #0a0d12;
     --color-neutral-900: #04060c;
     
     --color-success: #10b981;
     --color-success-light: #34d399;
     --color-success-dark: #059669;
     
     --color-warning: #f59e0b;
     --color-warning-light: #fbbf24;
     --color-warning-dark: #d97706;
     
     --color-error: #ef4444;
     --color-error-light: #f87171;
     --color-error-dark: #dc2626;
     
     /* shadcn/ui compatible colors (using CSS variables) */
     --color-background: oklch(0.15 0.02 240); /* Dark background #04060c */
     --color-foreground: oklch(1 0 0); /* White text */
     --color-card: oklch(0.2 0.02 240);
     --color-card-foreground: oklch(1 0 0);
     --color-popover: oklch(0.18 0.02 240);
     --color-popover-foreground: oklch(1 0 0);
     --color-muted: oklch(0.3 0.02 240);
     --color-muted-foreground: oklch(0.7 0 0);
     --color-border: oklch(0.35 0.02 240);
     --color-input: oklch(0.35 0.02 240);
     --color-ring: oklch(0.63 0.15 354);
     
     /* Radius */
     --radius: 0.5rem;
     --radius-lg: 0.5rem;
     --radius-md: calc(0.5rem - 2px);
     --radius-sm: calc(0.5rem - 4px);
     
     /* Animations */
     --animate-accordion-down: accordion-down 0.2s ease-out;
     --animate-accordion-up: accordion-up 0.2s ease-out;
     --animate-pulse-success: pulse-success 0.5s ease-in-out;
     --animate-pulse-error: pulse-error 0.5s ease-in-out;
   }
   
   @keyframes accordion-down {
     from { height: 0; }
     to { height: var(--radix-accordion-content-height); }
   }
   
   @keyframes accordion-up {
     from { height: var(--radix-accordion-content-height); }
     to { height: 0; }
   }
   
   @keyframes pulse-success {
     0%, 100% { opacity: 1; }
     50% { opacity: 0.7; background-color: #10b981; }
   }
   
   @keyframes pulse-error {
     0%, 100% { opacity: 1; }
     50% { opacity: 0.7; background-color: #ef4444; }
   }
   
   @layer base {
     * {
       @apply border-border;
     }
     body {
       @apply bg-neutral-900 text-white;
     }
   }
   ```

**Usage Examples**:

After configuration, you can use the brand colors in your components:

```tsx
// Using brand colors
<div className="bg-primary text-white">Primary Button</div>
<div className="bg-secondary hover:bg-secondary-dark">Secondary</div>
<div className="bg-neutral-900 text-neutral-100">Dark Background</div>
<div className="text-success">Success message</div>
<div className="text-error">Error message</div>

// Using radius
<div className="rounded-lg">Rounded corners</div>

// Using animations
<div className="animate-pulse-success">Pulsing success</div>
```

**API Endpoints Used**: None

**Validation**:
```bash
# Start dev server and check styling
npm run dev

# Build to check for CSS errors
npm run build

# Should complete without CSS errors

# Check that Tailwind classes work by temporarily adding to page.tsx:
# <div className="bg-primary text-white p-4">Test Primary Color</div>
```

**Acceptance Criteria**:
- [ ] PostCSS config uses @tailwindcss/postcss plugin
- [ ] Brand colors defined in @theme directive
- [ ] CSS variables compatible with shadcn/ui
- [ ] Dev server shows no CSS warnings
- [ ] Build completes successfully
- [ ] Test classes render with correct colors

**Common Pitfalls**:
- ⚠️ Tailwind v4 does NOT use `tailwind.config.ts` - configuration is in CSS
- ⚠️ Must use `@import "tailwindcss"` instead of `@tailwind` directives
- ⚠️ Color format can be hex, rgb, oklch - oklch provides better perceptual uniformity
- ⚠️ The `@tailwindcss/postcss` plugin must be in postcss.config.mjs
- ⚠️ If you see "Unknown at rule @theme" warnings in VSCode, install the Tailwind CSS IntelliSense extension

**Reference PRD Sections**: 
- Landing Page & Navigation (Page 1008-1035)
- Technology Stack (Page 2153-2254) - Tailwind CSS 4.1.16
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

> **Note**: Next.js 16 uses ESLint 9 with the new flat config format (`eslint.config.mjs`). The old `.eslintrc.json` format is no longer supported. Also, Next.js 16 does NOT have a `next lint` command - we use ESLint directly.

1. **Install ESLint, Prettier and Extensions**
   ```bash
   # Core ESLint packages
   npm install --save-dev eslint@^9.38.0 eslint-config-next
   
   # TypeScript ESLint support
   npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser
   
   # Prettier and ESLint integration
   npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier
   
   # Compatibility layer for flat config
   npm install --save-dev @eslint/eslintrc
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

4. **Create eslint.config.mjs (Flat Config)**
   
   Create file: `eslint.config.mjs`
   ```javascript
   import nextPlugin from "eslint-config-next";
   import tseslint from "@typescript-eslint/eslint-plugin";
   import tsparser from "@typescript-eslint/parser";
   
   const config = [
     {
       ignores: [".next/*", "node_modules/*", "out/*", ".cache/*"],
     },
     ...nextPlugin,
     {
       files: ["**/*.ts", "**/*.tsx"],
       languageOptions: {
         parser: tsparser,
         parserOptions: {
           ecmaVersion: "latest",
           sourceType: "module",
         },
       },
       plugins: {
         "@typescript-eslint": tseslint,
       },
       rules: {
         "@typescript-eslint/no-unused-vars": ["warn", {
           argsIgnorePattern: "^_",
           varsIgnorePattern: "^_",
         }],
         "@typescript-eslint/no-explicit-any": "warn",
         "react-hooks/exhaustive-deps": "warn",
         "no-console": ["warn", { allow: ["warn", "error"] }],
       },
     },
   ];
   
   export default config;
   ```

5. **Add Scripts to package.json**
   
   Add to `package.json` scripts section:
   ```json
   {
     "scripts": {
       "dev": "next dev",
       "build": "next build",
       "start": "next start",
       "lint": "eslint .",
       "lint:fix": "eslint . --fix",
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
- [ ] ESLint 9 installed with flat config
- [ ] Prettier configured and installed
- [ ] eslint.config.mjs created (NOT .eslintrc.json)
- [ ] Scripts added to package.json
- [ ] All existing code formatted
- [ ] Linting passes with no errors

**Common Pitfalls**:
- ⚠️ Next.js 16 does NOT support `next lint` command - use `eslint .` directly
- ⚠️ ESLint 9 requires flat config format (`eslint.config.mjs`), NOT `.eslintrc.json`
- ⚠️ Do NOT use `--ext` flag with ESLint 9 (it's deprecated in flat config)
- ⚠️ Make sure `eslint-config-next` version matches your Next.js version
- ⚠️ If you see "Converting circular structure to JSON" errors, ensure you're using the exact config format above

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

## Phase 1: Database & Infrastructure

### Overview

**Goal**: Set up Supabase backend, create complete database schema, implement Row Level Security (RLS), and configure database connection in Next.js application.

**Duration Estimate**: 2-3 days (Medium complexity)

**Success Criteria**:
- [ ] Supabase project created and configured
- [ ] All database tables created with proper types and constraints
- [ ] Row Level Security policies implemented and tested for all tables
- [ ] Database connection working from Next.js application
- [ ] Migration system in place for version control
- [ ] Test data successfully inserted and retrieved
- [ ] RLS policies prevent unauthorized access

**Dependencies**: 
- Phase 0 complete (Next.js project set up)
- Supabase account created (free tier is sufficient)

**Deliverables**:
- Fully configured Supabase project
- Complete database schema with 5 core tables (users, game_rounds, messages, rewards, subscriptions)
- Working RLS policies for data isolation
- Supabase client library integrated in Next.js
- Migration files for reproducible database setup
- Type-safe database client with TypeScript types

### Technical Foundation

This phase establishes the entire backend infrastructure using Supabase, which provides PostgreSQL database, authentication, real-time subscriptions, and file storage in one platform.

**Why Supabase?**
1. **Integrated Auth**: Built-in authentication with email/password and OAuth
2. **Real-time**: WebSocket subscriptions out of the box
3. **Row Level Security**: PostgreSQL RLS for secure multi-tenant data
4. **Auto-generated APIs**: REST and GraphQL APIs automatically created
5. **TypeScript Support**: Generate types from database schema
6. **Generous Free Tier**: Sufficient for development and early production

**Key Technologies/Patterns**:
- **PostgreSQL 15+**: Relational database with JSONB support, full-text search
- **Row Level Security (RLS)**: Database-level authorization using `auth.uid()`
- **Supabase Client**: `@supabase/supabase-js` for type-safe queries
- **Database Migrations**: Version-controlled schema changes using SQL migration files
- **Foreign Keys**: Enforce referential integrity and enable cascading deletes

**Architecture Decisions**:
- **Use Supabase Storage for Media**: Images and audio files in CDN-backed storage, not database
- **RLS Over Application-Level Auth**: Security at database layer prevents data leaks
- **UUID Primary Keys**: Better for distributed systems, no sequential ID guessing
- **Soft Deletes Where Appropriate**: Keep audit trail for users and subscriptions
- **Indexes on Foreign Keys**: Optimize join performance and lookups
- **TIMESTAMPTZ for Dates**: Store timestamps with timezone information

---

### Step 1.1: Create and Configure Supabase Project

**Objective**: Set up a new Supabase project and obtain necessary API credentials.

**Implementation Details**:

1. **Create Supabase Account and Project**
   
   Visit https://supabase.com and sign up (if not already done)
   
   ```bash
   # After signing in:
   # 1. Click "New Project"
   # 2. Enter project details:
   #    - Name: charmdojo (or charmdojo-dev for development)
   #    - Database Password: Generate strong password and save securely
   #    - Region: Choose closest to your users (e.g., us-west-1)
   #    - Pricing Plan: Free (sufficient for development)
   # 3. Click "Create new project"
   # 4. Wait 2-3 minutes for project initialization
   ```

2. **Retrieve API Credentials**
   
   After project creation:
   ```bash
   # Navigate to: Settings > API
   # Copy the following values:
   # - Project URL: https://xxxxx.supabase.co
   # - anon public key: eyJhbGc...
   # - service_role key: eyJhbGc... (keep this secret!)
   ```

3. **Update Environment Variables**
   
   Update file: `.env.local`
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```
   
   Also update: `.env.example` (with placeholder text, not real keys)

4. **Install Supabase Client Library**
   ```bash
   npm install @supabase/supabase-js
   ```

5. **Verify Connection**
   
   Create a test file: `src/lib/supabase/test-connection.ts`
   ```typescript
   import { createClient } from '@supabase/supabase-js';
   
   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
   const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
   
   export const supabase = createClient(supabaseUrl, supabaseKey);
   
   // Test connection
   export async function testConnection() {
     const { data, error } = await supabase.from('_test').select('*').limit(1);
     if (error && error.code !== 'PGRST116') { // PGRST116 = table not found (expected)
       console.error('Supabase connection error:', error);
       return false;
     }
     console.log('✅ Supabase connected successfully');
     return true;
   }
   ```

**Validation**:
```bash
# Verify environment variables are loaded
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"

# Should output your Supabase URL, not undefined

# Test connection (will fail if credentials are wrong)
npm run dev
# Then visit any page - check console for connection test
```

**Acceptance Criteria**:
- [ ] Supabase project created and accessible at dashboard
- [ ] Project URL and API keys copied to `.env.local`
- [ ] `.env.local` is gitignored (verify with `git status`)
- [ ] Supabase client library installed in package.json
- [ ] Test connection file created
- [ ] No console errors related to Supabase connection

**Common Pitfalls**:
- ⚠️ **Never commit** `.env.local` - it contains secrets
- ⚠️ Don't confuse `anon` key (public, safe for frontend) with `service_role` key (secret, backend only)
- ⚠️ Database password is separate from API keys - save it securely for direct database access
- ⚠️ Free tier has limits: 500MB database, 1GB file storage, 2GB bandwidth - sufficient for development

**Reference PRD Sections**: 
- Technology Stack > Backend Stack (Page 2172-2179)
- Environment Variables Structure (Page 2259-2292)

---

### Step 1.2: Design and Create Database Schema

**Objective**: Create all required database tables with proper relationships, constraints, and indexes.

**Implementation Details**:

1. **Access Supabase SQL Editor**
   
   ```bash
   # In Supabase Dashboard:
   # 1. Go to "SQL Editor" in left sidebar
   # 2. Click "New Query"
   # 3. We'll execute SQL directly here
   ```

2. **Create Database Tables - Part 1: Enable Extensions and Users Table**
   
   Execute this SQL in Supabase SQL Editor:
   
   ```sql
   -- Enable UUID extension
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   
   -- ======================
   -- USERS TABLE
   -- ======================
   -- Note: Supabase Auth automatically creates auth.users table
   -- We create a public.users table for additional profile data
   
   CREATE TABLE public.users (
       id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
       email TEXT UNIQUE NOT NULL,
       name TEXT,
       avatar_url TEXT,
       created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
       updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
       total_rounds INTEGER DEFAULT 0 NOT NULL,
       total_wins INTEGER DEFAULT 0 NOT NULL,
       total_losses INTEGER DEFAULT 0 NOT NULL,
       best_streak INTEGER DEFAULT 0 NOT NULL,
       current_streak INTEGER DEFAULT 0 NOT NULL,
       CONSTRAINT users_total_rounds_positive CHECK (total_rounds >= 0),
       CONSTRAINT users_total_wins_positive CHECK (total_wins >= 0),
       CONSTRAINT users_total_losses_positive CHECK (total_losses >= 0),
       CONSTRAINT users_streaks_positive CHECK (best_streak >= 0 AND current_streak >= 0)
   );
   
   -- Indexes for users table
   CREATE INDEX idx_users_email ON public.users(email);
   CREATE INDEX idx_users_created_at ON public.users(created_at DESC);
   ```

3. **Complete the Remaining Tables**
   
   Due to length, the complete SQL for the remaining tables (game_rounds, messages, rewards, subscriptions), functions, and triggers is available in: `PRPs/phase1-step2-continuation.md`
   
   Copy and execute that SQL in the Supabase SQL Editor to create:
   - game_rounds table with proper constraints
   - messages table with conversation data
   - rewards table for win assets
   - subscriptions table for Stripe integration
   - Triggers for updated_at automation
   - Function to auto-create user profiles on signup

4. **Save Migration File Locally**
   
   Create file: `supabase/migrations/001_initial_schema.sql`
   
   Copy the entire SQL (Part 1 + contents from continuation file) into this file for version control.

**Code Structure**:
```
supabase/
├── migrations/
│   └── 001_initial_schema.sql    # Complete schema creation SQL
└── seed.sql                       # Test data (will create in Step 1.5)
```

**Validation**:
```sql
-- In Supabase SQL Editor, verify tables and constraints:

-- Check all tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
-- Expected: game_rounds, messages, rewards, subscriptions, users

-- Verify foreign key constraints
SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public';
```

**Acceptance Criteria**:
- [ ] All 5 tables created (users, game_rounds, messages, rewards, subscriptions)
- [ ] Foreign key relationships properly configured
- [ ] Check constraints prevent invalid data
- [ ] Indexes created on foreign keys and frequently queried columns
- [ ] Triggers created for updated_at and user profile creation
- [ ] Migration file saved in `supabase/migrations/`
- [ ] Validation queries return expected results

**Common Pitfalls**:
- ⚠️ `public.users` table is separate from `auth.users` - don't confuse them
- ⚠️ UUIDs need quotes in SQL: `'123e4567-e89b-12d3-a456-426614174000'`
- ⚠️ TIMESTAMPTZ (with timezone) is better than TIMESTAMP for global apps
- ⚠️ CASCADE DELETE is intentional - when user deletes account, all their data goes too
- ⚠️ Don't manually insert into `users` table - the trigger handles it on signup

**Reference PRD Sections**: 
- Data Models > Database Schema (Page 1750-1827)
- Table Definitions (Page 1829-2021)

---

### Step 1.3: Implement Row Level Security Policies

**Objective**: Set up RLS policies to ensure users can only access their own data.

**Implementation Details**:

Row Level Security (RLS) is PostgreSQL's built-in feature that enforces access control at the database level. This is crucial for multi-tenant applications where users should only see their own data.

1. **Enable RLS on All Tables**
   
   Execute this SQL in Supabase SQL Editor:
   
   ```sql
   -- Enable RLS on all tables
   ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.game_rounds ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
   ```

2. **Create RLS Policies for Users Table**
   
   ```sql
   -- Users can view their own profile
   CREATE POLICY "Users can view own data"
       ON public.users FOR SELECT
       USING (auth.uid() = id);
   
   -- Users can update their own profile
   CREATE POLICY "Users can update own data"
       ON public.users FOR UPDATE
       USING (auth.uid() = id);
   
   -- Note: INSERT is handled by trigger, no policy needed
   ```

3. **Create RLS Policies for Game Rounds**
   
   ```sql
   -- Users can view their own rounds
   CREATE POLICY "Users can view own rounds"
       ON public.game_rounds FOR SELECT
       USING (auth.uid() = user_id);
   
   -- Users can insert their own rounds
   CREATE POLICY "Users can insert own rounds"
       ON public.game_rounds FOR INSERT
       WITH CHECK (auth.uid() = user_id);
   
   -- Users can update their own rounds
   CREATE POLICY "Users can update own rounds"
       ON public.game_rounds FOR UPDATE
       USING (auth.uid() = user_id);
   ```

4. **Create RLS Policies for Messages**
   
   ```sql
   -- Users can view messages from their own rounds
   CREATE POLICY "Users can view messages from own rounds"
       ON public.messages FOR SELECT
       USING (
           EXISTS (
               SELECT 1 FROM public.game_rounds
               WHERE game_rounds.id = messages.round_id
               AND game_rounds.user_id = auth.uid()
           )
       );
   
   -- Users can insert messages to their own rounds
   CREATE POLICY "Users can insert messages to own rounds"
       ON public.messages FOR INSERT
       WITH CHECK (
           EXISTS (
               SELECT 1 FROM public.game_rounds
               WHERE game_rounds.id = messages.round_id
               AND game_rounds.user_id = auth.uid()
           )
       );
   ```

5. **Create RLS Policies for Rewards and Subscriptions**
   
   ```sql
   -- Rewards policies
   CREATE POLICY "Users can view rewards from own rounds"
       ON public.rewards FOR SELECT
       USING (
           EXISTS (
               SELECT 1 FROM public.game_rounds
               WHERE game_rounds.id = rewards.round_id
               AND game_rounds.user_id = auth.uid()
           )
       );
   
   -- Subscriptions policies
   CREATE POLICY "Users can view own subscription"
       ON public.subscriptions FOR SELECT
       USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can update own subscription"
       ON public.subscriptions FOR UPDATE
       USING (auth.uid() = user_id);
   ```

**Validation**:
```sql
-- Test RLS by querying as different users
-- This should return empty if no user is authenticated:
SELECT * FROM public.users;

-- Check that policies are created:
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public';
```

**Acceptance Criteria**:
- [ ] RLS enabled on all 5 tables
- [ ] SELECT policies prevent cross-user data access
- [ ] INSERT/UPDATE policies enforce user ownership
- [ ] Policies use `auth.uid()` to check authentication
- [ ] All policies listed in pg_policies view

**Common Pitfalls**:
- ⚠️ Without RLS enabled, ALL data is accessible - always enable RLS
- ⚠️ `auth.uid()` returns NULL for unauthenticated requests
- ⚠️ Test RLS with actual authenticated users, not service role
- ⚠️ Be careful with USING vs WITH CHECK clauses (USING for read, WITH CHECK for write)

**Reference PRD Sections**: 
- Security Architecture (Page 1301-1342)
- Data Models (Page 1750-1827)

---

### Step 1.4: Configure Supabase Client in Next.js

**Objective**: Create properly configured Supabase clients for both client-side and server-side usage.

**Implementation Details**:

Supabase provides different client configurations for client-side (browser) and server-side (API routes, Server Components) usage. We need both.

1. **Create Client-Side Supabase Client**
   
   Create file: `src/lib/supabase/client.ts`
   ```typescript
   import { createBrowserClient } from '@supabase/ssr';
   import { Database } from '@/types/database';
   
   export function createClient() {
     return createBrowserClient<Database>(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
     );
   }
   ```

2. **Create Server-Side Supabase Client**
   
   Create file: `src/lib/supabase/server.ts`
   ```typescript
   import { createServerClient } from '@supabase/ssr';
   import { cookies } from 'next/headers';
   import { Database } from '@/types/database';
   
   export async function createClient() {
     const cookieStore = await cookies();
   
     return createServerClient<Database>(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
       {
         cookies: {
           getAll() {
             return cookieStore.getAll();
           },
           setAll(cookiesToSet) {
             try {
               cookiesToSet.forEach(({ name, value, options }) =>
                 cookieStore.set(name, value, options)
               );
             } catch {
               // The `setAll` method was called from a Server Component.
               // This can be ignored if you have middleware refreshing
               // user sessions.
             }
           },
         },
       }
     );
   }
   ```

3. **Create Middleware for Session Management**
   
   Create file: `src/middleware.ts`
   ```typescript
   import { createServerClient } from '@supabase/ssr';
   import { NextResponse, type NextRequest } from 'next/server';
   
   export async function middleware(request: NextRequest) {
     let response = NextResponse.next({
       request: {
         headers: request.headers,
       },
     });
   
     const supabase = createServerClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
       {
         cookies: {
           getAll() {
             return request.cookies.getAll();
           },
           setAll(cookiesToSet) {
             cookiesToSet.forEach(({ name, value, options }) =>
               request.cookies.set(name, value)
             );
             response = NextResponse.next({
               request,
             });
             cookiesToSet.forEach(({ name, value, options }) =>
               response.cookies.set(name, value, options)
             );
           },
         },
       }
     );
   
     // Refresh session if expired
     await supabase.auth.getUser();
   
     return response;
   }
   
   export const config = {
     matcher: [
       '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
     ],
   };
   ```

4. **Install Required Packages**
   ```bash
   npm install @supabase/ssr
   ```

5. **Generate TypeScript Types from Database**
   
   ```bash
   # Install Supabase CLI
   npx supabase login
   
   # Generate types (replace with your project ref)
   npx supabase gen types typescript --project-id your-project-ref > src/types/database.ts
   ```
   
   Alternatively, create types manually based on your schema.

**Code Structure**:
```
src/
├── lib/
│   └── supabase/
│       ├── client.ts        # Browser client
│       ├── server.ts        # Server client  
│       └── test-connection.ts # From Step 1.1
├── middleware.ts            # Session refresh
└── types/
    └── database.ts          # Generated types
```

**Validation**:
```bash
# Test in API route
# Create src/app/api/test/route.ts:
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('users').select('count');
  return NextResponse.json({ data, error });
}

# Visit http://localhost:3000/api/test
# Should return count (even if 0)
```

**Acceptance Criteria**:
- [ ] Client-side Supabase client created
- [ ] Server-side Supabase client created
- [ ] Middleware configured for session management
- [ ] @supabase/ssr package installed
- [ ] Database types generated or created
- [ ] Test API route returns data successfully

**Common Pitfalls**:
- ⚠️ Don't use client-side client in Server Components or API routes
- ⚠️ Always use `await cookies()` in Next.js 15+ (it's async now)
- ⚠️ Middleware must be in root `src/` directory, not `src/app/`
- ⚠️ Type generation requires Supabase CLI and project access

**Reference PRD Sections**: 
- Technology Stack > Backend Stack (Page 2172-2179)
- File Structure (Page 2294-2373)

---

### Step 1.5: Create Database Seed Data

**Objective**: Create test/seed data for development and testing.

**Implementation Details**:

1. **Create Seed SQL File**
   
   Create file: `supabase/seed.sql`
   ```sql
   -- Insert test user (assuming auth.users already has a test user)
   -- Replace with actual test user UUID
   INSERT INTO public.users (id, email, name, total_rounds, total_wins, total_losses)
   VALUES 
       ('00000000-0000-0000-0000-000000000001', 'test@charmdojo.com', 'Test User', 0, 0, 0)
   ON CONFLICT (id) DO NOTHING;
   
   -- Insert a test game round
   INSERT INTO public.game_rounds (
       id, user_id, girl_name, girl_image_url, girl_description,
       initial_meter, final_meter, result, message_count, started_at, completed_at
   )
   VALUES (
       '10000000-0000-0000-0000-000000000001',
       '00000000-0000-0000-0000-000000000001',
       'Emma',
       'https://placeholder.com/girl1.jpg',
       'A beautiful woman with long blonde hair and blue eyes...',
       20,
       75,
       'win',
       12,
       NOW() - INTERVAL '1 hour',
       NOW() - INTERVAL '30 minutes'
   )
   ON CONFLICT (id) DO NOTHING;
   
   -- Insert test messages for the round
   INSERT INTO public.messages (round_id, role, content, success_delta, meter_after, category, created_at)
   VALUES 
       ('10000000-0000-0000-0000-000000000001', 'user', 'Hey! I love your hiking photos', 5, 25, 'good', NOW() - INTERVAL '55 minutes'),
       ('10000000-0000-0000-0000-000000000001', 'assistant', 'Thanks! Do you hike too?', NULL, 25, NULL, NOW() - INTERVAL '54 minutes'),
       ('10000000-0000-0000-0000-000000000001', 'user', 'Yeah, just did Eagle Peak last weekend', 6, 31, 'good', NOW() - INTERVAL '50 minutes')
   ON CONFLICT (id) DO NOTHING;
   ```

2. **Run Seed Data**
   
   In Supabase Dashboard > SQL Editor, run the seed.sql file.

3. **Verify Seed Data**
   ```sql
   -- Check users
   SELECT * FROM public.users;
   
   -- Check game rounds
   SELECT * FROM public.game_rounds;
   
   -- Check messages
   SELECT * FROM public.messages;
   ```

**Validation**:
```bash
# Test querying seed data from Next.js
# Update src/app/api/test/route.ts:
const { data: users } = await supabase.from('users').select('*');
const { data: rounds } = await supabase.from('game_rounds').select('*');
return NextResponse.json({ users, rounds });

# Should return test data
```

**Acceptance Criteria**:
- [ ] Seed SQL file created with test data
- [ ] Test user inserted (or linked to auth.users)
- [ ] Test game round with messages inserted
- [ ] All seed data visible in Supabase dashboard
- [ ] Seed data queryable from Next.js

**Common Pitfalls**:
- ⚠️ UUIDs in seed data should be valid format
- ⚠️ Foreign key constraints must be satisfied (user must exist before rounds)
- ⚠️ Use `ON CONFLICT DO NOTHING` to allow re-running seed script
- ⚠️ Timestamps should be in past for realistic test data

**Reference PRD Sections**: 
- Data Models (Page 1750-1827)

---

### Phase 1 Completion Checklist

- [ ] Supabase project created and accessible
- [ ] All environment variables configured in `.env.local`
- [ ] Database schema created (5 tables with constraints)
- [ ] All indexes created on foreign keys
- [ ] Triggers and functions implemented
- [ ] RLS enabled on all tables
- [ ] RLS policies created and tested
- [ ] Client-side Supabase client configured
- [ ] Server-side Supabase client configured
- [ ] Middleware configured for session management
- [ ] Database types generated
- [ ] Migration file saved (`001_initial_schema.sql`)
- [ ] Seed data created and loaded
- [ ] Test API route successfully queries database
- [ ] No RLS policy violations when querying

**Post-Phase Commit**:
```bash
git add .
git commit -m "Phase 1 complete: Database & Infrastructure - Supabase configured with RLS"
```

**Next Steps**: 
Proceed to Phase 2: Authentication System (Email/Password and OAuth integration)

---

