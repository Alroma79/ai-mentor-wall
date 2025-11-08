# AI Mentor Wall

Real-time teamwork board for weekend hackathons. Builders post blockers, teammates reply, and an AI mentor delivers concise guidance straight into the thread.

## Getting Started

1. Copy `.env.local.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`
4. Open `http://localhost:3000` and request a Supabase magic link to log in.
5. (Optional) Seed demo data: `SUPABASE_SERVICE_ROLE_KEY=... npx ts-node --esm scripts/seed.ts`

## GitHub OAuth setup

1. Create a GitHub OAuth app (Settings → Developer settings → OAuth Apps) with the callback URL `https://<your-supabase-project>.supabase.co/auth/v1/callback`. GitHub only accepts a single callback, so keep this Supabase URL.
2. In Supabase Dashboard → Authentication → Providers → GitHub, enable the provider and paste the GitHub Client ID and Secret.
3. Supabase Dashboard → Authentication → URL Configuration: set **Site URL** to your app callback (e.g. `http://localhost:3000/auth/callback` for dev, `https://your-app.vercel.app/auth/callback` for prod). Supabase will redirect OAuth flows to this page after finishing the exchange.
4. Set `NEXT_PUBLIC_SITE_URL` in `.env.local` to the same origin you configured above (including protocol). The `/auth/callback` page will complete `exchangeCodeForSession` and send users back to `/`.

## Database schema & policies

- Migrations live in `supabase/migrations/*`.
- Tables:
  - `profiles` extends `auth.users`
  - `posts` for wall entries (title, body, tags, author)
  - `replies` for human + AI responses
- Row level security rules:
  - Everyone can read posts/replies.
  - Authenticated users can insert posts/replies tied to their UID.
  - AI inserts are allowed when `is_ai = true`.
- Realtime is enabled on `posts` and `replies` so every client stays in sync.

## Features

- **Auth:** Supabase magic links (or GitHub if configured) guard posting/replying.
- **Wall UI:** New post form, tag chips, expandable threads, inline replies.
- **Realtime:** Live updates using Supabase Realtime channels for posts + replies.
- **AI mentor:** `/api/mentor` calls OpenAI `gpt-4o-mini`, writes back as an `is_ai` reply, and the UI shows an optimistic placeholder until the realtime payload lands.
- **Client search:** Filter posts by title, body, or tags without extra services.

## API

- `POST /api/mentor`
  - Body: `{ postId: string, prompt?: string }`
  - Response: `{ replyText: string }`
  - Persists the reply inside `replies` with `is_ai = true`.
- `GET /api/health`
  - Response: `{ ok: true, time: "<ISO timestamp>" }`
  - Used for Railway health checks / uptime probes.

## Screenshots (placeholders)

```
public/screenshot-wall.png
public/screenshot-thread.png
```

## How this meets judging criteria

- **User impact:** Keeps hackathon teams unblocked with a single collaborative wall + mentor.
- **Technical depth:** Next.js App Router, Supabase auth/RLS/realtime, streaming AI responses, optimistic UI, and SQL migrations.
- **Polish:** Tailwind-based UI, inline error states, realtime feedback, and upcoming seed/test tooling.
- **Extensibility:** Clear env contracts, composable components, and Supabase migrations make it easy to extend with search, analytics, or Algolia indexing.
