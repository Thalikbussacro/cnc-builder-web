# Landing Page & Authentication - Plano de Implementação

**Data de início:** 2025-12-16
**Repositório:** cnc-builder-web (Frontend)
**Branch:** `feature/landing-and-auth`

---

## 🎯 Objetivo

Implementar landing page profissional com sistema de autenticação usando NextAuth, mantendo a aplicação atual funcional em `/app`.

---

## 📐 Arquitetura Final

```
app/
├── layout.tsx                    → Root layout (minimalista, suporta tudo)
├── page.tsx                      → Landing page (/) - NOVA
├── login/
│   └── page.tsx                  → Página de login - NOVA
├── app/                          → Aplicação protegida - MIGRADA
│   ├── layout.tsx                → Layout da app (sidebar, header)
│   ├── page.tsx                  → Dashboard (atual page.tsx)
│   └── ...                       → Mantém estrutura atual
├── api/
│   └── auth/
│       └── [...nextauth]/
│           └── route.ts          → NextAuth API routes - NOVA
└── middleware.ts                 → Proteção de rotas - NOVO

components/
├── landing/                      → Componentes da landing - NOVOS
│   ├── Hero.tsx
│   ├── Features.tsx
│   ├── CTASection.tsx
│   └── LandingNav.tsx
└── auth/                         → Componentes de auth - NOVOS
    ├── LoginForm.tsx
    └── UserMenu.tsx
```

---

## 🔧 Stack Tecnológica

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Next.js | 16.0.7 | App Router |
| NextAuth.js | 5.x (beta) | Autenticação |
| Supabase | latest | Banco de dados PostgreSQL |
| shadcn/ui | atual | Componentes UI |
| Tailwind CSS | 3.4.17 | Estilização |

---

## 📦 Dependências a Instalar

```bash
npm install next-auth@beta @auth/supabase-adapter @supabase/supabase-js
npm install bcryptjs
npm install -D @types/bcryptjs
```

---

## 🗄️ Setup do Banco de Dados (Supabase)

### Passos:
1. Criar conta em [supabase.com](https://supabase.com)
2. Criar novo projeto
3. Criar tabelas via SQL (NextAuth fornece schema pronto)
4. Obter credenciais (URL + anon key + service_role key)
5. Adicionar ao `.env.local`

### Variáveis de ambiente necessárias:
```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<gerar_um_secret_seguro>

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Google OAuth (opcional - adicionar depois)
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
```

---

## ✅ Checklist de Implementação

### **Fase 1: Setup Inicial** (30 min)

- [ ] Criar branch `feature/landing-and-auth`
- [ ] Instalar dependências (NextAuth, Supabase, bcryptjs)
- [ ] Criar conta Supabase e projeto
- [ ] Configurar tabelas do NextAuth no Supabase
- [ ] Adicionar variáveis de ambiente (`.env.local`)
- [ ] Atualizar `.env.local.example` com novas variáveis
- [ ] Gerar `NEXTAUTH_SECRET` seguro

---

### **Fase 2: Configuração NextAuth** (45 min)

- [ ] Criar `lib/auth.ts` (configuração NextAuth)
- [ ] Criar `app/api/auth/[...nextauth]/route.ts`
- [ ] Configurar CredentialsProvider (email/senha)
- [ ] Configurar adapter do Supabase
- [ ] Criar tipos TypeScript para sessão
- [ ] Testar NextAuth funcionando (debug page: `/api/auth/signin`)

---

### **Fase 3: Middleware & Proteção de Rotas** (20 min)

- [ ] Criar `middleware.ts` na raiz
- [ ] Configurar proteção da rota `/app/*`
- [ ] Testar redirecionamento não-autenticado → `/login`
- [ ] Testar redirecionamento autenticado `/login` → `/app`

---

### **Fase 4: Reestruturação de Rotas** (30 min)

- [ ] Criar pasta `app/app/`
- [ ] Mover `app/page.tsx` para `app/app/page.tsx`
- [ ] Criar `app/app/layout.tsx` (layout específico da app)
- [ ] Mover componentes relevantes para `app/app/` se necessário
- [ ] Verificar que aplicação funciona em `/app`
- [ ] Atualizar imports quebrados (se houver)

---

### **Fase 5: Landing Page** (1h)

#### Componentes:
- [ ] Criar `components/landing/LandingNav.tsx` (Header com logo + botão Login)
- [ ] Criar `components/landing/Hero.tsx` (Seção principal + CTA)
- [ ] Criar `components/landing/Features.tsx` (Grid de features)
- [ ] Criar `components/landing/CTASection.tsx` (Call-to-action final)
- [ ] Criar `components/landing/Footer.tsx` (Footer com links)

#### Página:
- [ ] Criar `app/page.tsx` (Landing page)
- [ ] Integrar componentes da landing
- [ ] Adicionar animações suaves (opcional)
- [ ] Testar responsividade (mobile/tablet/desktop)
- [ ] Ajustar tema dark/light

---

### **Fase 6: Página de Login** (45 min)

- [ ] Criar `components/auth/LoginForm.tsx` (formulário de login)
- [ ] Criar `app/login/page.tsx`
- [ ] Implementar login com email/senha
- [ ] Adicionar validação de formulário (Zod/React Hook Form)
- [ ] Adicionar feedback de erro (toast/mensagem)
- [ ] Adicionar loading state
- [ ] Link "Esqueci minha senha" (placeholder por enquanto)
- [ ] Link "Criar conta" (placeholder por enquanto)

---

### **Fase 7: UI de Autenticação na App** (30 min)

- [ ] Criar `components/auth/UserMenu.tsx` (dropdown com avatar + logout)
- [ ] Adicionar `UserMenu` no header da aplicação (`app/app/layout.tsx`)
- [ ] Implementar botão de logout
- [ ] Mostrar nome/email do usuário
- [ ] Testar logout funcionando

---

### **Fase 8: Ajustes Finais & Testes** (1h)

- [ ] Atualizar `README.md` com instruções de auth
- [ ] Atualizar `package.json` se necessário
- [ ] Testar fluxo completo:
  - [ ] Landing → Login → App → Logout → Landing
  - [ ] Tentar acessar `/app` sem login (redireciona)
  - [ ] Login com credenciais corretas (funciona)
  - [ ] Login com credenciais erradas (mostra erro)
  - [ ] Refresh da página mantém sessão
- [ ] Verificar performance (lighthouse)
- [ ] Verificar acessibilidade básica
- [ ] Testar dark/light mode em todas as páginas

---

### **Fase 9: Documentação & Deploy** (30 min)

- [ ] Documentar setup de autenticação no README
- [ ] Documentar variáveis de ambiente
- [ ] Criar script de seed para banco (usuário de teste)
- [ ] Commit e push da branch
- [ ] Abrir Pull Request
- [ ] Code review
- [ ] Merge para `main`
- [ ] Deploy em produção (Vercel)

---

## 🧪 Casos de Teste

### Fluxo de Autenticação:
1. ✅ Usuário não logado acessa `/` → Vê landing page
2. ✅ Usuário clica "Entrar" → Redireciona para `/login`
3. ✅ Usuário faz login → Redireciona para `/app`
4. ✅ Usuário logado acessa `/` → Permanece em `/` (pode ver landing)
5. ✅ Usuário logado acessa `/login` → Redireciona para `/app`
6. ✅ Usuário não logado acessa `/app` → Redireciona para `/login`
7. ✅ Usuário faz logout → Redireciona para `/`

### Segurança:
1. ✅ Senhas são hasheadas (bcrypt)
2. ✅ `NEXTAUTH_SECRET` está no `.env.local` (não commitado)
3. ✅ Session token é httpOnly cookie
4. ✅ Middleware protege rotas `/app/*`
5. ✅ API routes de auth são seguras

---

## 🚀 Melhorias Futuras (Fase 2)

- [ ] Google OAuth (adicionar provider)
- [ ] Página de cadastro (`/signup`)
- [ ] Recuperação de senha (email provider)
- [ ] Página de perfil (`/app/profile`)
- [ ] Verificação de email
- [ ] 2FA (autenticação de dois fatores)
- [ ] Rate limiting (prevenir brute force)
- [ ] Logs de auditoria (quem fez login quando)
- [ ] Proteção das APIs do backend (validar token)
- [ ] Roles/Permissões (admin, usuário)

---

## 📝 Notas Importantes

1. **Backend não precisa alterações** nesta fase (autenticação é stateless)
2. **Banco de dados Supabase** é gratuito até 500MB (suficiente para 100+ usuários)
3. **NextAuth v5** está em beta, mas é estável (usado em produção)
4. **Middleware** protege rotas no edge (performático)
5. **Landing page** é pública e SEO-friendly
6. **App** funciona exatamente como antes, só mudou de `/` para `/app`

---

## 🐛 Troubleshooting Comum

### Erro: "NEXTAUTH_SECRET not defined"
- Adicionar `NEXTAUTH_SECRET` no `.env.local`
- Gerar com: `openssl rand -base64 32`

### Erro: "Cannot connect to Supabase"
- Verificar `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Verificar firewall/rede

### Login não funciona
- Verificar tabelas criadas no Supabase
- Verificar adapter configurado corretamente
- Checar console do navegador para erros

### Middleware não redireciona
- Verificar `matcher` no `middleware.ts`
- Verificar `NEXTAUTH_URL` no `.env.local`

---

## 📚 Recursos Úteis

- [NextAuth.js Docs](https://next-auth.js.org/)
- [Supabase Docs](https://supabase.com/docs)
- [NextAuth Supabase Adapter](https://authjs.dev/getting-started/adapters/supabase)
- [shadcn/ui Components](https://ui.shadcn.com/)

---

## ✏️ Controle de Progresso

**Iniciado em:** _____/_____/_____
**Concluído em:** _____/_____/_____
**Tempo total:** _____ horas

**Desenvolvedor:** _____________________
**Revisor:** _____________________

---

**Status Geral:** 🔴 Não iniciado | 🟡 Em progresso | 🟢 Concluído

