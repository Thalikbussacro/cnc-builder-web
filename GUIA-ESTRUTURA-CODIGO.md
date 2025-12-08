# GUIA DE ESTRUTURA DO CÓDIGO - CNC Builder Web

> **Objetivo:** Este guia explica a organização do código frontend, propósito de cada pasta, arquivo, e onde acontecem validações, testes, comunicação com backend e renderização de componentes.

---

## 📁 ESTRUTURA DE PASTAS

```
cnc-builder-web/
├── app/                          # Next.js App Router (páginas e layouts)
│   ├── page.tsx                  # Página principal (HOME)
│   ├── layout.tsx                # Layout raiz da aplicação
│   ├── globals.css               # Estilos globais
│   ├── robots.ts                 # SEO - robots.txt
│   └── sitemap.ts                # SEO - sitemap.xml
│
├── components/                   # Componentes React reutilizáveis
│   ├── ui/                      # Componentes base (shadcn/ui)
│   ├── ConfiguracoesChapa.tsx   # Formulário de configuração da chapa
│   ├── ConfiguracoesCorte.tsx   # Formulário de parâmetros de corte
│   ├── ConfiguracoesFerramenta.tsx # Formulário da fresa
│   ├── CadastroPeca.tsx         # Formulário para adicionar peças
│   ├── ListaPecas.tsx           # Lista de peças cadastradas
│   ├── PreviewCanvas.tsx        # Visualização 2D com Canvas API
│   ├── VisualizadorGCode.tsx    # Modal com G-code gerado
│   ├── Sidebar.tsx              # Navegação lateral
│   └── [outros componentes...]
│
├── contexts/                     # React Contexts (estado compartilhado)
│   └── ValidationContext.tsx    # Rastreia erros de validação
│
├── hooks/                        # Custom Hooks (lógica reutilizável)
│   ├── useLocalStorage.ts       # Persistência no navegador
│   ├── useDebounce.ts           # Debounce de valores
│   ├── useConfigValidation.ts   # Validação de mudanças
│   ├── useKeyboardShortcuts.ts  # Atalhos de teclado
│   └── __tests__/               # Testes dos hooks
│
├── lib/                          # Utilitários e helpers
│   ├── api-client.ts            # Cliente HTTP para chamadas à API
│   ├── validation-rules.ts      # Regras de validação
│   ├── sanitize.ts              # Sanitização de entrada
│   └── utils.ts                 # Funções auxiliares
│
├── stores/                       # Estado global (Zustand)
│   └── useConfigStore.ts        # Store principal da aplicação
│
├── types/                        # Tipos TypeScript
│   └── index.ts                 # Definições centralizadas
│
├── e2e/                          # Testes End-to-End (Playwright)
│   └── *.spec.ts                # Testes de fluxos completos
│
└── public/                       # Assets estáticos (imagens, fonts)
```

---

## 🎯 PROPÓSITO DE CADA PASTA

### `app/` - Next.js App Router

**Propósito:** Define as páginas e layouts da aplicação usando o App Router do Next.js 15.

#### `layout.tsx` (100 linhas) - Layout Raiz
```tsx
export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <ThemeProvider>          {/* Dark/Light theme */}
          <Providers>            {/* React Query */}
            <ErrorBoundary>      {/* Captura erros React */}
              <OfflineIndicator/> {/* Indicador de offline */}
              {children}
            </ErrorBoundary>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**O que configura:**
- ✅ Providers globais (React Query, Tema)
- ✅ Error boundary para capturar crashes
- ✅ Metadados SEO (título, descrição)
- ✅ Fontes (Plus Jakarta Sans, JetBrains Mono)

#### `page.tsx` (618 linhas) - Página Principal

**Responsabilidade:** Orquestra TODA a interface da aplicação.

**O que gerencia:**
- Estado local (versão do gerador, visualizador aberto, erros)
- React Query para preview automático
- Validação de peças antes de adicionar
- Geração de G-code
- Modais de confirmação

**Estrutura visual:**
```
<MainLayout>
  <Sidebar>                    {/* Desktop: lateral | Mobile: overlay */}
    - Adicionar Peça (botão)
    - Configurações Chapa
    - Configurações Corte
    - Configurações Ferramenta
    - Seletor Nesting
    - Theme Toggle
  </Sidebar>

  <div className="flex-1">    {/* Área principal */}
    <TopBar>
      - Logo
      - Dicionário G-Code
      - Botão "Gerar G-code"
      - Botão "Limpar"
    </TopBar>

    <Grid cols={2}>
      <LeftPanel>
        - ConfiguracoesChapa
        - ConfiguracoesCorte
        - ConfiguracoesFerramenta
        - SeletorNesting
        - CadastroPeca
      </LeftPanel>

      <RightPanel>
        - PreviewCanvas        {/* Visualização 2D */}
        - ListaPecas          {/* Lista de peças */}
      </RightPanel>
    </Grid>
  </div>
</MainLayout>
```

**Componentes carregados dinamicamente (code splitting):**
```tsx
const VisualizadorGCode = dynamic(() => import('@/components/VisualizadorGCode'))
const DicionarioGCode = dynamic(() => import('@/components/DicionarioGCode'))
const ValidationDialog = dynamic(() => import('@/components/ValidationDialog'))
```

**Por que dinâmico?** Reduz tamanho inicial do bundle, melhora performance.

---

### `components/` - Componentes React

#### `components/ui/` - Componentes Base (shadcn/ui)

**Propósito:** Componentes atômicos e acessíveis reutilizados em toda aplicação.

| Componente | Uso |
|-----------|-----|
| `button.tsx` | Botões com variantes (default, outline, ghost) |
| `input.tsx` | Campos de entrada de texto |
| `card.tsx` | Cards para agrupar conteúdo |
| `select.tsx` | Dropdowns |
| `dialog.tsx` | Modais |
| `alert-dialog.tsx` | Modais de confirmação |
| `tabs.tsx` | Abas (usado na sidebar mobile) |
| `checkbox.tsx` | Checkboxes |
| `radio-group.tsx` | Radio buttons |
| `badge.tsx` | Etiquetas (ex: "Recomendado") |
| `scroll-area.tsx` | Áreas com scroll customizado |
| `sonner.tsx` | Toast notifications |

**Origem:** Biblioteca [shadcn/ui](https://ui.shadcn.com/) baseada em Radix UI.

#### Componentes de Domínio (Específicos da Aplicação)

##### `ConfiguracoesChapa.tsx`
**Responsabilidade:** Formulário para dimensões da chapa.

**Campos:**
- Largura (mm)
- Altura (mm)
- Espessura (mm)

**Validação:** Ao alterar, valida se peças ainda cabem.

---

##### `ConfiguracoesCorte.tsx`
**Responsabilidade:** Formulário para parâmetros de corte.

**Campos:**
- Profundidade total (mm)
- Número de passadas
- Profundidade por passada (mm) - auto-ajuste mútuo
- Espaçamento entre peças (mm)
- Feedrate (mm/min)
- Plunge rate (mm/min)
- Rapids speed (mm/min)
- Spindle speed (RPM)
- Usar rampa (checkbox)
- Ângulo da rampa (graus)
- Margem de borda (mm)

**Validação:** Cada campo valida em tempo real com `validation-rules.ts`.

---

##### `ConfiguracoesFerramenta.tsx`
**Responsabilidade:** Formulário da fresa.

**Campos:**
- Diâmetro (mm)
- Número da ferramenta

---

##### `CadastroPeca.tsx` (~150 linhas)
**Responsabilidade:** Formulário para adicionar novas peças.

**Campos:**
- Largura (mm)
- Altura (mm)
- Tipo de corte (externo/interno/na-linha)
- Quantidade (quantas peças iguais)

**Fluxo ao adicionar:**
```
1. User preenche campos
2. Valida básico (valores > 0)
3. Compara com chapa (peça cabe?)
4. Cria N peças com UUID único
5. Chama onValidarAntes() → API validate
   ├─ Se cabem: adiciona direto
   └─ Se não cabem: abre modal de confirmação
6. Limpa formulário
7. Toast de sucesso
```

---

##### `ListaPecas.tsx`
**Responsabilidade:** Exibir lista de peças cadastradas com ações.

**Exibe:**
- Número da peça
- Dimensões (LxA)
- Tipo de corte
- Ações: Remover, Ignorar

**Peças ignoradas:** Ficam na lista mas não são cortadas (útil para testes).

---

##### `PreviewCanvas.tsx` (~150+ linhas)
**Responsabilidade:** Desenhar visualização 2D das peças na chapa usando Canvas API.

**O que desenha:**
```
┌─────────────────────────────────┐
│ Chapa (2850x1500mm)             │  ← Retângulo branco
│                                 │
│  ┌────┐  ┌────┐  ┌────┐        │  ← Peças posicionadas (azul)
│  │ P1 │  │ P2 │  │ P3 │        │
│  └────┘  └────┘  └────┘        │
│                                 │
│  ┌─────────┐                    │
│  │   P4    │                    │
│  └─────────┘                    │
└─────────────────────────────────┘
```

**Features:**
- ✅ Auto-escala para caber na tela
- ✅ Cores diferentes para tipos de corte
- ✅ Labels com número da peça
- ✅ Margem e espaçamento visualizado
- ✅ Grid de fundo opcional

**Atualização:** Automática via React Query quando peças ou configs mudam.

---

##### `VisualizadorGCode.tsx`
**Responsabilidade:** Modal fullscreen com G-code gerado.

**Features:**
- ✅ Syntax highlighting
- ✅ Número de linhas
- ✅ Tamanho em KB
- ✅ Tempo estimado
- ✅ Taxa de aproveitamento
- ✅ Botão copiar
- ✅ Download em 4 formatos (.nc, .tap, .gcode, .cnc)

---

##### `DicionarioGCode.tsx`
**Responsabilidade:** Modal com referência de comandos G-code.

**Conteúdo:**
- Tabela com comandos (G0, G1, M3, M5, etc)
- Descrição de cada comando
- Exemplos de uso

---

##### `Sidebar.tsx` (205 linhas)
**Responsabilidade:** Navegação lateral com indicadores de erro.

**Seções:**
- Adicionar Peça (destaque)
- Chapa (com ícone de erro se inválido)
- Corte (com ícone de erro se inválido)
- Ferramenta (com ícone de erro se inválido)
- Nesting

**Desktop:** Sempre visível na lateral esquerda
**Mobile:** Overlay que abre/fecha com botão hambúrguer

---

##### `ValidationDialog.tsx`
**Responsabilidade:** Exibir erros e avisos de validação.

**Mostra:**
```
⚠️ AVISOS (2)
- Profundidade acima do recomendado (30mm)
  Sugestão: Use entre 1-30mm
- Feedrate muito alto (3500 mm/min)
  Sugestão: Use entre 500-3000 mm/min

❌ ERROS (0)

[Cancelar] [Continuar mesmo assim]
```

---

##### `ModalConfirmacaoRemocao.tsx`
**Responsabilidade:** Confirmar remoção de peças que não cabem.

**Quando aparece:**
- User adiciona peças mas não cabem na chapa
- User altera config e peças não cabem mais

**Opções:**
- ✅ Confirmar: Remove peças que não cabem e aplica mudança
- ❌ Cancelar: Reverte mudança, mantém peças

---

#### Outros Componentes Importantes

- **ErrorBoundary.tsx** - Captura erros React e exibe tela amigável
- **Providers.tsx** - Provedor de React Query e ValidationContext
- **ThemeProvider.tsx** - Provedor de tema (dark/light)
- **ThemeToggle.tsx** - Botão para alternar tema
- **OfflineIndicator.tsx** - Indicador quando sem internet
- **InfoTooltip.tsx** - Tooltip com informações sobre campos

---

### `contexts/` - React Contexts

#### `ValidationContext.tsx` (132 linhas)

**Responsabilidade:** Rastrear erros de validação globalmente.

**Estrutura:**
```typescript
interface ValidationContextValue {
  registerError(tab: string, field: string): void
  clearError(tab: string, field: string): void
  hasErrors(): boolean
  getTabsWithErrors(): string[]
  tabHasErrors(tab: string): boolean
}
```

**Uso:**
```tsx
// Em ConfiguracoesChapa.tsx
const { registerError, clearError } = useValidationContext()

// Se valor inválido
registerError('chapa', 'largura')

// Se valor válido
clearError('chapa', 'largura')
```

**Benefício:** Sidebar mostra ícone de erro nas abas com problemas.

---

### `hooks/` - Custom Hooks

#### `useLocalStorage.ts` (62 linhas)

**Responsabilidade:** Persistir estado no localStorage do navegador.

**Uso:**
```tsx
const [value, setValue] = useLocalStorage<string>('chave', 'valorPadrão')

setValue('novoValor')  // Salva automaticamente no localStorage
```

**Features:**
- ✅ SSR-safe (não quebra durante renderização no servidor)
- ✅ Debounce de 500ms (evita salvar a cada tecla digitada)
- ✅ Validação de tipos
- ✅ Fallback se localStorage indisponível

---

#### `useDebounce.ts` (26 linhas)

**Responsabilidade:** Atrasar atualização de valor.

**Uso:**
```tsx
const [searchTerm, setSearchTerm] = useState('')
const debouncedSearch = useDebounce(searchTerm, 300)

// searchTerm atualiza imediatamente
// debouncedSearch só atualiza 300ms após última mudança
```

**Benefício:** Evita validar/processar a cada tecla digitada.

---

#### `useKeyboardShortcuts.ts` (42 linhas)

**Responsabilidade:** Atalhos de teclado globais.

**Atalhos configurados:**
```
Ctrl/Cmd + Enter  → Gerar G-code
Ctrl/Cmd + K      → Limpar todas peças
Escape            → Fechar modals
```

**Uso:**
```tsx
useKeyboardShortcuts({
  onGenerate: () => handleGerarGCode(),
  onClear: () => handleLimpar(),
  onClose: () => setModalAberto(false)
})
```

---

#### `useConfigValidation.ts` (140 linhas)

**Responsabilidade:** Validar mudanças de configuração com API.

**Métodos:**
```typescript
validateChapaChange(novaChapa)      // Valida mudança de chapa
validateCorteChange(novoCorte)      // Valida mudança de corte
validateFerramentaChange(...)       // Valida mudança de ferramenta
validateNestingChange(...)          // Valida mudança de algoritmo
cancelPendingChange()               // Cancela mudança pendente
```

**Fluxo:**
```
1. User altera largura da chapa
2. validateChapaChange() é chamado
3. Faz requisição à API validate
   ├─ Se cabem: retorna true → aplica mudança
   └─ Se não cabem: setPendingChange() → abre modal
4. User confirma ou cancela no modal
```

---

### `lib/` - Utilitários e Helpers

#### `api-client.ts` (256 linhas) ⭐ IMPORTANTE

**Responsabilidade:** Cliente HTTP para comunicação com backend.

**Classe:**
```typescript
class ApiClient {
  static gerarGCode(request, timeout?)     // POST /api/gcode/generate
  static validate(request, timeout?)       // POST /api/gcode/validate
  static healthCheck()                     // GET /health
}
```

**Features:**
- ✅ Throttling automático (100ms entre requests)
- ✅ Timeout configurável (padrão 30s)
- ✅ Validação de respostas
- ✅ Tratamento de erros
- ✅ Headers automáticos (Content-Type, UUID)

**Exemplo de uso:**
```tsx
const response = await ApiClient.gerarGCode({
  pecas: [...],
  configChapa: { largura: 2850, altura: 1500, espessura: 15 },
  configCorte: { ... },
  metodoNesting: 'guillotine'
})

console.log(response.gcode)      // Código G-code
console.log(response.metadata)   // Tempo, métricas, etc
```

---

#### `validation-rules.ts` (172 linhas)

**Responsabilidade:** Regras de validação frontend.

**Estrutura:**
```typescript
VALIDATION_RULES = {
  profundidade: {
    min: 1,
    max: 50,
    recomendadoMin: 1,
    recomendadoMax: 30,
    mensagemMin: 'Profundidade muito rasa',
    mensagemMax: 'Profundidade muito profunda'
  },
  feedrate: { ... },
  // ... mais campos
}

function validateField(field, value) {
  const rules = VALIDATION_RULES[field]
  if (value < rules.min) return { valid: false, severity: 'error', ... }
  if (value > rules.recomendadoMax) return { valid: true, severity: 'warning', ... }
  return { valid: true }
}
```

**Uso em componentes:**
```tsx
const result = validateField('profundidade', 40)
if (result.severity === 'error') {
  // Mostra erro
} else if (result.severity === 'warning') {
  // Mostra aviso
}
```

---

#### `sanitize.ts` (24 linhas)

**Responsabilidade:** Remover HTML malicioso de strings.

**Uso:**
```tsx
import { sanitizeString } from '@/lib/sanitize'

const userInput = "<script>alert('hack')</script>"
const clean = sanitizeString(userInput)  // "alert('hack')"
```

**Onde é usado:**
- Nome de peças
- Qualquer input de texto livre

---

#### `utils.ts` (91 linhas)

**Funções utilitárias:**

```typescript
// Merge de classes Tailwind
cn(...classes) → string

// Formata tempo em HH:MM:SS
formatarTempo(segundos) → "2h 30min 45s"

// Download de arquivo G-code
downloadGCode(conteudo, formato) → void

// Versões disponíveis do gerador
VERSOES_GERADOR = [
  { versao: 'v1', nome: 'V1 - Clássico', ... },
  { versao: 'v2', nome: 'V2 - Otimizado', recomendado: true, ... }
]
```

---

### `stores/` - Estado Global (Zustand)

#### `useConfigStore.ts` (130 linhas) ⭐ IMPORTANTE

**Responsabilidade:** Gerenciar estado global da aplicação.

**Estado:**
```typescript
interface ConfigStore {
  // Dados
  configChapa: { largura, altura, espessura }
  configCorte: { profundidade, feedrate, ... }
  configFerramenta: { diametro, numeroFerramenta }
  metodoNesting: 'greedy' | 'shelf' | 'guillotine'
  pecas: Peca[]

  // Actions
  setConfigChapa(partial)
  setConfigCorte(partial)
  setConfigFerramenta(partial)
  setMetodoNesting(metodo)
  addPeca(peca | pecas[])
  removePeca(id)
  updatePeca(id, updates)
  setPecas(pecas)
  reset()
}
```

**Persistência:**
```typescript
// Usa middleware persist
persist(
  (set, get) => ({ ... }),
  {
    name: 'cnc-config-storage',  // Chave no localStorage
    version: 1,
    migrate: (state, version) => { ... }  // Migração de dados
  }
)
```

**Uso em componentes:**
```tsx
const { configChapa, setConfigChapa, pecas, addPeca } = useConfigStore()

// Atualizar chapa
setConfigChapa({ largura: 3000 })

// Adicionar peça
addPeca({ id: '1', largura: 500, altura: 500, tipoCorte: 'externo' })
```

**Benefício:** Estado persiste mesmo após fechar navegador.

---

### `types/` - Tipos TypeScript

#### `index.ts` (175 linhas)

**Tipos principais:**

```typescript
// Peça
type TipoCorte = 'externo' | 'interno' | 'na-linha'
interface Peca {
  id: string
  largura: number
  altura: number
  tipoCorte: TipoCorte
  nome?: string
  ignorada?: boolean
}

// Peça com posição
interface PecaPosicionada extends Peca {
  x: number
  y: number
}

// Configurações
interface ConfiguracoesChapa {
  largura: number
  altura: number
  espessura: number
}

interface ConfiguracoesCorte {
  profundidade: number
  espacamento: number
  numeroPassadas: number
  profundidadePorPassada: number
  feedrate: number
  plungeRate: number
  rapidsSpeed: number
  spindleSpeed: number
  usarRampa: boolean
  anguloRampa: number
  // ... mais
}

interface ConfiguracoesFerramenta {
  diametro: number
  numeroFerramenta: number
}

// Resultado de validação
type ValidationSeverity = 'error' | 'warning'
interface ValidationIssue {
  severity: ValidationSeverity
  field: string
  message: string
  suggestion?: string
  currentValue?: number
  recommendedValue?: number
}

interface ValidationResult {
  valid: boolean
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
}

// Tempo estimado
interface TempoEstimado {
  tempoCorte: number
  tempoMergulho: number
  tempoPosicionamento: number
  tempoTotal: number
  distanciaCorte: number
  distanciaMergulho: number
  distanciaPosicionamento: number
  distanciaTotal: number
}
```

---

### `e2e/` - Testes End-to-End

**Framework:** Playwright

#### `gcode-generation.spec.ts`

**Testes implementados:**
- ✅ Adicionar peça e gerar G-code
- ✅ Adicionar múltiplas peças
- ✅ Validar campos obrigatórios
- ✅ Alterar configurações
- ✅ Mudar algoritmo de nesting

**Exemplo:**
```typescript
test('deve adicionar peça e visualizar G-code', async ({ page }) => {
  // Navegar para aplicação
  await page.goto('/')

  // Preencher formulário
  await page.fill('[data-testid="largura"]', '500')
  await page.fill('[data-testid="altura"]', '500')
  await page.click('[data-testid="adicionar-peca"]')

  // Gerar G-code
  await page.click('[data-testid="gerar-gcode"]')

  // Verificar modal abriu
  await expect(page.locator('[data-testid="visualizador"]')).toBeVisible()
})
```

**Rodar:**
```bash
npm run test:e2e         # Headless
npm run test:e2e:ui      # UI interativa
npm run test:e2e:headed  # Browser visível
```

---

## 🔄 FLUXO DE DADOS NA APLICAÇÃO

### Fluxo: Adicionar Peça

```
1. User preenche formulário (CadastroPeca)
   ↓
2. Clica "Adicionar"
   ↓
3. handleAdicionar() valida básico
   ↓
4. onValidarAntes() chama API validate
   ↓
5. ApiClient.validate({ pecas: [...existing, ...novos] })
   ↓
6. Backend valida e retorna { valid, pecasPosicionadas, pecasNaoCouberam }
   ↓
7. IF todas cabem:
   │  ↓
   │  addPeca(novos) → Zustand
   │  ↓
   │  localStorage atualizado (persist middleware)
   │  ↓
   │  page.tsx re-render
   │  ↓
   │  React Query refetch preview
   │  ↓
   │  PreviewCanvas e ListaPecas atualizam
   │
8. IF não cabem:
   ↓
   setPendingPecasAdicionais(novos, naoCouberam)
   ↓
   ModalConfirmacaoRemocao abre
   ↓
   User confirma/cancela
```

### Fluxo: Gerar G-code

```
1. User clica "Gerar G-code" ou Ctrl+Enter
   ↓
2. handleVisualizarGCode()
   ↓
3. Verifica hasErrors() (ValidationContext)
   ↓
4. IF há erros → toast.error() e PARA
   ↓
5. ApiClient.validate() (validação final)
   ↓
6. IF erros → abre ValidationDialog e PARA
   │
7. IF warnings → abre ValidationDialog
   ├─ User confirma → continua
   └─ User cancela → PARA
   ↓
8. generateGCodeMutation.mutate()
   ↓
9. ApiClient.gerarGCode()
   ↓
10. POST /api/gcode/generate
    ↓
11. Response: { gcode: string, metadata: {...} }
    ↓
12. setGcodeGerado(response.gcode)
    ↓
13. setVisualizadorAberto(true)
    ↓
14. VisualizadorGCode modal abre
    ↓
15. User visualiza/copia/baixa
```

### Fluxo: Preview Automático (React Query)

```
1. User adiciona peça ou altera config
   ↓
2. Zustand store atualiza
   ↓
3. page.tsx re-render
   ↓
4. useQuery hook detecta mudança em queryKey
   ↓
5. Aguarda 1s (staleTime debounce)
   ↓
6. ApiClient.validate() automático
   ↓
7. Response atualiza previewData
   ↓
8. PreviewCanvas recebe novas posições
   ↓
9. Canvas redesenha peças
```

---

## 🧪 ONDE ACONTECEM AS VALIDAÇÕES

### 1️⃣ Validação de Input (Tempo Real)
**Onde:** `validation-rules.ts` + `ValidationContext`
**Quando:** Enquanto user digita
**O que valida:** Limites min/max, valores recomendados
**Feedback:** Borda vermelha no campo + ícone na sidebar

### 2️⃣ Validação de Peças (Antes de Adicionar)
**Onde:** `CadastroPeca.tsx` + `ApiClient.validate()`
**Quando:** User clica "Adicionar"
**O que valida:** Peça cabe na chapa? Colide com outras?
**Feedback:** Modal de confirmação se não cabe

### 3️⃣ Validação de Configurações (Ao Mudar)
**Onde:** `useConfigValidation.ts` + `ApiClient.validate()`
**Quando:** User altera chapa/corte/ferramenta/nesting
**O que valida:** Peças ainda cabem com nova config?
**Feedback:** Modal de confirmação se peças não cabem

### 4️⃣ Validação Final (Antes de Gerar)
**Onde:** `page.tsx` + `ApiClient.validate()`
**Quando:** User clica "Gerar G-code"
**O que valida:** Tudo válido e seguro?
**Feedback:** ValidationDialog com erros/avisos

---

## 🌐 COMUNICAÇÃO COM BACKEND

### Configuração da URL

**Arquivo:** `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Produção:**
```env
NEXT_PUBLIC_API_URL=https://cnc-builder-api.vercel.app
```

### Endpoints Usados

#### POST /api/gcode/generate
```typescript
// Request
{
  pecas: Peca[],
  configChapa: ConfiguracoesChapa,
  configCorte: ConfiguracoesCorte,
  configFerramenta: ConfiguracoesFerramenta,
  metodoNesting: 'greedy' | 'shelf' | 'guillotine',
  incluirComentarios: boolean
}

// Response
{
  gcode: string,
  metadata: {
    linhas: number,
    tamanhoBytes: number,
    tempoEstimado: TempoEstimado,
    metricas: {
      taxaAproveitamento: number,
      areaUtilizada: number,
      areaTotal: number,
      numeroPassadas: number,
      numeroPecas: number
    },
    configuracoes: { ... }
  }
}
```

#### POST /api/gcode/validate
```typescript
// Request (mesmo que generate)

// Response
{
  valid: boolean,
  errors: ValidationIssue[],
  warnings: ValidationIssue[],
  preview?: {
    tempoEstimado: TempoEstimado,
    metricas: { ... },
    pecasPosicionadas: PecaPosicionada[],
    pecasNaoCouberam: Peca[]
  }
}
```

#### GET /health
```typescript
// Response
{
  status: 'ok'
}
```

### React Query Setup

**Em `page.tsx`:**
```tsx
// Preview automático
const { data: previewData } = useQuery({
  queryKey: ['preview', pecas, configs, metodoNesting],
  queryFn: () => ApiClient.validate({ pecas, ...configs, metodoNesting }),
  enabled: pecas.length > 0,
  staleTime: 1000,  // Debounce 1s
  retry: false,
})

// Geração de G-code
const generateGCodeMutation = useMutation({
  mutationFn: (request) => ApiClient.gerarGCode(request),
  onSuccess: (response) => {
    setGcodeGerado(response.gcode)
    setVisualizadorAberto(true)
    toast.success('G-code gerado com sucesso!')
  },
  onError: (error) => {
    toast.error(error.message)
  }
})
```

---

## 🎨 PADRÕES DE CÓDIGO

### Padrão de Componente

```tsx
"use client"

import { useState, useEffect } from 'react'
import { useConfigStore } from '@/stores/useConfigStore'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface ComponentProps {
  onValidate?: (value: number) => Promise<boolean>
}

export function MyComponent({ onValidate }: ComponentProps) {
  // 1. Hooks de estado
  const { configChapa, setConfigChapa } = useConfigStore()
  const [localState, setLocalState] = useState<string>('')

  // 2. Effects
  useEffect(() => {
    // Lógica de efeito
  }, [dependencies])

  // 3. Handlers
  const handleChange = async (newValue: number) => {
    if (onValidate) {
      const isValid = await onValidate(newValue)
      if (!isValid) return
    }
    setConfigChapa({ largura: newValue })
  }

  // 4. Render
  return (
    <Card>
      <Input
        value={configChapa.largura}
        onChange={(e) => handleChange(Number(e.target.value))}
      />
    </Card>
  )
}
```

### Padrão de Validação com Contexto

```tsx
const { registerError, clearError } = useValidationContext()

const handleChange = (value: number) => {
  const result = validateField('profundidade', value)

  if (result.severity === 'error') {
    registerError('corte', 'profundidade')
  } else {
    clearError('corte', 'profundidade')
    setConfigCorte({ profundidade: value })
  }
}
```

---

## 🚀 COMANDOS ÚTEIS

### Desenvolvimento
```bash
npm run dev          # Inicia servidor desenvolvimento (http://localhost:3000)
npm run build        # Build de produção
npm start            # Inicia servidor produção
npm run lint         # Verifica problemas no código
```

### Testes
```bash
npm test             # Testes unitários (Vitest)
npm run test:ui      # UI interativa de testes
npm run test:coverage # Relatório de cobertura
npm run test:e2e     # Testes E2E (Playwright)
npm run test:e2e:ui  # UI interativa E2E
```

### Análise de Bundle
```bash
ANALYZE=true npm run build  # Gera relatório de tamanho do bundle
```

---

## 📊 STACK TECNOLÓGICA

### Core
- **Next.js 16** - Framework React com SSR
- **React 19** - Biblioteca UI
- **TypeScript 5** - Type safety

### Estado
- **Zustand 5** - Estado global
- **React Query 5** - Gerenciamento de data fetching

### Estilização
- **TailwindCSS 3** - Utility-first CSS
- **shadcn/ui** - Componentes base (Radix UI)
- **next-themes** - Dark/light mode

### Formulários e Validação
- **Zod** - Validação de schemas (no backend)
- **DOMPurify** - Sanitização XSS

### Utilitários
- **lucide-react** - Ícones
- **sonner** - Toast notifications
- **clsx + tailwind-merge** - Merge de classes

### Testes
- **Vitest** - Testes unitários
- **Playwright** - Testes E2E
- **Testing Library** - Utilitários de teste

### PWA
- **next-pwa** - Progressive Web App

---

## 🎯 PRINCIPAIS PONTOS DE ENTRADA

Se você quiser modificar algo específico:

| Quero modificar... | Arquivo a editar |
|-------------------|------------------|
| Layout da página | `app/page.tsx` |
| Formulário de chapa | `components/ConfiguracoesChapa.tsx` |
| Formulário de corte | `components/ConfiguracoesCorte.tsx` |
| Preview 2D | `components/PreviewCanvas.tsx` |
| Adicionar peças | `components/CadastroPeca.tsx` |
| Validações frontend | `lib/validation-rules.ts` |
| Comunicação com API | `lib/api-client.ts` |
| Estado global | `stores/useConfigStore.ts` |
| Tipos TypeScript | `types/index.ts` |
| Estilos globais | `app/globals.css` |
| Atalhos de teclado | `hooks/useKeyboardShortcuts.ts` |

---

## 📝 RESUMO EXECUTIVO

| Camada | Responsável | Tecnologia |
|--------|-------------|------------|
| **UI** | React Components | Next.js + shadcn/ui |
| **Estado Global** | Zustand Store | Zustand + persist |
| **Data Fetching** | React Query | @tanstack/react-query |
| **Validação Frontend** | Regras + Contexto | validation-rules.ts + ValidationContext |
| **Comunicação API** | HTTP Client | api-client.ts (fetch) |
| **Persistência** | localStorage | useLocalStorage hook |
| **Tipos** | TypeScript | types/index.ts |
| **Testes** | Unit + E2E | Vitest + Playwright |
| **Estilização** | Utility CSS | TailwindCSS |

---

**Dúvidas?** Consulte o código diretamente ou verifique os testes em `hooks/__tests__/` e `e2e/` para ver exemplos de uso real.
