# 🚀 Melhorias - CNC Builder Web (Frontend)

> **Como usar este arquivo:**
> 1. Peça ao Claude Code: "Implemente a melhoria #X.Y do MELHORIAS.md"
> 2. Após implementar, ele marcará `[ ]` como `[x]`
> 3. Commit após cada melhoria ou grupo de melhorias relacionadas

**Última atualização:** 2025-12-03
**Versão:** 2.0.0

---

## 📊 Dashboard de Progresso

### Status Geral
- **Total:** 35 melhorias
- **Concluídas:** 27/35 (77%)
- **Em progresso:** 0/35 (0%)
- **Pendentes:** 8/35 (23%)

### Por Categoria
- [x] **Migração Backend:** 1/2
- [x] **Performance:** 4/4
- [x] **UX/UI:** 6/6
- [x] **Segurança:** 4/4
- [x] **Código e Arquitetura:** 3/4
- [ ] **Testes:** 2/3
- [x] **Acessibilidade:** 3/3
- [x] **SEO:** 2/2
- [x] **PWA:** 2/2

---

## 🎯 Ordem Recomendada (Por Fase)

### ⚡ Fase 1 - Limpeza URGENTE (Semana 1)
1. [#1.1](#11-deletar-código-duplicado) ← **FAZER PRIMEIRO!**
2. [#2.1](#21-reduzir-debounce-agressivo)
3. [#3.1](#31-error-boundary)
4. [#3.2](#32-loading-states)

### 🚀 Fase 2 - Performance (Semana 2-3)
1. [#2.2](#22-memoização-de-canvas)
2. [#2.3](#23-bundle-splitting)
3. [#2.4](#24-otimizar-localstorage)

### 🎨 Fase 3 - UX (Semana 4-5)
1. [#3.3](#33-toast-notifications)
2. [#3.4](#34-keyboard-shortcuts)
3. [#3.5](#35-dark-mode)
4. [#3.6](#36-upload-csv)

### 🏗️ Fase 4 - Arquitetura (Semana 6-7)
1. [#5.1](#51-estado-global-zustand)
2. [#5.2](#52-react-query)
3. [#5.3](#53-typescript-strict)

### ✅ Fase 5 - Testes + A11y (Semana 8)
1. [#6.1](#61-testes-unitários-vitest)
2. [#6.2](#62-testes-e2e-playwright)
3. [#7.1](#71-aria-labels)

---

# 1. Migração para Backend

## 1.1. Deletar Código Duplicado
- [x] **Status:** ✅ Concluído em 2025-12-03
- **Prioridade:** 🔴 **CRÍTICA - FAZER PRIMEIRO!**
- **Tempo:** 15 minutos
- **Impacto:** -30KB bundle, elimina inconsistências

### ⚠️ IMPORTANTE
Estes arquivos estão duplicados do backend e **NÃO SÃO MAIS USADOS**:

### Passo a Passo

**1. Verificar que API está funcionando:**
```bash
curl http://localhost:3001/health
# Deve retornar: {"status":"ok"}
```

**2. DELETAR arquivos redundantes:**
```bash
# No terminal do projeto web:
cd c:\Users\Thalik\Repos\cnc-builder-web

# DELETAR (não usados mais - API faz tudo):
rm lib/gcode-generator.ts
rm lib/gcode-generator-v2.ts
rm lib/nesting-algorithm.ts
rm lib/validator.ts

# ✅ MANTER (usados no frontend):
# lib/api-client.ts          # Cliente HTTP
# lib/validation-rules.ts    # Apenas validateField() e sanitizeValue()
# lib/defaults.ts            # Valores padrão
```

**3. Verificar que app ainda funciona:**
```bash
npm run dev
# Abrir http://localhost:3000
# Testar: adicionar peça → visualizar preview → gerar G-code
```

**4. Adicionar documentação em `lib/validation-rules.ts`:**

No topo do arquivo, adicionar:
```typescript
/**
 * VALIDAÇÃO FRONTEND - Apenas UX
 *
 * ⚠️ IMPORTANTE: Este arquivo é APENAS para validação UX (imediata).
 * A fonte única da verdade é o BACKEND (/api/gcode/validate).
 *
 * Uso permitido:
 * - validateField(): validação enquanto usuário digita
 * - sanitizeValue(): limita valores absurdos antes de enviar para API
 *
 * ❌ NUNCA adicionar lógica de negócio aqui - sempre no backend!
 */
```

### Teste de Validação
- [ ] Arquivos deletados
- [ ] App inicia sem erros
- [ ] Preview funciona
- [ ] Geração de G-code funciona

### Commit
```bash
git add .
git commit -m "refactor: remove duplicated backend code (#1.1)

- Remove local G-code generation (uses API now)
- Remove local nesting algorithms (uses API)
- Remove local validator (backend validates)
- Keep validation-rules.ts for UX only
- Reduces bundle by ~30KB

BREAKING: App now requires API running at localhost:3001"
```

---

## 1.2. Simplificar validation-rules.ts
- [ ] **Status:** Pendente
- **Prioridade:** 🟡 MÉDIA
- **Tempo:** 20 minutos
- **Dependências:** Requer #1.1 completo

### Descrição
Remover validações complexas (backend já faz). Manter apenas UX.

### Passo a Passo

**1. Editar `lib/validation-rules.ts`:**

Manter apenas:
```typescript
// MANTER estas funções (UX):
export function validateField(fieldName, value): FieldValidationResult { ... }
export function sanitizeValue(fieldName, value): number { ... }

export const VALIDATION_RULES = { ... } // Manter

// REMOVER se existir:
// - Funções de validação complexas
// - Lógica que backend já faz
```

**2. Verificar que useValidatedInput ainda funciona:**
```bash
# Testar inputs:
# 1. Digite valor inválido → deve mostrar erro
# 2. Digite valor válido → erro desaparece
# 3. Valor fora do range → sanitiza automaticamente
```

### Teste de Validação
- [ ] Inputs validam corretamente
- [ ] Sanitização funciona
- [ ] Sem erros de compilação

---

# 2. Performance

## 2.1. Reduzir Debounce Agressivo
- [x] **Status:** ✅ Concluído em 2025-12-03
- **Prioridade:** 🔴 CRÍTICA
- **Tempo:** 10 minutos
- **Impacto:** Preview 40% mais responsivo

### Problema
Debounce de 500ms deixa preview "travado" (usuário digita e nada acontece por meio segundo).

### Passo a Passo

**1. Editar `app/page.tsx`:**

Localizar todos `useDebounce` e alterar de 500ms para 300ms:

```typescript
// ANTES:
const debouncedLargura = useDebounce(configChapa.largura, 500);
const debouncedAltura = useDebounce(configChapa.altura, 500);
const debouncedProfundidade = useDebounce(configCorte.profundidade, 500);
// ... etc

// DEPOIS:
const debouncedLargura = useDebounce(configChapa.largura, 300);
const debouncedAltura = useDebounce(configChapa.altura, 300);
const debouncedProfundidade = useDebounce(configCorte.profundidade, 300);
// ... etc (substituir TODOS)
```

**2. Testar responsividade:**
- Digite um valor em "Largura"
- Preview deve atualizar em ~300ms (imperceptível)
- Antes demorava 500ms (perceptível)

### Teste de Validação
- [ ] Todos debounces alterados
- [ ] Preview atualiza mais rápido
- [ ] Sem erros

### Commit
```bash
git commit -m "perf: reduce debounce from 500ms to 300ms (#2.1)

Makes preview 40% more responsive. 300ms is imperceptible
while 500ms feels laggy."
```

---

## 2.2. Memoização de Canvas
- [x] **Status:** ✅ Concluído em 2025-12-04
- **Prioridade:** 🟡 MÉDIA
- **Tempo:** 30 minutos
- **Impacto:** Renderização 3-5x mais rápida

### Descrição
Canvas re-renderiza completamente a cada mudança (lento com 100+ peças).

### Passo a Passo

**1. Adicionar memo em `components/PreviewCanvas.tsx`:**

No início do arquivo:
```typescript
import { memo, useMemo } from 'react';

// ANTES:
export function PreviewCanvas({ chapaLargura, chapaAltura, pecasPosicionadas, ... }) {

// DEPOIS:
export const PreviewCanvas = memo(function PreviewCanvas({
  chapaLargura,
  chapaAltura,
  pecasPosicionadas,
  ...
}) {
  // Só recalcula quando peças realmente mudarem
  const canvasKey = useMemo(() => {
    return JSON.stringify(pecasPosicionadas);
  }, [pecasPosicionadas]);

  // ... resto do código

  return (
    <canvas
      key={canvasKey}
      ref={canvasRef}
      // ...
    />
  );
});
```

**2. Testar performance:**
- Adicionar 20 peças
- Alterar uma configuração
- Canvas deve renderizar apenas se peças mudaram

### Teste de Validação
- [ ] memo() aplicado
- [ ] useMemo() calcula key
- [ ] Re-renders reduzidos (verificar DevTools)

---

## 2.3. Bundle Splitting
- [x] **Status:** ✅ Concluído em 2025-12-04
- **Prioridade:** 🟡 MÉDIA
- **Tempo:** 45 minutos
- **Impacto:** Bundle -30-40% (~200KB)

### Descrição
Code splitting de componentes grandes que não são usados inicialmente.

### Passo a Passo

**1. Instalar analisador de bundle:**
```bash
npm install --save-dev @next/bundle-analyzer
```

**2. Atualizar `next.config.ts`:**
```typescript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  // ... config existente
};

module.exports = withBundleAnalyzer(nextConfig);
```

**3. Analisar bundle atual:**
```bash
ANALYZE=true npm run build
# Abre navegador com visualização do bundle
```

**4. Adicionar code splitting em `app/page.tsx`:**
```typescript
import dynamic from 'next/dynamic';

// Componentes grandes → carregar sob demanda
const DicionarioGCode = dynamic(() => import('@/components/DicionarioGCode'), {
  loading: () => <Button disabled>Carregando...</Button>,
  ssr: false,
});

const VisualizadorGCode = dynamic(() => import('@/components/VisualizadorGCode'), {
  loading: () => <DialogContent><Skeleton className="w-full h-96" /></DialogContent>,
  ssr: false,
});

const ValidationDialog = dynamic(() => import('@/components/ValidationDialog'), {
  ssr: false,
});
```

**5. Rodar análise novamente:**
```bash
ANALYZE=true npm run build
# Comparar tamanho antes/depois
```

### Teste de Validação
- [ ] Analyzer instalado
- [ ] Componentes grandes identificados
- [ ] dynamic() aplicado
- [ ] Bundle reduzido 30-40%

---

## 2.4. Otimizar LocalStorage
- [x] **Status:** ✅ Concluído em 2025-12-04
- **Prioridade:** 🟢 BAIXA
- **Tempo:** 25 minutos

### Descrição
useLocalStorage faz parse/stringify em cada render (lento).

### Passo a Passo

**1. Editar `hooks/useLocalStorage.ts`:**

```typescript
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Lazy initialization (só lê localStorage uma vez)
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Debounce de escritas (evita salvar a cada keystroke)
  const debouncedSave = useMemo(
    () => debounce((value: T) => {
        try {
          window.localStorage.setItem(key, JSON.stringify(value));
        } catch {
          // Ignore quota errors
        }
      }, 500),
    [key]
  );

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    debouncedSave(valueToStore);
  }, [key, storedValue, debouncedSave]);

  return [storedValue, setValue] as const;
}

// Helper debounce
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
```

### Teste de Validação
- [ ] Lazy init implementado
- [ ] Debounce de writes implementado
- [ ] App funciona normalmente
- [ ] I/O do localStorage reduzido

---

# 3. UX/UI

## 3.1. Error Boundary
- [x] **Status:** ✅ Concluído em 2025-12-03
- **Prioridade:** 🔴 CRÍTICA
- **Tempo:** 20 minutos
- **Impacto:** App não trava completamente em erros

### Passo a Passo

**1. Criar `components/ErrorBoundary.tsx`:**
```typescript
'use client';

import { Component, type ReactNode } from 'react';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center p-8">
          <h2 className="text-2xl font-bold mb-4">Algo deu errado</h2>
          <p className="text-muted-foreground mb-4">
            {this.state.error?.message || 'Erro desconhecido'}
          </p>
          <Button onClick={() => window.location.reload()}>
            Recarregar Página
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**2. Usar em `app/layout.tsx`:**
```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <ErrorBoundary>
          <ThemeProvider>
            <ValidationProvider>
              {children}
            </ValidationProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

**3. Testar:**
- Forçar um erro (ex: acessar propriedade de null)
- Deve mostrar UI de fallback em vez de tela branca

### Teste de Validação
- [ ] ErrorBoundary criado
- [ ] Aplicado em layout
- [ ] Erros não travam app
- [ ] UI de fallback aparece

---

## 3.2. Loading States
- [x] **Status:** ✅ Já implementado (verificado em 2025-12-03)
- **Prioridade:** 🟡 MÉDIA
- **Tempo:** 30 minutos

### Passo a Passo

**1. Adicionar skeleton em `components/PreviewCanvas.tsx`:**
```typescript
{carregando ? (
  <div className="w-full h-full bg-muted animate-pulse rounded-md" />
) : (
  <canvas ref={canvasRef} className="w-full h-full" />
)}
```

**2. Adicionar progress no header quando gera G-code:**

Em `app/page.tsx`:
```typescript
const [isGenerating, setIsGenerating] = useState(false);

const handleVisualizarGCode = async () => {
  setIsGenerating(true);
  try {
    // ... código existente
  } finally {
    setIsGenerating(false);
  }
};

// No render:
<Button onClick={handleVisualizarGCode} disabled={isGenerating}>
  {isGenerating ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Gerando...
    </>
  ) : (
    'Baixar/Copiar G-code'
  )}
</Button>
```

### Teste de Validação
- [ ] Skeleton em preview
- [ ] Spinner no botão
- [ ] Feedback claro ao usuário

---

## 3.3. Toast Notifications
- [x] **Status:** ✅ Concluído em 2025-12-03
- **Prioridade:** 🟡 MÉDIA
- **Tempo:** 25 minutos

### Passo a Passo

**1. Instalar shadcn toast:**
```bash
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add sonner
```

**2. Adicionar Toaster em `app/layout.tsx`:**
```typescript
import { Toaster } from '@/components/ui/sonner';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

**3. Usar em `app/page.tsx`:**
```typescript
import { toast } from 'sonner';

// Sucesso:
toast.success('G-code gerado com sucesso!', {
  description: `${pecas.length} peças processadas`,
});

// Erro:
toast.error('Erro ao gerar G-code', {
  description: error.message,
});

// Warning:
toast.warning('Configurações com avisos', {
  description: 'Clique para revisar',
  action: {
    label: 'Revisar',
    onClick: () => setValidationDialogOpen(true),
  },
});
```

### Teste de Validação
- [ ] Toast instalado
- [ ] Toaster no layout
- [ ] Notificações funcionam
- [ ] UX melhorada

---

## 3.4. Keyboard Shortcuts
- [x] **Status:** ✅ Concluído em 2025-12-04
- **Prioridade:** 🟡 MÉDIA
- **Tempo:** 35 minutos

### Passo a Passo

**1. Criar `hooks/useKeyboardShortcuts.ts`:**
```typescript
import { useEffect } from 'react';

interface Shortcuts {
  onGenerate?: () => void;
  onClear?: () => void;
  onClose?: () => void;
}

export function useKeyboardShortcuts(shortcuts: Shortcuts) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter = Gerar G-code
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        shortcuts.onGenerate?.();
      }

      // Ctrl/Cmd + K = Limpar peças
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        shortcuts.onClear?.();
      }

      // Escape = Fechar modals
      if (e.key === 'Escape') {
        shortcuts.onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}
```

**2. Usar em `app/page.tsx`:**
```typescript
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

// No componente:
useKeyboardShortcuts({
  onGenerate: handleVisualizarGCode,
  onClear: handleLimpar,
  onClose: () => {
    setVisualizadorAberto(false);
    setValidationDialogOpen(false);
  },
});
```

**3. Adicionar dica visual:**
```typescript
<Button onClick={handleVisualizarGCode}>
  Gerar G-code
  <kbd className="ml-2 text-xs opacity-60">Ctrl+Enter</kbd>
</Button>
```

### Teste de Validação
- [ ] Hook criado
- [ ] Atalhos funcionam
- [ ] Dicas visuais adicionadas

---

## 3.5. Dark Mode (Ativar)
- [x] **Status:** ✅ Concluído em 2025-12-04
- **Prioridade:** 🟢 BAIXA
- **Tempo:** 10 minutos (já existe!)

### Descrição
ThemeProvider e ThemeToggle já existem, só precisa ativar!

### Passo a Passo

**1. Adicionar toggle no layout:**

Criar `components/Header.tsx` (se não existe):
```typescript
'use client';

import { ThemeToggle } from './ThemeToggle';

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold">CNC Builder</h1>
        <ThemeToggle />
      </div>
    </header>
  );
}
```

**2. Adicionar em `app/layout.tsx`:**
```typescript
import { Header } from '@/components/Header';

<body>
  <ThemeProvider>
    <Header />
    {children}
  </ThemeProvider>
</body>
```

**3. Testar:**
- Clicar no botão de tema
- Página deve alternar entre light/dark
- Preferência salva no localStorage

### Teste de Validação
- [ ] Header criado
- [ ] Toggle visível
- [ ] Temas funcionam
- [ ] Persiste preferência

---

## 3.6. Upload CSV para Peças
- [x] **Status:** ✅ Concluído em 2025-12-04
- **Prioridade:** 🟢 BAIXA
- **Tempo:** 45 minutos

### Descrição
Adicionar peças via CSV (útil para 50+ peças).

### Passo a Passo

**1. Adicionar input file em `components/CadastroPeca.tsx`:**
```typescript
function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const csv = event.target?.result as string;
      const lines = csv.split('\n');

      // Pula header (primeira linha)
      const pecasNovas: Peca[] = lines.slice(1)
        .filter(line => line.trim())
        .map((line, i) => {
          const [largura, altura, tipoCorte, nome] = line.split(',');
          return {
            id: generateId(),
            largura: parseFloat(largura),
            altura: parseFloat(altura),
            tipoCorte: tipoCorte.trim() as TipoCorte,
            nome: nome?.trim() || `Peça ${i + 1}`,
          };
        });

      // Validar peças
      const validas = pecasNovas.filter(p =>
        !isNaN(p.largura) &&
        !isNaN(p.altura) &&
        ['externo', 'interno', 'na-linha'].includes(p.tipoCorte)
      );

      if (validas.length > 0) {
        onAdicionarMultiplas(validas);
        toast.success(`${validas.length} peças importadas`);
      } else {
        toast.error('Nenhuma peça válida no CSV');
      }
    } catch (error) {
      toast.error('Erro ao ler CSV');
    }
  };

  reader.readAsText(file);
}

// UI:
<div className="flex gap-2">
  <Input
    type="file"
    accept=".csv"
    onChange={handleFileUpload}
    className="max-w-xs"
  />
  <Button variant="outline" onClick={downloadTemplate}>
    Baixar Template
  </Button>
</div>

function downloadTemplate() {
  const csv = `largura,altura,tipoCorte,nome
100,200,externo,Peça A
150,150,interno,Peça B
200,100,externo,Peça C`;

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'template-pecas.csv';
  a.click();
  URL.revokeObjectURL(url);
}
```

**2. Atualizar interface de `onAdicionarMultiplas`:**
```typescript
interface CadastroPecaProps {
  onAdicionar: (peca: Peca) => void;
  onAdicionarMultiplas: (pecas: Peca[]) => void; // ADICIONAR
}
```

**3. Implementar em `app/page.tsx`:**
```typescript
const handleAdicionarMultiplas = (pecas: Peca[]) => {
  setPecas(prev => [...prev, ...pecas]);
};

<CadastroPeca
  onAdicionar={handleAdicionarPeca}
  onAdicionarMultiplas={handleAdicionarMultiplas}
/>
```

### Teste de Validação
- [ ] Input file adicionado
- [ ] Upload funciona
- [ ] Template CSV disponível
- [ ] Validação de dados
- [ ] Toast de feedback

---

# 4. Segurança

## 4.1. XSS Sanitization
- [x] **Status:** ✅ Concluído em 2025-12-04
- **Prioridade:** 🟡 MÉDIA
- **Tempo:** 20 minutos

### Passo a Passo

**1. Instalar DOMPurify:**
```bash
npm install dompurify
npm install --save-dev @types/dompurify
```

**2. Criar helper em `lib/sanitize.ts`:**
```typescript
import DOMPurify from 'dompurify';

export function sanitizeString(str: string): string {
  // Remove HTML tags e scripts
  return DOMPurify.sanitize(str, { ALLOWED_TAGS: [] });
}
```

**3. Usar em `components/CadastroPeca.tsx`:**
```typescript
import { sanitizeString } from '@/lib/sanitize';

const novaPeca: Peca = {
  // ... outros campos
  nome: nomePeca ? sanitizeString(nomePeca) : undefined,
};
```

### Teste de Validação
- [ ] DOMPurify instalado
- [ ] Helper criado
- [ ] Nomes sanitizados
- [ ] XSS prevenido

---

## 4.2. Validação de API_URL
- [x] **Status:** ✅ Concluído em 2025-12-04
- **Prioridade:** 🟡 MÉDIA
- **Tempo:** 15 minutos

### Passo a Passo

**1. Editar `lib/api-client.ts`:**
```typescript
const API_BASE_URL = (() => {
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  try {
    new URL(url);
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      throw new Error('URL deve começar com http:// ou https://');
    }
    return url;
  } catch (error) {
    console.error('NEXT_PUBLIC_API_URL inválida:', error);
    console.warn('Usando fallback: http://localhost:3001');
    return 'http://localhost:3001';
  }
})();

console.log('API URL configurada:', API_BASE_URL);
```

### Teste de Validação
- [ ] Validação implementada
- [ ] Fallback funciona
- [ ] Log aparece no console

---

## 4.3. Content Security Policy
- [x] **Status:** ✅ Concluído em 2025-12-04
- **Prioridade:** 🟢 BAIXA
- **Tempo:** 20 minutos

### Passo a Passo

**1. Adicionar em `next.config.ts`:**
```typescript
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: blob:;
      connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'};
      font-src 'self' data:;
    `.replace(/\s{2,}/g, ' ').trim()
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
];

const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
```

### Teste de Validação
- [ ] Headers configurados
- [ ] App funciona normalmente
- [ ] Verificar headers no DevTools

---

## 4.4. Rate Limiting Client-Side
- [x] **Status:** ✅ Concluído em 2025-12-04
- **Prioridade:** 🟢 BAIXA
- **Tempo:** 25 minutos

### Descrição
Limitar requests ao backend (complementa rate limiting do backend).

### Passo a Passo

**1. Criar `hooks/useThrottle.ts`:**
```typescript
import { useRef, useCallback } from 'react';

export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const lastRun = useRef(Date.now());

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = now;
    }
  }, [callback, delay]);
}
```

**2. Usar em `lib/api-client.ts`:**
```typescript
// Adicionar cooldown interno
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 100; // ms

private async request(endpoint, options) {
  // Throttle interno
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(r => setTimeout(r, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();

  // ... resto do código
}
```

### Teste de Validação
- [ ] Throttle implementado
- [ ] Requests espaçados
- [ ] Sem sobrecarga do backend

---

# 5. Código e Arquitetura

## 5.1. Estado Global com Zustand
- [x] **Status:** ✅ Concluído em 2025-12-04
- **Prioridade:** 🟡 MÉDIA
- **Tempo:** 1.5 horas
- **Impacto:** Elimina props drilling

### Passo a Passo

**1. Instalar Zustand:**
```bash
npm install zustand
```

**2. Criar `stores/useConfigStore.ts`:**
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Peca, ConfiguracoesChapa, ConfiguracoesCorte, ConfiguracoesFerramenta } from '@/types';

interface ConfigStore {
  // Estado
  configChapa: ConfiguracoesChapa;
  configCorte: ConfiguracoesCorte;
  configFerramenta: ConfiguracoesFerramenta;
  pecas: Peca[];

  // Actions
  setConfigChapa: (config: Partial<ConfiguracoesChapa>) => void;
  setConfigCorte: (config: Partial<ConfiguracoesCorte>) => void;
  setConfigFerramenta: (config: Partial<ConfiguracoesFerramenta>) => void;
  addPeca: (peca: Peca) => void;
  removePeca: (id: string) => void;
  updatePeca: (id: string, updates: Partial<Peca>) => void;
  setPecas: (pecas: Peca[]) => void;
  reset: () => void;
}

const defaultChapa: ConfiguracoesChapa = {
  largura: 2850,
  altura: 1500,
  espessura: 15,
};

const defaultCorte: ConfiguracoesCorte = {
  profundidade: 15,
  espacamento: 50,
  profundidadePorPassada: 5,
  feedrate: 1000,
  plungeRate: 300,
  rapidsSpeed: 4000,
  spindleSpeed: 18000,
  usarRampa: false,
  anguloRampa: 3,
  aplicarRampaEm: 'primeira-passada',
  usarMesmoEspacamentoBorda: true,
  margemBorda: 50,
};

const defaultFerramenta: ConfiguracoesFerramenta = {
  diametro: 6,
  numeroFerramenta: 1,
};

export const useConfigStore = create<ConfigStore>()(
  persist(
    (set) => ({
      // Estado inicial
      configChapa: defaultChapa,
      configCorte: defaultCorte,
      configFerramenta: defaultFerramenta,
      pecas: [],

      // Actions
      setConfigChapa: (config) =>
        set((state) => ({
          configChapa: { ...state.configChapa, ...config },
        })),

      setConfigCorte: (config) =>
        set((state) => ({
          configCorte: { ...state.configCorte, ...config },
        })),

      setConfigFerramenta: (config) =>
        set((state) => ({
          configFerramenta: { ...state.configFerramenta, ...config },
        })),

      addPeca: (peca) =>
        set((state) => ({ pecas: [...state.pecas, peca] })),

      removePeca: (id) =>
        set((state) => ({ pecas: state.pecas.filter((p) => p.id !== id) })),

      updatePeca: (id, updates) =>
        set((state) => ({
          pecas: state.pecas.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),

      setPecas: (pecas) => set({ pecas }),

      reset: () =>
        set({
          configChapa: defaultChapa,
          configCorte: defaultCorte,
          configFerramenta: defaultFerramenta,
          pecas: [],
        }),
    }),
    {
      name: 'cnc-config-storage',
      partialize: (state) => ({
        configChapa: state.configChapa,
        configCorte: state.configCorte,
        configFerramenta: state.configFerramenta,
        pecas: state.pecas,
      }),
    }
  )
);
```

**3. Substituir useState em `app/page.tsx`:**
```typescript
// ANTES:
const [configChapa, setConfigChapa] = useState(defaultChapa);
const [pecas, setPecas] = useState<Peca[]>([]);

// DEPOIS:
import { useConfigStore } from '@/stores/useConfigStore';

const {
  configChapa,
  configCorte,
  configFerramenta,
  pecas,
  setConfigChapa,
  setConfigCorte,
  setConfigFerramenta,
  addPeca,
  removePeca,
  setPecas,
} = useConfigStore();
```

**4. Remover props drilling:**

Componentes agora acessam store diretamente:
```typescript
// ConfiguracoesChapa.tsx
const { configChapa, setConfigChapa } = useConfigStore();
// Não precisa mais receber props!

// CadastroPeca.tsx
const { addPeca } = useConfigStore();
```

### Teste de Validação
- [ ] Zustand instalado
- [ ] Store criado
- [ ] useState substituídos
- [ ] Props drilling eliminado
- [ ] Persist funciona

---

## 5.2. React Query para API
- [x] **Status:** ✅ Concluído em 2025-12-04
- **Prioridade:** 🟡 MÉDIA
- **Tempo:** 1 hora

### Passo a Passo

**1. Instalar TanStack Query:**
```bash
npm install @tanstack/react-query
```

**2. Setup em `app/layout.tsx`:**
```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export default function RootLayout({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5000,
        gcTime: 10 * 60 * 1000, // 10 minutos
        retry: 1,
      },
    },
  }));

  return (
    <html>
      <body>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            {children}
          </ThemeProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

**3. Criar queries em `app/page.tsx`:**
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

// Preview automático
const { data: preview, isLoading: isLoadingPreview } = useQuery({
  queryKey: ['preview', pecas, configChapa, configCorte, configFerramenta, metodoNesting],
  queryFn: () => ApiClient.validate({
    pecas,
    configChapa,
    configCorte,
    configFerramenta,
    metodoNesting,
  }),
  enabled: pecas.length > 0,
  staleTime: 5000,
});

// Mutation para gerar G-code
const generateMutation = useMutation({
  mutationFn: (data) => ApiClient.gerarGCode(data),
  onSuccess: (data) => {
    setGcodeGerado(data.gcode);
    toast.success('G-code gerado!', {
      description: `${pecas.length} peças processadas`,
    });
  },
  onError: (error: any) => {
    toast.error('Erro ao gerar G-code', {
      description: error.message,
    });
  },
});

const handleGerarGCode = () => {
  generateMutation.mutate({
    pecas,
    configChapa,
    configCorte,
    configFerramenta,
    incluirComentarios: true,
  });
};
```

### Teste de Validação
- [ ] React Query instalado
- [ ] QueryClient configurado
- [ ] Queries funcionam
- [ ] Mutations funcionam
- [ ] DevTools acessíveis

---

## 5.3. TypeScript Strict Mode
- [x] **Status:** ✅ Concluído em 2025-12-04
- **Prioridade:** 🟢 BAIXA
- **Tempo:** 2-3 horas (muitos erros)

### Passo a Passo

**1. Ativar em `tsconfig.json`:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

**2. Verificar erros:**
```bash
npm run build 2>&1 | grep "error TS"
```

**3. Corrigir incrementalmente:**
- Começar pelos erros críticos
- Adicionar tipos explícitos onde faltam
- Tratar null/undefined corretamente

### Teste de Validação
- [ ] Strict mode ativado
- [ ] Todos erros corrigidos
- [ ] Build passa
- [ ] App funciona

---

## 5.4. Storybook
- [ ] **Status:** Pendente
- **Prioridade:** 🟢 BAIXA
- **Tempo:** 1 hora

### Passo a Passo

**1. Instalar Storybook:**
```bash
npx storybook@latest init
```

**2. Criar story exemplo:**

`components/ConfiguracoesChapa.stories.tsx`:
```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { ConfiguracoesChapa } from './ConfiguracoesChapa';

const meta: Meta<typeof ConfiguracoesChapa> = {
  title: 'Configurações/Chapa',
  component: ConfiguracoesChapa,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ConfiguracoesChapa>;

export const Default: Story = {};

export const ValoresCustomizados: Story = {
  args: {
    initialConfig: {
      largura: 1000,
      altura: 800,
      espessura: 10,
    },
  },
};
```

**3. Rodar Storybook:**
```bash
npm run storybook
```

### Teste de Validação
- [ ] Storybook instalado
- [ ] Stories criadas
- [ ] Componentes documentados
- [ ] Storybook roda

---

# 6. Testes

## 6.1. Testes Unitários (Vitest)
- [x] **Status:** ✅ Concluído em 2025-12-04
- **Prioridade:** 🔴 CRÍTICA
- **Tempo:** 2 horas

### Passo a Passo

**1. Instalar Vitest:**
```bash
npm install --save-dev vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

**2. Criar `vitest.config.ts`:**
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

**3. Criar `vitest.setup.ts`:**
```typescript
import '@testing-library/jest-dom';
```

**4. Criar teste exemplo:**

`hooks/__tests__/useDebounce.test.ts`:
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useDebounce } from '../useDebounce';
import { describe, it, expect } from 'vitest';

describe('useDebounce', () => {
  it('deve atrasar valor por 300ms', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated' });
    expect(result.current).toBe('initial'); // Ainda não mudou

    await waitFor(() => expect(result.current).toBe('updated'), {
      timeout: 400,
    });
  });
});
```

**5. Adicionar scripts em `package.json`:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

### Teste de Validação
- [ ] Vitest instalado
- [ ] Config criada
- [ ] Teste passa
- [ ] Coverage funciona

---

## 6.2. Testes E2E (Playwright)
- [x] **Status:** ✅ Concluído em 2025-12-04 (incluindo correção SSR ThemeProvider)
- **Prioridade:** 🟡 MÉDIA
- **Tempo:** 1.5 horas

### Passo a Passo

**1. Instalar Playwright:**
```bash
npm install --save-dev @playwright/test
npx playwright install
```

**2. Criar `playwright.config.ts`:**
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

**3. Criar teste:**

`e2e/gcode-generation.spec.ts`:
```typescript
import { test, expect } from '@playwright/test';

test('deve gerar G-code com sucesso', async ({ page }) => {
  await page.goto('/');

  // Adicionar peça
  await page.fill('[name="largura"]', '100');
  await page.fill('[name="altura"]', '200');
  await page.click('text=Adicionar Peça');

  // Verificar peça na lista
  await expect(page.locator('text=100 x 200')).toBeVisible();

  // Gerar G-code
  await page.click('text=Baixar/Copiar G-code');

  // Verificar modal
  await expect(page.locator('text=G-Code Gerado')).toBeVisible();
});
```

**4. Rodar testes:**
```bash
npx playwright test
npx playwright test --ui
```

### Teste de Validação
- [ ] Playwright instalado
- [ ] Config criada
- [ ] Teste passa
- [ ] UI mode funciona

---

## 6.3. Visual Regression
- [ ] **Status:** Pendente
- **Prioridade:** 🟢 BAIXA
- **Tempo:** 30 minutos

### Passo a Passo

**1. Adicionar em teste existente:**
```typescript
test('preview deve ser consistente visualmente', async ({ page }) => {
  await page.goto('/');

  // Adicionar peças
  // ... código de setup ...

  // Tirar screenshot
  await expect(page.locator('[data-testid="preview-canvas"]')).toHaveScreenshot();
});
```

**2. Atualizar baselines:**
```bash
npx playwright test --update-snapshots
```

### Teste de Validação
- [ ] Screenshots configurados
- [ ] Baselines criados
- [ ] Detecta mudanças visuais

---

# 7. Acessibilidade

## 7.1. ARIA Labels
- [x] **Status:** ✅ Concluído em 2025-12-04
- **Prioridade:** 🟡 MÉDIA
- **Tempo:** 45 minutos

### Passo a Passo

**1. Adicionar em inputs (ConfiguracoesChapa.tsx):**
```typescript
<Label htmlFor="largura">Largura (mm)</Label>
<Input
  id="largura"
  name="largura"
  aria-label="Largura da chapa em milímetros"
  aria-describedby="largura-help"
  aria-invalid={hasError}
/>
<p id="largura-help" className="text-xs text-muted-foreground">
  Digite a largura da chapa
</p>
{hasError && (
  <p role="alert" className="text-xs text-destructive">
    {errorMessage}
  </p>
)}
```

**2. Canvas:**
```typescript
<canvas
  role="img"
  aria-label="Visualização do posicionamento das peças na chapa"
  {...props}
/>
```

### Teste de Validação
- [ ] Labels adicionados
- [ ] ARIA attributes corretos
- [ ] Screenreader testa OK

---

## 7.2. Keyboard Navigation
- [x] **Status:** ✅ Concluído em 2025-12-04
- **Prioridade:** 🟡 MÉDIA
- **Tempo:** 30 minutos

### Passo a Passo

**1. Garantir tab index em botões interativos:**
```typescript
<button
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleAction();
    }
  }}
>
  Ação
</button>
```

**2. Adicionar focus visible:**

Em `globals.css`:
```css
.focus-visible:focus {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}
```

### Teste de Validação
- [ ] Tab navigation funciona
- [ ] Enter/Space ativam botões
- [ ] Focus visible claro

---

## 7.3. Contrast Checker
- [x] **Status:** ✅ Concluído em 2025-12-04
- **Prioridade:** 🟢 BAIXA
- **Tempo:** 20 minutos

### Passo a Passo

**1. Instalar plugin:**
```bash
npm install --save-dev eslint-plugin-jsx-a11y
```

**2. Config `.eslintrc.json`:**
```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:jsx-a11y/recommended"
  ]
}
```

**3. Rodar lint:**
```bash
npm run lint
```

### Teste de Validação
- [ ] Plugin instalado
- [ ] Lint passa
- [ ] Contraste WCAG AA

---

# 8. SEO

## 8.1. Meta Tags
- [x] **Status:** ✅ Concluído em 2025-12-04
- **Prioridade:** 🟢 BAIXA
- **Tempo:** 20 minutos

### Passo a Passo

**1. Editar `app/layout.tsx`:**
```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CNC Builder - Gerador de G-code',
  description: 'Gerador profissional de G-code para fresadoras CNC com algoritmo de nesting automático',
  keywords: ['CNC', 'G-code', 'nesting', 'fresadora', 'CAM'],
  authors: [{ name: 'Seu Nome' }],
  openGraph: {
    title: 'CNC Builder - Gerador de G-code',
    description: 'Gerador profissional de G-code com nesting automático',
    images: ['/og-image.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CNC Builder',
    description: 'Gerador profissional de G-code',
    images: ['/og-image.png'],
  },
};
```

**2. Criar imagem OG:**
- Criar `public/og-image.png` (1200x630px)

### Teste de Validação
- [ ] Metadata definido
- [ ] OG image criado
- [ ] Preview em redes sociais OK

---

## 8.2. Sitemap e Robots
- [x] **Status:** ✅ Concluído em 2025-12-04
- **Prioridade:** 🟢 BAIXA
- **Tempo:** 15 minutos

### Passo a Passo

**1. Criar `app/sitemap.ts`:**
```typescript
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://cnc-builder.vercel.app',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
```

**2. Criar `app/robots.ts`:**
```typescript
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://cnc-builder.vercel.app/sitemap.xml',
  };
}
```

### Teste de Validação
- [ ] Sitemap criado
- [ ] Robots.txt criado
- [ ] URLs acessíveis

---

# 9. PWA

## 9.1. PWA Support
- [x] **Status:** ✅ Concluído em 2025-12-04
- **Prioridade:** 🟡 MÉDIA
- **Tempo:** 35 minutos

### Passo a Passo

**1. Instalar next-pwa:**
```bash
npm install next-pwa
```

**2. Config `next.config.ts`:**
```typescript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA({
  // ... config existente
});
```

**3. Criar `public/manifest.json`:**
```json
{
  "name": "CNC Builder - Gerador de G-code",
  "short_name": "CNC Builder",
  "description": "Gerador de G-code profissional",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**4. Criar ícones:**
- `public/icon-192.png` (192x192px)
- `public/icon-512.png` (512x512px)

### Teste de Validação
- [ ] PWA instalado
- [ ] Manifest criado
- [ ] Ícones criados
- [ ] Instalável no mobile

---

## 9.2. Offline Mode
- [x] **Status:** ✅ Concluído em 2025-12-04
- **Prioridade:** 🟢 BAIXA
- **Tempo:** 25 minutos

### Passo a Passo

**1. Adicionar detector de online/offline:**

Em `app/layout.tsx`:
```typescript
'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <Alert variant="destructive" className="fixed bottom-4 right-4 w-auto">
      <AlertDescription>
        Você está offline. Algumas funcionalidades estão desabilitadas.
      </AlertDescription>
    </Alert>
  );
}

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <OfflineIndicator />
      </body>
    </html>
  );
}
```

### Teste de Validação
- [ ] Detector implementado
- [ ] Alerta aparece offline
- [ ] LocalStorage funciona offline

---

## 📝 Como Usar Este Arquivo

### Para implementar uma melhoria:

```bash
# No terminal, diga ao Claude:
"Implemente a melhoria #1.1 do MELHORIAS.md"

# Claude vai:
# 1. Ler a seção #1.1
# 2. Executar todos os passos
# 3. Rodar testes de validação
# 4. Marcar checkbox como [x]
# 5. Atualizar dashboard
# 6. Fazer commit com mensagem sugerida
```

### Para implementar múltiplas melhorias:

```bash
"Implemente as melhorias #1.1, #1.2 e #2.1 do MELHORIAS.md"
```

### Para verificar progresso:

```bash
"Mostre o dashboard de progresso do MELHORIAS.md"
```

---

## 🔗 Commit Messages Sugeridos

```bash
# Limpeza
git commit -m "refactor: remove duplicated backend code (#1.1)"

# Performance
git commit -m "perf: reduce debounce to 300ms (#2.1)"
git commit -m "perf: memoize canvas rendering (#2.2)"

# UX
git commit -m "feat(ux): add error boundary (#3.1)"
git commit -m "feat(ux): add toast notifications (#3.3)"

# Arquitetura
git commit -m "feat(state): implement Zustand global state (#5.1)"
git commit -m "feat(data): add React Query (#5.2)"

# Testes
git commit -m "test: add Vitest unit tests (#6.1)"
git commit -m "test: add Playwright E2E tests (#6.2)"
```

---

**Total:** 35 melhorias | Tempo estimado: 8-12 semanas
**ROI:** Performance +40-50% | UX +60-70% | Manutenibilidade +50%
