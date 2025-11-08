# AI Mentor Wall (Prep Mode)

Weekend hackathon scaffold: Supabase tables, Next.js UI, and a dry-run `/api/answer` that stores questions only. OpenAI + service role wiring stay server-only and remain disabled until we are on-site.

## Environment variables

Create `.env.local` (not committed) and copy from `.env.local.example`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Optional phase 2
ALGOLIA_APP_ID=
ALGOLIA_SEARCH_API_KEY=
ALGOLIA_ADMIN_API_KEY=
ALGOLIA_INDEX=mentor_questions
```

## Database + RLS

- Schema + policies live in `supabase/migrations/*`.
- Tables: `profiles`, `posts`, and `replies`, each guarded by row-level security.
- Realtime is enabled for `posts` and `replies` so the wall updates live.

## Dev scripts

```bash
npm install
npm run dev
# npm run build && npm start for prod preview
```

## Prep mode behavior (today)

1. UI calls `insertQuestion` with the public anon key.
2. `/api/answer` inserts another `questions` row (status `pending`) for parity, then exits early with `{ note: 'dry-run: enable on-site' }`.
3. No OpenAI requests or service-role writes occur; `supabaseAdmin` exports `null` until `SUPABASE_SERVICE_ROLE_KEY` is provided.

## Go-live checklist (tomorrow)

1. Apply `supabase/schema.sql` via the Supabase SQL editor.
2. Fill in `OPENAI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` inside `.env.local`.
3. Enhance `/api/answer` to:
   - Fetch pending questions.
   - Call OpenAI chat completions with the mentor prompt.
   - Insert into `public.answers` using `supabaseAdmin`.
   - Update `public.questions.status = 'answered'`.
4. (Optional) Add Supabase Realtime to stream answers.
5. (Optional) Enable Supabase Auth (magic links) and tighten the RLS policies.
6. (Optional) Index questions in Algolia and expose search.
