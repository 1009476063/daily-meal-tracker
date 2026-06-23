create table users (
  id uuid primary key,
  email text unique not null,
  nickname text,
  avatar_url text,
  created_at timestamptz default now()
);

create table model_providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  base_url text not null,
  api_key_encrypted text,
  default_model text not null,
  enabled boolean default true,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz default now()
);

create table meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  date date not null,
  meal_type text not null,
  photo_url text,
  photo_storage_key text,
  source text default 'ai',
  notes text,
  created_at timestamptz default now()
);

create table meal_items (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid references meals(id) on delete cascade,
  name text not null,
  ingredients jsonb default '[]'::jsonb,
  portion_grams numeric,
  kcal numeric,
  protein_g numeric,
  fat_g numeric,
  carb_g numeric,
  fiber_g numeric,
  vitamin_summary jsonb default '{}'::jsonb,
  confidence text,
  ai_model text,
  is_manually_edited boolean default false,
  created_at timestamptz default now()
);

create table daily_summary (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  date date not null,
  total_kcal numeric,
  total_protein_g numeric,
  total_fat_g numeric,
  total_carb_g numeric,
  updated_at timestamptz default now(),
  unique(user_id, date)
);
