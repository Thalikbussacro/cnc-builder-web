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

## Configuração de Autenticação

### 1. Criar conta Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto: `cnc-builder-production`
3. Anote as credenciais em **Settings** → **API**:
   - Project URL
   - anon public key
   - service_role key (secreto)

### 2. Executar SQL no Supabase

No dashboard do Supabase, vá em **SQL Editor** e execute o schema completo de autenticação:

```sql
-- Copiar e colar o SQL da seção "Setup do Banco de Dados"
-- no arquivo docs/LANDING_AUTH_IMPLEMENTATION_PLAN.md
```

O schema cria as tabelas: `users`, `accounts`, `sessions`, `verification_tokens` com RLS habilitado.

### 3. Criar conta Resend

1. Acesse [resend.com](https://resend.com) e crie uma conta
2. Vá em **API Keys** → **Create API Key**
3. Nome: `cnc-builder-dev`
4. Copie a key (começa com `re_`)
5. **Importante**: guarde a key, não é possível visualizar novamente

### 4. Configurar variáveis de ambiente

Crie arquivo `.env.local` na raiz do projeto:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<gerar_com_comando_abaixo>

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Resend
RESEND_API_KEY=re_xxxxxxxxxxxxx

# API Backend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### Gerar NEXTAUTH_SECRET

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Windows (Git Bash) / Linux / Mac:**
```bash
openssl rand -base64 32
```

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

1. **Cadastro** (`/signup`):
   - Usuário preenche nome, email e senha
   - Sistema envia email de verificação
   - Usuário clica no link e ativa a conta

2. **Login** (`/login`):
   - Usuário entra com email e senha
   - Sistema valida credenciais
   - Redireciona para `/app` (aplicação)

3. **Recuperação de senha** (`/forgot-password`):
   - Usuário informa email
   - Sistema envia link de reset (válido por 1 hora)
   - Usuário redefine senha

4. **Logout**:
   - Botão de logout no header da aplicação
   - Redireciona para landing page (`/`)

## Funcionalidades

- Configuração de dimensões da chapa (largura, altura, espessura)
- Configuração de parâmetros de corte (profundidade, espaçamento, velocidades)
- Cadastro manual ou importação via CSV de peças retangulares
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
- **Estado**: Zustand 5 (persistência local)
- **Autenticação**: NextAuth.js v5 (beta)
- **Banco de Dados**: Supabase (PostgreSQL)
- **Email**: Resend
- **Validação**: Validação nativa HTML5 + custom validators
- **Canvas**: API nativa do navegador
- **Build**: Turbopack

### Segurança
- Senhas hasheadas com bcrypt (salt rounds: 10)
- Session tokens JWT (httpOnly cookies)
- Middleware de proteção de rotas
- Row Level Security (RLS) no Supabase
- Validação de email antes do primeiro login
- Rate limiting via Resend (100 emails/dia no plano gratuito)

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

A aplicação se comunica com uma API backend separada (`cnc-builder-api`) para geração de G-code. Configure a URL da API:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Nota:** O backend NÃO precisa de autenticação nesta versão. A autenticação é gerenciada pelo frontend (NextAuth + Supabase).

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
