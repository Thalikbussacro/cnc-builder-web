# Landing Page & Authentication - Plano de Implementacao

**Data de inicio:** 2025-12-16
**Repositorio:** cnc-builder-web (Frontend) + cnc-builder-api (Backend)
**Branch:** `feature/landing-and-auth`

---

## 🔄 COMO RETOMAR SE A SESSAO CAIR

Se a implementacao for interrompida (sessao do Claude Code expirar, erro, etc):

1. **Verificar ultima fase concluida:**
   - Procurar no documento por checkbox `[x]` (marcado)
   - Ver ultimo commit: `git log --oneline -5`

2. **Retomar de onde parou:**
   - Pedir ao Claude: "Continue a implementacao da Fase X"
   - Claude vai ler este documento e continuar

3. **Verificar estado atual:**
   ```bash
   git status                    # Ver arquivos modificados
   git diff                      # Ver mudancas nao commitadas
   git log --oneline -10         # Ver ultimos commits
   ```

4. **Testar o que ja foi feito:**
   - Se ja instalou dependencias: `npm run dev`
   - Se ja criou rotas: testar manualmente

---

## 👤 TAREFAS DO USUARIO (NAO AUTOMATIZAVEIS)

Estas tarefas **precisam ser feitas pelo usuario** (Claude nao consegue fazer):

### 1. Criar conta Supabase (Fase 1)
- [ ] Ir para [supabase.com](https://supabase.com)
- [ ] Criar conta gratuita
- [ ] Criar novo projeto: `cnc-builder-production`
- [ ] Anotar credenciais:
  - **Project URL**: `https://xxxxx.supabase.co`
  - **Anon key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
  - **Service role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### Como pegar as credenciais:
1. No dashboard do Supabase
2. Menu lateral: **Settings** → **API**
3. Copiar:
   - **URL** (Project URL)
   - **anon public** (Anon key)
   - **service_role** (Service role key - SECRETO)

#### Executar SQL no Supabase:
1. Menu lateral: **SQL Editor**
2. Clicar **+ New query**
3. Copiar e colar o SQL schema deste documento (secao "Setup do Banco de Dados")
4. Clicar **Run** (ou F5)
5. Verificar se tabelas foram criadas: **Table Editor** no menu

---

### 2. Criar conta Resend (Fase 1)
- [ ] Ir para [resend.com](https://resend.com)
- [ ] Criar conta gratuita
- [ ] Pegar API Key:
  - Dashboard → **API Keys** → **Create API Key**
  - Nome: `cnc-builder-dev`
  - Copiar a key: `re_xxxxxxxxxxxxx`
  - **GUARDAR**: nao da pra ver de novo depois!

#### Verificar dominio (opcional):
- Para produção: verificar domínio proprio
- Para desenvolvimento: usar `onboarding.resend.dev` (ja incluido)

---

### 3. Adicionar credenciais no .env.local (Fase 1)
Criar/editar arquivo `.env.local` na raiz do projeto:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<GERAR_ABAIXO>

# Supabase (COLAR AQUI AS CREDENCIAIS DO SUPABASE)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Resend (COLAR AQUI A API KEY DO RESEND)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# API Backend (ja existe)
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### Gerar NEXTAUTH_SECRET:
**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Windows (Git Bash):**
```bash
openssl rand -base64 32
```

**Linux/Mac:**
```bash
openssl rand -base64 32
```

Copiar o resultado e colar em `NEXTAUTH_SECRET=`

---

### 4. Testar a aplicacao (apos cada fase)
```bash
npm run dev
```

Acessar: http://localhost:3000

---

### 5. Google OAuth (OPCIONAL - Fase Futura)
Se quiser adicionar login com Google:
- [ ] Ir para [console.cloud.google.com](https://console.cloud.google.com)
- [ ] Criar projeto
- [ ] Ativar Google+ API
- [ ] Criar credenciais OAuth 2.0
- [ ] Adicionar redirect URI: `http://localhost:3000/api/auth/callback/google`
- [ ] Copiar Client ID e Client Secret
- [ ] Adicionar no `.env.local`

---

## ⚠️ REGRAS DE COMMIT

**IMPORTANTE: Seguir estritamente estas regras em todos os commits:**

### Formato:
```
<tipo>: <descricao curta sem acentos>
```

### Regras:
- ✅ Tudo em **minúsculas**
- ✅ Sem **acentos** (á → a, ç → c, etc.)
- ✅ Máximo **50 caracteres** no título
- ✅ **Sem co-author** ou referências a IA
- ✅ **Sem corpo** de commit (só título)

### Tipos permitidos:
- `feat`: nova funcionalidade
- `fix`: correção de bug
- `refactor`: refatoração de código
- `style`: mudanças de estilo/formatação
- `docs`: mudanças em documentação
- `chore`: tarefas gerais (build, configs)
- `test`: adição/modificação de testes

### Exemplos CORRETOS:
```bash
git commit -m "feat: adiciona pagina de login"
git commit -m "refactor: move app para subdiretorio"
git commit -m "chore: instala nextauth e dependencias"
git commit -m "fix: corrige redirect do middleware"
```

### Exemplos INCORRETOS:
```bash
❌ git commit -m "Feat: Adiciona página de login"  (maiúscula, acentos)
❌ git commit -m "adiciona login"                    (sem tipo)
❌ git commit -m "feat: Adicionado sistema de autenticação com NextAuth..."  (muito longo)
```

---

## 🎯 Objetivo

Implementar landing page profissional com sistema de autenticacao usando NextAuth, email provider (Resend) e banco de dados (Supabase), mantendo a aplicacao atual funcional em `/app`.

---

## 📐 Arquitetura Final

```
app/
├── layout.tsx                    → Root layout (minimalista, suporta tudo)
├── page.tsx                      → Landing page (/) - NOVA
├── login/
│   └── page.tsx                  → Pagina de login - NOVA
├── signup/
│   └── page.tsx                  → Pagina de cadastro - NOVA
├── forgot-password/
│   └── page.tsx                  → Recuperacao de senha - NOVA
├── app/                          → Aplicacao protegida - MIGRADA
│   ├── layout.tsx                → Layout da app (sidebar, header)
│   ├── page.tsx                  → Dashboard (atual page.tsx)
│   └── ...                       → Mantem estrutura atual
├── api/
│   └── auth/
│       └── [...nextauth]/
│           └── route.ts          → NextAuth API routes - NOVA
└── middleware.ts                 → Protecao de rotas - NOVO

components/
├── landing/                      → Componentes da landing - NOVOS
│   ├── Hero.tsx
│   ├── Features.tsx
│   ├── CTASection.tsx
│   └── LandingNav.tsx
└── auth/                         → Componentes de auth - NOVOS
    ├── LoginForm.tsx
    ├── SignupForm.tsx
    ├── ForgotPasswordForm.tsx
    └── UserMenu.tsx

lib/
├── auth.ts                       → Configuracao NextAuth - NOVO
├── auth-utils.ts                 → Utilitarios de auth - NOVO
└── email.ts                      → Cliente Resend - NOVO
```

---

## 🔧 Stack Tecnologica

| Tecnologia | Versao | Uso |
|------------|--------|-----|
| Next.js | 16.0.7 | App Router |
| NextAuth.js | 5.x (beta) | Autenticacao |
| Supabase | latest | Banco de dados PostgreSQL |
| Resend | latest | Email provider (verificacao, recuperacao senha) |
| shadcn/ui | atual | Componentes UI |
| Tailwind CSS | 3.4.17 | Estilizacao |
| bcryptjs | latest | Hash de senhas |

---

## 📦 Dependencias a Instalar

### Frontend (cnc-builder-web):
```bash
npm install next-auth@beta @auth/supabase-adapter @supabase/supabase-js
npm install resend
npm install bcryptjs
npm install -D @types/bcryptjs
```

### Backend (cnc-builder-api) - FASE 2:
```bash
# Apenas quando for proteger as APIs
npm install jsonwebtoken
npm install -D @types/jsonwebtoken
```

---

## 🗄️ Setup do Banco de Dados (Supabase)

### Passos:
1. Criar conta em [supabase.com](https://supabase.com)
2. Criar novo projeto: `cnc-builder-production`
3. Anotar credenciais:
   - Project URL
   - Anon/Public key
   - Service Role key (secret)
4. Executar SQL para criar tabelas do NextAuth (schema abaixo)
5. Adicionar variáveis de ambiente no `.env.local`

### SQL Schema (NextAuth + Supabase):
```sql
-- Tabela de usuários
create table public.users (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text unique not null,
  email_verified timestamp with time zone,
  image text,
  password text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Tabela de contas (OAuth)
create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null,
  provider text not null,
  provider_account_id text not null,
  refresh_token text,
  access_token text,
  expires_at bigint,
  token_type text,
  scope text,
  id_token text,
  session_state text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(provider, provider_account_id)
);

-- Tabela de sessões
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  session_token text unique not null,
  user_id uuid not null references public.users(id) on delete cascade,
  expires timestamp with time zone not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Tabela de tokens de verificação
create table public.verification_tokens (
  identifier text not null,
  token text unique not null,
  expires timestamp with time zone not null,
  created_at timestamp with time zone default now(),
  primary key (identifier, token)
);

-- Índices para performance
create index users_email_idx on public.users(email);
create index accounts_user_id_idx on public.accounts(user_id);
create index sessions_user_id_idx on public.sessions(user_id);
create index sessions_session_token_idx on public.sessions(session_token);

-- Row Level Security (RLS) - Recomendado
alter table public.users enable row level security;
alter table public.accounts enable row level security;
alter table public.sessions enable row level security;
alter table public.verification_tokens enable row level security;

-- Policies (usuários só podem ver seus próprios dados)
create policy "Users can view own data" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own data" on public.users
  for update using (auth.uid() = id);
```

---

## 📧 Setup do Email Provider (Resend)

### Passos:
1. Criar conta em [resend.com](https://resend.com)
2. Verificar domínio (ou usar domínio de teste `onboarding.resend.dev`)
3. Criar API Key
4. Adicionar `RESEND_API_KEY` no `.env.local`

### Templates de Email:
- **Verificação de email**: Link para confirmar cadastro
- **Recuperação de senha**: Link para resetar senha
- **Boas-vindas**: Email após cadastro bem-sucedido

---

## 🔐 Variáveis de Ambiente

### Arquivo `.env.local` (Frontend):
```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<gerar_com_openssl_rand_base64_32>

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Resend
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Google OAuth (opcional - Fase 2)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx

# API Backend (já existe)
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Gerar NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### Atualizar `.env.local.example`:
```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Resend
RESEND_API_KEY=your_resend_api_key_here

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# API Backend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## ✅ Checklist de Implementacao

### **Fase 1: Setup Inicial** (30 min)

- [x] Criar branch `feature/landing-and-auth` no frontend
- [x] Criar branch `feature/landing-and-auth` no backend
- [x] Instalar dependencias no frontend
- [ ] **[USUARIO]** Criar conta Supabase e projeto
- [ ] **[USUARIO]** Executar SQL schema no Supabase
- [ ] **[USUARIO]** Criar conta Resend e obter API key
- [ ] **[USUARIO]** Adicionar variaveis de ambiente (`.env.local`)
- [x] Atualizar `.env.local.example`
- [ ] **[USUARIO]** Gerar `NEXTAUTH_SECRET`
- [x] Commit: `chore: instala nextauth e dependencias de auth`

---

### **Fase 2: Configuracao NextAuth** (1h)

- [x] Criar `lib/auth.ts` (config NextAuth)
- [x] Criar `lib/auth-utils.ts` (helpers: hash, verify password)
- [x] Criar `lib/email.ts` (cliente Resend)
- [x] Criar `app/api/auth/[...nextauth]/route.ts`
- [x] Configurar CredentialsProvider (email/senha)
- [x] Configurar adapter do Supabase
- [x] Configurar callbacks (jwt, session)
- [x] Criar tipos TypeScript para sessao
- [ ] **[USUARIO]** Testar NextAuth funcionando: `/api/auth/signin`
- [x] Commit: `feat: configura nextauth com supabase e resend`

---

### **Fase 3: Middleware & Protecao de Rotas** (20 min)

- [x] Criar `middleware.ts` na raiz
- [x] Configurar protecao da rota `/app/*`
- [x] Configurar redirect nao-autenticado → `/login`
- [x] Configurar redirect autenticado `/login` → `/app`
- [ ] **[USUARIO]** Testar middleware funcionando
- [x] Commit: `feat: adiciona middleware de protecao de rotas`

---

### **Fase 4: Reestruturacao de Rotas** (30 min)

- [x] Criar pasta `app/app/`
- [x] Mover `app/page.tsx` para `app/app/page.tsx`
- [x] Criar `app/app/layout.tsx` (layout de protecao)
- [x] Ajustar imports em `app/app/layout.tsx`
- [ ] **[USUARIO]** Testar aplicacao funcionando em `/app`
- [ ] **[USUARIO]** Verificar que todas as rotas estao acessiveis
- [x] Commit: `refactor: move aplicacao principal para /app`

---

### **Fase 5: Componentes de Auth** (1h)

#### Formularios:
- [x] Criar `components/auth/LoginForm.tsx`
- [x] Criar `components/auth/SignupForm.tsx`
- [x] Criar `components/auth/ForgotPasswordForm.tsx`
- [x] Criar `components/auth/UserMenu.tsx` (dropdown)
- [x] Criar API routes (signup, forgot-password, verify-email)
- [x] Adicionar validacao de formulario (nativa)
- [x] Adicionar loading states
- [x] Adicionar feedback de erro (toast)
- [x] Commit: `feat: cria componentes e apis de autenticacao`

---

### **Fase 6: Paginas de Auth** (45 min)

- [x] Criar `app/login/page.tsx`
- [x] Criar `app/signup/page.tsx`
- [x] Criar `app/forgot-password/page.tsx`
- [x] Implementar logica de login (via LoginForm)
- [x] Implementar logica de cadastro (via SignupForm)
- [x] Implementar logica de recuperacao de senha (via ForgotPasswordForm)
- [ ] **[USUARIO]** Testar fluxo completo de auth
- [x] Commit: `feat: adiciona paginas de login e cadastro`

---

### **Fase 7: Email Templates** (30 min)

- [x] Criar template de verificacao de email (ja feito em lib/email.ts)
- [x] Criar template de recuperacao de senha (ja feito em lib/email.ts)
- [x] Criar template de boas-vindas (ja feito em lib/email.ts)
- [x] Integrar templates com Resend (ja feito)
- [ ] **[USUARIO]** Testar envio de emails
- [x] Commit: (nao necessario, ja incluido na Fase 2)

---

### **Fase 8: Landing Page** (1h 30min)

#### Componentes:
- [x] Criar `components/landing/LandingNav.tsx`
- [x] Criar `components/landing/Hero.tsx`
- [x] Criar `components/landing/Features.tsx`
- [x] Criar `components/landing/CTASection.tsx`
- [x] Criar `components/landing/Footer.tsx`

#### Pagina:
- [x] Criar `app/page.tsx` (nova landing)
- [x] Integrar componentes da landing
- [x] Design responsivo (mobile/tablet/desktop)
- [x] Suporte a tema dark/light
- [ ] **[USUARIO]** Testar responsividade em diferentes telas
- [x] Commit: `feat: adiciona landing page`

---

### **Fase 9: Integracao UI de Auth na App** (30 min)

- [ ] Adicionar `UserMenu` no header (`app/app/layout.tsx`)
- [ ] Implementar botao de logout
- [ ] Mostrar nome/email do usuario
- [ ] Adicionar indicador de sessao
- [ ] Testar logout funcionando
- [ ] Commit: `feat: integra menu de usuario na aplicacao`

---

### **Fase 10: Ajustes Finais & Testes** (1h)

- [ ] Atualizar `README.md` com instrucoes de auth
- [ ] Atualizar `package.json` se necessario
- [ ] Testar fluxo completo:
  - [ ] Landing → Login → App → Logout → Landing
  - [ ] Landing → Signup → Verificacao email → Login → App
  - [ ] Login → Esqueci senha → Email → Reset → Login
  - [ ] Tentar acessar `/app` sem login (redireciona)
  - [ ] Login com credenciais corretas (funciona)
  - [ ] Login com credenciais erradas (mostra erro)
  - [ ] Refresh da pagina mantem sessao
- [ ] Verificar performance (lighthouse)
- [ ] Verificar acessibilidade basica
- [ ] Testar dark/light mode em todas as paginas
- [ ] Commit: `fix: ajustes finais de autenticacao`

---

### **Fase 11: Backend - Protecao de APIs** (1h) - OPCIONAL

- [ ] Criar middleware de autenticacao no backend
- [ ] Validar JWT token nas rotas protegidas
- [ ] Proteger endpoint `/api/gcode/generate`
- [ ] Proteger endpoint `/api/gcode/validate`
- [ ] Testar chamadas autenticadas
- [ ] Commit: `feat: adiciona protecao de apis no backend`

---

### **Fase 12: Documentacao & Deploy** (30 min)

- [ ] Documentar setup de autenticacao no README
- [ ] Documentar variaveis de ambiente
- [ ] Criar script de seed para banco (usuario de teste)
- [ ] Commit e push da branch frontend
- [ ] Commit e push da branch backend (se tiver mudancas)
- [ ] Abrir Pull Request
- [ ] Code review
- [ ] Merge para `main`
- [ ] Deploy em producao (Vercel)
- [ ] Commit: `docs: atualiza readme com setup de auth`

---

## 🧪 Casos de Teste

### Fluxo de Autenticacao:
1. ✅ Usuario nao logado acessa `/` → Ve landing page
2. ✅ Usuario clica "Entrar" → Redireciona para `/login`
3. ✅ Usuario clica "Criar conta" → Redireciona para `/signup`
4. ✅ Usuario faz signup → Recebe email de verificacao
5. ✅ Usuario verifica email → Pode fazer login
6. ✅ Usuario faz login → Redireciona para `/app`
7. ✅ Usuario logado acessa `/` → Permanece em `/` (pode ver landing)
8. ✅ Usuario logado acessa `/login` → Redireciona para `/app`
9. ✅ Usuario nao logado acessa `/app` → Redireciona para `/login`
10. ✅ Usuario faz logout → Redireciona para `/`
11. ✅ Usuario esquece senha → Recebe email de recuperacao
12. ✅ Usuario reseta senha → Pode fazer login com nova senha

### Seguranca:
1. ✅ Senhas sao hasheadas (bcrypt)
2. ✅ `NEXTAUTH_SECRET` esta no `.env.local` (nao commitado)
3. ✅ Session token e httpOnly cookie
4. ✅ Middleware protege rotas `/app/*`
5. ✅ API routes de auth sao seguras
6. ✅ Email verification previne contas falsas
7. ✅ Rate limiting previne brute force (Resend tem limite)
8. ✅ RLS (Row Level Security) no Supabase

---

## 🚀 Melhorias Futuras (Fase 13+)

- [ ] Google OAuth (adicionar provider)
- [ ] GitHub OAuth (adicionar provider)
- [ ] Pagina de perfil (`/app/profile`)
- [ ] 2FA (autenticacao de dois fatores)
- [ ] Rate limiting customizado (prevenir brute force)
- [ ] Logs de auditoria (quem fez login quando)
- [ ] Roles/Permissoes (admin, usuario)
- [ ] Listagem de usuarios (admin)
- [ ] Bloquear/desbloquear usuarios (admin)
- [ ] Estatisticas de uso por usuario
- [ ] Planos/Subscricoes (Stripe)

---

## 📝 Notas Importantes

1. **Backend precisa mudancas minimas** nesta fase (so Fase 11, opcional)
2. **Banco de dados Supabase** e gratuito ate 500MB (suficiente para 100+ usuarios)
3. **Resend** e gratuito ate 100 emails/dia (suficiente para desenvolvimento e testes)
4. **NextAuth v5** esta em beta, mas e estavel (usado em producao)
5. **Middleware** protege rotas no edge (performatico)
6. **Landing page** e publica e SEO-friendly
7. **App** funciona exatamente como antes, so mudou de `/` para `/app`
8. **RLS no Supabase** garante que usuarios so acessem seus proprios dados
9. **Verificacao de email** previne spam e contas falsas

---

## 🐛 Troubleshooting Comum

### Erro: "NEXTAUTH_SECRET not defined"
- Adicionar `NEXTAUTH_SECRET` no `.env.local`
- Gerar com: `openssl rand -base64 32`

### Erro: "Cannot connect to Supabase"
- Verificar `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Verificar firewall/rede
- Verificar se projeto Supabase esta ativo

### Login nao funciona
- Verificar tabelas criadas no Supabase
- Verificar adapter configurado corretamente
- Checar console do navegador para erros
- Verificar hash de senha esta correto

### Middleware nao redireciona
- Verificar `matcher` no `middleware.ts`
- Verificar `NEXTAUTH_URL` no `.env.local`
- Verificar session token esta sendo criado

### Email nao envia
- Verificar `RESEND_API_KEY` no `.env.local`
- Verificar dominio verificado no Resend
- Checar logs do Resend dashboard

---

## 📚 Recursos Uteis

- [NextAuth.js Docs](https://next-auth.js.org/)
- [Supabase Docs](https://supabase.com/docs)
- [NextAuth Supabase Adapter](https://authjs.dev/getting-started/adapters/supabase)
- [Resend Docs](https://resend.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## ✏️ Controle de Progresso

**Iniciado em:** _____/_____/_____
**Concluido em:** _____/_____/_____
**Tempo total:** _____ horas

**Desenvolvedor:** _____________________
**Revisor:** _____________________

---

**Status Geral:** 🔴 Nao iniciado | 🟡 Em progresso | 🟢 Concluido

