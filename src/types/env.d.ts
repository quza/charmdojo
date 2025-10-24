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
