-- Migration Script: OAuth Tables for NextAuth with Supabase
-- This script creates the necessary tables for Google OAuth authentication
-- Run this in Supabase Dashboard -> SQL Editor

-- Tabela accounts (vincula provedores OAuth aos usuários)
CREATE TABLE IF NOT EXISTS public.accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  provider text NOT NULL,
  provider_account_id text NOT NULL,
  refresh_token text,
  access_token text,
  expires_at bigint,
  token_type text,
  scope text,
  id_token text,
  session_state text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(provider, provider_account_id)
);

-- Tabela sessions (para strategy: "database" - opcional por enquanto)
CREATE TABLE IF NOT EXISTS public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token text NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  expires timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS accounts_user_id_idx ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_session_token_idx ON public.sessions(session_token);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para accounts
CREATE POLICY "Users can view their own accounts"
  ON public.accounts FOR SELECT
  USING (auth.uid() = user_id);

-- Políticas RLS para sessions
CREATE POLICY "Users can view their own sessions"
  ON public.sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Verificação: mostrar tabelas criadas
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('accounts', 'sessions', 'users', 'verification_tokens')
ORDER BY table_name;
