-- ============================================
-- CNC Builder - Sistema de Persistência
-- ============================================
-- Execução: Copie e cole este script no SQL Editor do Supabase
-- Data: 2026-01-04
-- Versão: 1.0

-- ============================================
-- FUNÇÃO AUXILIAR: Atualizar updated_at
-- ============================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================
-- TABELA: projects (Projetos Salvos)
-- ============================================
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,

  -- Metadados do projeto
  name text not null,
  description text,

  -- Estado completo (JSONB para performance)
  config_chapa jsonb not null,
  config_corte jsonb not null,
  config_ferramenta jsonb not null,
  metodo_nesting text not null check (metodo_nesting in ('greedy', 'shelf', 'guillotine')),
  pecas jsonb not null default '[]'::jsonb, -- Array preserva ordem das peças

  -- Timestamps
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  last_opened_at timestamp with time zone,

  -- Organização
  is_favorite boolean default false,
  tags text[] default array[]::text[]
);

-- Índices para performance
create index if not exists projects_user_id_idx on public.projects(user_id);
create index if not exists projects_updated_at_idx on public.projects(updated_at desc);
create index if not exists projects_last_opened_at_idx on public.projects(last_opened_at desc nulls last);
create index if not exists projects_is_favorite_idx on public.projects(is_favorite) where is_favorite = true;
create index if not exists projects_name_search_idx on public.projects using gin(to_tsvector('portuguese', name));

-- Row Level Security
alter table public.projects enable row level security;

drop policy if exists "Users can view own projects" on public.projects;
create policy "Users can view own projects" on public.projects
  for select using (auth.uid() = user_id);

drop policy if exists "Users can create own projects" on public.projects;
create policy "Users can create own projects" on public.projects
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own projects" on public.projects;
create policy "Users can update own projects" on public.projects
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own projects" on public.projects;
create policy "Users can delete own projects" on public.projects
  for delete using (auth.uid() = user_id);

-- Trigger para atualizar updated_at
drop trigger if exists update_projects_updated_at on public.projects;
create trigger update_projects_updated_at before update on public.projects
  for each row execute function update_updated_at_column();

-- ============================================
-- TABELA: config_presets (Presets de Configuração)
-- ============================================
create table if not exists public.config_presets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,

  -- Metadados
  name text not null,
  description text,

  -- Configurações (JSONB - sempre completas: chapa + corte + ferramenta)
  config_chapa jsonb not null,
  config_corte jsonb not null,
  config_ferramenta jsonb not null,

  -- Timestamps
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),

  -- Organização
  is_favorite boolean default false
);

-- Índices
create index if not exists config_presets_user_id_idx on public.config_presets(user_id);
create index if not exists config_presets_is_favorite_idx on public.config_presets(is_favorite) where is_favorite = true;

-- RLS
alter table public.config_presets enable row level security;

drop policy if exists "Users can view own presets" on public.config_presets;
create policy "Users can view own presets" on public.config_presets
  for select using (auth.uid() = user_id);

drop policy if exists "Users can create own presets" on public.config_presets;
create policy "Users can create own presets" on public.config_presets
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own presets" on public.config_presets;
create policy "Users can update own presets" on public.config_presets
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own presets" on public.config_presets;
create policy "Users can delete own presets" on public.config_presets
  for delete using (auth.uid() = user_id);

-- Trigger para updated_at
drop trigger if exists update_config_presets_updated_at on public.config_presets;
create trigger update_config_presets_updated_at before update on public.config_presets
  for each row execute function update_updated_at_column();

-- ============================================
-- TABELA: user_preferences (Preferências do Usuário)
-- ============================================
create table if not exists public.user_preferences (
  user_id uuid primary key references public.users(id) on delete cascade,

  -- Preferências de UI
  default_versao_gerador text check (default_versao_gerador in ('v1', 'v2')),
  default_incluir_comentarios boolean default true,
  default_metodo_nesting text check (default_metodo_nesting in ('greedy', 'shelf', 'guillotine')),

  -- Configurações padrão (JSONB)
  default_config_chapa jsonb,
  default_config_corte jsonb,
  default_config_ferramenta jsonb,

  -- Tema
  theme text check (theme in ('light', 'dark', 'system')),

  -- Timestamp
  updated_at timestamp with time zone default now()
);

-- RLS
alter table public.user_preferences enable row level security;

drop policy if exists "Users can view own preferences" on public.user_preferences;
create policy "Users can view own preferences" on public.user_preferences
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own preferences" on public.user_preferences;
create policy "Users can insert own preferences" on public.user_preferences
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own preferences" on public.user_preferences;
create policy "Users can update own preferences" on public.user_preferences
  for update using (auth.uid() = user_id);

-- Trigger para updated_at
drop trigger if exists update_user_preferences_updated_at on public.user_preferences;
create trigger update_user_preferences_updated_at before update on public.user_preferences
  for each row execute function update_updated_at_column();

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================
-- Execute esta query para verificar se todas as tabelas foram criadas:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('projects', 'gcode_history', 'config_presets', 'user_preferences');
