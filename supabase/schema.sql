create table transactions (
  id uuid primary key default gen_random_uuid(),
  amount numeric not null,
  currency text not null default 'USD',
  merchant_name text not null,
  status text not null check (status in ('flagged', 'approved', 'declined', 'pending')),
  risk_score integer not null check (risk_score between 0 and 100),
  created_at timestamptz not null default now(),
  user_id uuid not null,
  risk_factors text[] not null default '{}'
);

create table user_credit_limits (
  user_id uuid primary key,
  credit_limit numeric not null,
  reason text,
  updated_at timestamptz not null default now()
);

alter table transactions enable row level security;
create policy "Allow anon read" on transactions for select using (true);
create policy "Allow anon insert" on transactions for insert with check (true);
create policy "Allow anon update" on transactions for update using (true);

alter table user_credit_limits enable row level security;
create policy "Allow anon all" on user_credit_limits for all using (true);

create table profiles (
  user_id uuid primary key,
  email text unique not null,
  display_name text
);

alter table profiles enable row level security;
create policy "Allow anon read" on profiles for select using (true);
