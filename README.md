# CNC Builder Web

Aplicação web completa para geração de código G-code para fresadoras CNC com algoritmo de nesting automático, sistema de autenticação e landing page profissional.

## Escolha da Cloud e Diagramas

Podem ser encontrados dentro da pasta docs/ no repositório.

## Descrição

Sistema profissional que permite configuração de chapas, cadastro de peças retangulares e geração automática de código G-code otimizado para máquinas CNC. Inclui:

- Landing page responsiva com tema dark/light
- Sistema de autenticação completo (login, cadastro, recuperação de senha)
- Preview visual 2D em tempo real
- Validação de segurança e feedback instantâneo
- Suporte a múltiplos formatos (.tap, .nc, .gcode, .cnc)
- Email notifications (verificação, boas-vindas, reset de senha)

## Requisitos

- Node.js 18.x ou superior
- npm 9.x ou superior
- Conta Supabase (banco de dados PostgreSQL)
- Conta Resend (envio de emails)

## Instalação

```bash
npm install
```

## Configuração

### 1. Backend API

Este frontend requer o backend `cnc-builder-api` rodando. Veja o [repositório do backend](https://github.com/seu-usuario/cnc-builder-api) para instruções de instalação e configuração.

O backend gerencia toda a autenticação (JWT), banco de dados (Supabase) e envio de emails (Resend).

### 2. Criar conta Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto: `cnc-builder-production`
3. Anote as credenciais em **Settings** → **API**:
   - Project URL
   - anon public key

**Nota:** A `service_role key` deve ser configurada apenas no backend por segurança.

### 3. Executar SQL no Supabase

No dashboard do Supabase, vá em **SQL Editor** e execute o script de criação de tabelas:

```bash
# Veja o script completo no repositório do backend
scripts/create-persistence-tables.sql
```

O schema cria as tabelas: `users`, `projects`, `presets`, `preferences`, `verification_tokens` com RLS habilitado.

### 4. Configurar variáveis de ambiente

Copie o arquivo de exemplo e configure:

```bash
cp .env.local.example .env.local
```

Edite `.env.local` e configure:

```env
# API Backend URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# Supabase (pegue no dashboard: Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google OAuth (pegue no Google Cloud Console)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

**Importante:** Credenciais sensíveis (SERVICE_ROLE_KEY, RESEND_API_KEY, GOOGLE_CLIENT_SECRET, JWT_SECRET) devem ser configuradas no backend, não no frontend.

## Executar

### Desenvolvimento

```bash
npm run dev
```

**Acesse:**
- Landing page: `http://localhost:3000`
- Login: `http://localhost:3000/login`
- Aplicação: `http://localhost:3000/app` (protegida, requer login)

### Produção

```bash
npm run build
npm run start
```

## Estrutura de Rotas

```
/                    → Landing page (pública)
/login              → Página de login
/signup             → Página de cadastro
/forgot-password    → Recuperação de senha
/app                → Aplicação principal (protegida)
  /app/page.tsx     → Dashboard/gerador G-code
```

## Fluxo de Autenticação

A autenticação é gerenciada pelo backend Express com JWT. O frontend apenas consome a API.

1. **Cadastro** (`/signup`):
   - Frontend envia dados para `POST /api/auth/signup` (backend)
   - Backend cria usuário, gera token de verificação
   - Backend envia email de verificação via Resend
   - Usuário clica no link: `POST /api/auth/verify-email`
   - Backend retorna JWT, frontend armazena no localStorage

2. **Login** (`/login`):
   - Frontend envia credenciais para `POST /api/auth/login` (backend)
   - Backend valida senha com bcrypt, retorna JWT
   - Frontend armazena JWT no localStorage, redireciona para `/app`

3. **Login com Google**:
   - Frontend obtém `idToken` do Google (client-side)
   - Envia para `POST /api/auth/google` (backend)
   - Backend verifica token, cria/atualiza usuário, retorna JWT

4. **Recuperação de Senha**:
   - Frontend envia email para `POST /api/auth/forgot-password`
   - Backend gera token de reset, envia email
   - Usuário clica no link, define nova senha: `POST /api/auth/reset-password`

5. **Proteção de Rotas**:
   - Frontend usa `<ProtectedRoute>` no layout `/app`
   - Requisições incluem header: `Authorization: Bearer <jwt>`
   - Backend valida JWT em middleware `requireAuth`
   - Token inválido/expirado: 401 → frontend redireciona para `/login`

6. **Logout**:
   - Botão de logout remove JWT do localStorage
   - Redireciona para landing page (`/`)

**Veja [MIGRATION-SUMMARY.md](MIGRATION-SUMMARY.md) para detalhes completos da arquitetura.**

## Funcionalidades

- Configuração de dimensões da chapa (largura, altura, espessura)
- Configuração de parâmetros de corte (profundidade, espaçamento, velocidades)
- Cadastro manual de peças retangulares
- Algoritmo de nesting automático (bin packing 2D)
- Preview visual 2D com Canvas API
- Validação em tempo real de dimensões
- Suporte a múltiplos tipos de corte (G41/G42/G40)
- Rampa de entrada configurável
- Geração de G-code com duas versões (clássica e otimizada)
- Exportação em múltiplos formatos (.tap, .nc, .gcode, .cnc)
- Estimativa de tempo de corte
- Persistência local de configurações

## Estrutura do Projeto

```
.
├── app/
│   ├── page.tsx              # Página principal
│   ├── layout.tsx            # Layout raiz
│   └── globals.css           # Estilos globais
├── components/
│   ├── ConfiguracoesChapa.tsx
│   ├── ConfiguracoesCorte.tsx
│   ├── ConfiguracoesFerramenta.tsx
│   ├── CadastroPeca.tsx
│   ├── ListaPecas.tsx
│   ├── PreviewCanvas.tsx
│   ├── VisualizadorGCode.tsx
│   ├── DicionarioGCode.tsx
│   ├── InfoTooltip.tsx
│   └── ui/                   # Componentes shadcn/ui
├── lib/
│   ├── api-client.ts         # Cliente HTTP para API
│   ├── parametros-info.tsx   # Documentação técnica
│   ├── sanitize.ts           # Sanitização de entrada
│   ├── validation-rules.ts   # Regras de validação
│   └── utils.ts              # Utilitários gerais
├── stores/
│   └── useConfigStore.ts     # Estado global (Zustand)
├── hooks/
│   └── useLocalStorage.ts    # Persistência local
└── types/
    └── index.ts              # Definições TypeScript
```

## Stack Tecnológica

### Frontend
- **Framework**: Next.js 16 (App Router), React 19, TypeScript 5
- **Estilização**: Tailwind CSS 3, shadcn/ui
- **Estado**: Zustand 5 (persistência local), React Query (server state)
- **Autenticação**: JWT (gerenciado pelo backend Express)
- **HTTP Client**: Fetch API com wrapper customizado
- **Validação**: Validação nativa HTML5 + custom validators
- **Canvas**: API nativa do navegador
- **Build**: Turbopack

### Backend
- **Framework**: Express.js, TypeScript
- **Autenticação**: JWT com bcrypt
- **Banco de Dados**: Supabase (PostgreSQL) com service role key
- **Email**: Resend
- **Validação**: Zod (runtime validation)
- **Segurança**: Helmet, CORS, rate limiting

### Segurança
- **Backend**: Todas as operações sensíveis (auth, database) no servidor Express
- **JWT**: Tokens assinados com secret (expiração: 30 dias)
- **Senhas**: Hasheadas com bcrypt (10 rounds) no backend
- **API**: Rate limiting, CORS, Helmet, sanitização de inputs com Zod
- **Frontend**: Apenas armazena JWT (localStorage), validação básica de UI
- **Supabase**: Service role key apenas no backend, RLS habilitado
- **Email**: Verificação obrigatória, tokens com expiração (24h)
- **Proteção de Rotas**: Client-side `<ProtectedRoute>` + backend middleware `requireAuth`

## Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento (porta 3000)
- `npm run build` - Build de produção
- `npm run start` - Servidor de produção
- `npm run lint` - Linter (ESLint)
- `npm test` - Testes unitários (Vitest)
- `npm run test:e2e` - Testes end-to-end (Playwright)

## Algoritmo de Nesting

O sistema utiliza uma estratégia greedy de bin packing 2D:

1. Ordenação de peças por área (decrescente)
2. Manutenção de lista de pontos candidatos
3. Posicionamento iterativo com validação de colisões
4. Geração de novos candidatos após cada posicionamento

## Integração com Backend

A aplicação se comunica com uma API backend separada (`cnc-builder-api`) para autenticação, persistência de dados e geração de G-code. Configure a URL da API:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Nota:** A autenticação é gerenciada inteiramente pelo backend. O frontend apenas consome endpoints protegidos incluindo JWT nos headers.

### Endpoints do Backend

**Autenticação (públicos):**
- `POST /api/auth/signup` - Criar conta
- `POST /api/auth/login` - Login com email/senha
- `POST /api/auth/google` - Login com Google
- `POST /api/auth/verify-email` - Verificar email
- `POST /api/auth/forgot-password` - Solicitar reset de senha
- `POST /api/auth/reset-password` - Redefinir senha
- `GET /api/auth/me` - Obter usuário autenticado

**Dados (requerem autenticação via JWT):**
- `GET/POST/PATCH/DELETE /api/projects` - Projetos salvos
- `GET/POST/PATCH/DELETE /api/presets` - Presets de configuração
- `GET/PUT /api/preferences` - Preferências do usuário
- `POST /api/gcode/generate` - Geração de G-code

**Autenticação de Requisições:**
```typescript
// O ApiClient automaticamente inclui o JWT
headers: {
  'Authorization': `Bearer ${jwt_token}`
}
```

## Formato do G-code Gerado

O arquivo gerado contém:

- Cabeçalho com configurações (G21, G90, M3)
- Comandos de corte para cada peça
- Suporte a múltiplas passadas
- Compensação de ferramenta (G41/G42/G40)
- Rampa de entrada opcional
- Comandos de finalização (M5, M30)

### Exemplo de Saída

```gcode
(--- LEGENDA DOS COMANDOS G-CODE ---)
(G21 mm | G90 absoluto | G0 rapido | G1 corte | M3 ligar | M5 desligar | M30 fim)
(-------------------------------------)

(Chapa 2850x1500 mm, Z 15 mm)
G21 ; Define unidades em milímetros
G90 ; Usa coordenadas absolutas
G0 Z5 ; Levanta a fresa para posição segura
M3 S18000 ; Liga o spindle a 18000 RPM

; Peca 1 (500x500) passada 1
G0 Z5 ; Levanta fresa antes de posicionar
G0 X0.00 Y0.00 ; Posiciona no início da peça
G1 Z-5.00 F300 ; Desce a fresa até -5.00mm
G1 X500.00 Y0.00 F2000 ; Corta lado inferior
G1 X500.00 Y500.00 ; Corta lado direito
G1 X0.00 Y500.00 ; Corta lado superior
G1 X0.00 Y0.00 ; Corta lado esquerdo
G0 Z5 ; Levanta fresa após corte

...

G0 Z5 ; Levanta a fresa
M5 ; Desliga o spindle
G0 X0 Y0 ; Volta para o ponto inicial
M30 ; Fim do programa
```

## Licença

Uso interno.
