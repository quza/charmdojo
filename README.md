This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### 1. Setup Environment Variables

See [`ENV_SETUP.md`](./ENV_SETUP.md) for detailed environment variable setup instructions.

Quick setup:
```bash
cp .env.example .env.local
# Edit .env.local with your API keys
```

### 2. Run Database Migrations

```bash
# Using Supabase CLI (recommended)
npx supabase db push

# Or manually run SQL files in Supabase Dashboard
```

### 3. Start Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Testing

### Test Imagen API Connection
```bash
npm run test:imagen
```

### Test Girl Image Generation Pipeline
```bash
npm run test:girl-images
```

## Documentation

- [`ENV_SETUP.md`](./ENV_SETUP.md) - Environment variables and setup guide
- [`IMAGE_GENERATION_README.md`](./IMAGE_GENERATION_README.md) - Image generation system documentation
- [`IMPLEMENTATION_SUMMARY.md`](./IMPLEMENTATION_SUMMARY.md) - Latest implementation summary
- [`PRPs/PRD-v1.md`](./PRPs/PRD-v1.md) - Full product requirements document
- [`PRPs/IMPLEMENTATION-PLAN-SUMMARY.md`](./PRPs/IMPLEMENTATION-PLAN-SUMMARY.md) - Implementation roadmap

## Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier
npm run type-check       # TypeScript type checking
npm run test:imagen      # Test Imagen API
npm run test:girl-images # Test girl image generation
```

## Project Structure

```
charmdojov1/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth pages
│   │   ├── (app)/              # Protected app pages
│   │   └── api/                # API routes
│   │       └── game/
│   │           └── generate-girls/  # Girl generation endpoint
│   ├── components/             # React components
│   │   └── ui/                 # shadcn/ui components
│   ├── lib/
│   │   ├── ai/                 # AI integrations (Imagen)
│   │   ├── services/           # Business logic services
│   │   ├── supabase/           # Supabase clients & storage
│   │   └── utils/              # Utility functions
│   ├── types/                  # TypeScript types
│   ├── prompts/                # AI prompt templates
│   └── data/                   # Static data files
├── supabase/
│   └── migrations/             # Database migrations
├── PRPs/                       # Planning documents
└── public/                     # Static assets
```

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - Next.js features and API
- [Supabase Documentation](https://supabase.com/docs) - Supabase guides
- [Tailwind CSS](https://tailwindcss.com/docs) - Utility-first CSS
- [shadcn/ui](https://ui.shadcn.com/) - Re-usable components
- [Google Imagen](https://cloud.google.com/vertex-ai/docs/generative-ai/image/overview) - Image generation API

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
