# Environment Variables Guide

This document describes all environment variables required for CharmDojo to function properly.

## Required Variables

### Supabase Configuration
```bash
# Your Supabase project URL (found in project settings)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co

# Supabase anonymous (public) key (found in project settings -> API)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase service role key (found in project settings -> API)
# ⚠️  KEEP THIS SECRET! Never expose in client-side code
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Google Cloud / Imagen Configuration
```bash
# Your Google Cloud Project ID
GOOGLE_CLOUD_PROJECT_ID=your-project-id

# Google Cloud region for Imagen API (default: europe-central2)
# Available regions: us-central1, europe-west4, asia-southeast1, europe-central2
GOOGLE_CLOUD_LOCATION=europe-central2

# Imagen model ID (default: imagen-4.0-fast-generate-001)
IMAGEN_MODEL_ID=imagen-4.0-fast-generate-001

# Path to your Google Cloud service account credentials JSON file
# Create this file from Google Cloud Console -> IAM & Admin -> Service Accounts
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
```

### Application Configuration
```bash
# Your application URL (used for callbacks, emails, etc.)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Optional Variables

### OpenAI Configuration (for chat and vision features)
```bash
# OpenAI API key (get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-...

# OpenAI organization ID (optional)
OPENAI_ORG_ID=org-...
```

### Voice Generation (for reward system)
```bash
# ElevenLabs API key (get from https://elevenlabs.io/app/settings/api-keys)
ELEVENLABS_API_KEY=...

# ElevenLabs voice ID for reward audio (default: Jessica voice)
ELEVENLABS_VOICE_ID=cgSgspJ2msm6clMCkdW9
```

### Stripe (for payments)
```bash
# Stripe secret key (get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_... or sk_live_...

# Stripe publishable key
STRIPE_PUBLISHABLE_KEY=pk_test_... or pk_live_...

# Stripe webhook secret (for webhook signature verification)
STRIPE_WEBHOOK_SECRET=whsec_...

# Public version of Stripe key (for client-side)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... or pk_live_...
```

### Analytics (optional)
```bash
# PostHog API key
NEXT_PUBLIC_POSTHOG_KEY=phc_...

# Sentry DSN for error tracking
SENTRY_DSN=https://...@sentry.io/...
```

## Setup Instructions

### 1. Google Cloud Setup for Imagen

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the Vertex AI API
4. Create a service account:
   - Go to IAM & Admin → Service Accounts
   - Click "Create Service Account"
   - Grant it the "Vertex AI User" role
   - Create a JSON key and download it
   - Save it as `google-credentials.json` in your project root
5. Note your Project ID from the project settings

### 2. Supabase Setup

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Go to Settings → API
4. Copy the Project URL and keys
5. Run the database migrations:
   ```bash
   # Using Supabase CLI (recommended)
   npx supabase db push
   
   # Or manually in the SQL Editor
   # Run the contents of supabase/migrations/001_initial_schema.sql
   # Run the contents of supabase/migrations/002_storage_buckets.sql
   ```

### 3. Create .env.local

Create a `.env.local` file in your project root with all the required variables:

```bash
# Copy this template and fill in your actual values
cp .env.example .env.local
```

Then edit `.env.local` with your actual credentials.

### 4. Verify Setup

Run the test scripts to verify everything is configured correctly:

```bash
# Test Imagen API connection
npm run test:imagen

# Test full girl image generation pipeline
npm run test:girl-images
```

## Security Notes

- ⚠️  **Never commit `.env.local` to git** - it's already in `.gitignore`
- ⚠️  **Never expose service role keys or secret keys in client-side code**
- ⚠️  Variables starting with `NEXT_PUBLIC_` are exposed to the browser
- ⚠️  Use different keys for development and production
- ⚠️  Rotate keys regularly, especially if compromised

## Troubleshooting

### "Missing GOOGLE_CLOUD_PROJECT_ID in environment"
- Ensure the variable is set in `.env.local`
- Restart your dev server after adding it

### "Failed to obtain Google Cloud access token"
- Check that `GOOGLE_APPLICATION_CREDENTIALS` points to a valid JSON file
- Ensure the service account has "Vertex AI User" permissions
- Verify the JSON file is valid and not corrupted

### "Error uploading image to Supabase"
- Verify Supabase credentials are correct
- Check that the `girl-images` storage bucket exists
- Run the storage bucket migration: `002_storage_buckets.sql`
- Verify bucket policies allow public read and authenticated write

### "Imagen API failed: 403"
- Ensure Vertex AI API is enabled in your Google Cloud project
- Check that your service account has the correct permissions
- Verify your project billing is enabled

## Cost Estimates

Based on current pricing (October 2025):

- **Imagen 4 Fast**: ~$0.04 per image
- **3 girl images per game**: ~$0.12 per generation
- **Supabase Storage**: Free for first 1GB, then $0.021/GB
- **OpenAI GPT-4**: ~$0.01-0.03 per conversation
- **ElevenLabs**: ~$0.18 per 1000 characters

Monitor your usage in each service's dashboard to avoid unexpected charges.

