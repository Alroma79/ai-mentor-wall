# AI Mentor Wall

Realtime design feedback wall with GitHub Auth, Supabase Realtime, and GPT-4o-mini.  
Live demo: https://ai-mentor-wall-production.up.railway.app

## Quickstart
```bash
pnpm install
pnpm dev
# open http://localhost:3000  (main app)
# open http://localhost:3000/realtime  (live viewer)
```

### How to verify realtime (judge steps)

Open two browsers:

A) `/` (sign in with GitHub)  
B) `/realtime` (incognito)

In A, create a post (Realtime proof).  
In B, the post appears within ~12s without refresh.

### Healthcheck

`GET /api/health` → `{ ok: true }`

### Env Vars

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
OPENAI_API_KEY=...
# Optional later:
ALGOLIA_APP_ID=...
ALGOLIA_ADMIN_KEY=...
ALGOLIA_SEARCH_KEY=...
ALGOLIA_INDEX_POSTS=ai-mentor-posts
ALGOLIA_INDEX_REPLIES=ai-mentor-replies
```

### Tech Stack

Next.js 16, React 19, Supabase (Auth/Realtime/RLS), Railway, Tailwind, TypeScript, OpenAI GPT-4o-mini.

### Notes

- Ask AI Mentor is rate-limited server-side (5s per user) and shows a client retry toast.  
- `/realtime` is a read-only stream view for quick demos.
