-- Prepare Supabase schema for AI Mentor Wall
create extension if not exists pgcrypto;

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  title text not null,
  details text null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  model text not null,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.questions enable row level security;
alter table public.answers enable row level security;

-- Demo-friendly RLS (tighten later when auth is added)
drop policy if exists "q_select" on public.questions;
drop policy if exists "q_insert" on public.questions;
drop policy if exists "a_select" on public.answers;
drop policy if exists "a_insert" on public.answers;

create policy "q_select" on public.questions
  for select using (true);

create policy "q_insert" on public.questions
  for insert with check (true);

create policy "a_select" on public.answers
  for select using (true);

-- For MVP the server route will insert answers using service role (tomorrow)
create policy "a_insert" on public.answers
  for insert with check (true);
