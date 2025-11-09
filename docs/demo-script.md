# 90-Second Demo Script

**0–15s — What it is**  
This is AI Mentor Wall: a realtime board for hackathon teams. Post blockers, see teammate updates instantly, and pull in an AI mentor for actionable help.

**15–35s — New post**  
I'll sign in with GitHub and post a blocker (API returns 500 when tag is empty).

**35–55s — Realtime proof**  
Here's a second tab on `/realtime`. The new post appears instantly without refresh. That's Supabase Realtime with RLS-safe read policies.

**55–75s — Ask mentor**  
Click Ask AI Mentor. If I click repeatedly, the API responds with 429 and the UI shows a retry toast—so we stay stable under load.

**75–90s — Wrap**  
Teams get a simple, fast way to collaborate; mentors get context; and everything works on a clean Supabase + Next stack ready for extensions (Algolia search, Figma frame critique).
