create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  created_at timestamptz default now()
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  author uuid references auth.users(id) on delete set null,
  title text not null,
  body text not null,
  tags text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  author uuid references auth.users(id) on delete set null,
  body text not null,
  is_ai boolean default false,
  created_at timestamptz default now()
);

alter publication supabase_realtime add table posts, replies;

alter table posts enable row level security;
create policy "read posts" on posts for select using (true);
create policy "insert own posts" on posts for insert with check (auth.uid() = author);

alter table replies enable row level security;
create policy "read replies" on replies for select using (true);
create policy "insert own replies" on replies for insert with check (auth.uid() = author or is_ai = true);
