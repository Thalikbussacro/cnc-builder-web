# SETUP - Gerador de G-code CNC Web

Este documento define o plano completo de desenvolvimento do Gerador de G-code CNC em Next.js 15.

## Visão Geral do Projeto

**Objetivo**: Migrar a aplicação Delphi (uFrmCNC2) para uma aplicação web moderna usando Next.js 15, mantendo todas as funcionalidades de nesting e preview visual.

**Funcionalidades Principais**:
- Configuração de dimensões da chapa (largura, altura, espessura)
- Configuração de parâmetros de corte (profundidade, espaçamento)
- Cadastro de múltiplas peças retangulares
- Algoritmo de nesting automático (bin packing 2D)
- Preview visual 2D mostrando posicionamento das peças na chapa
- Validação em tempo real se a peça cabe na chapa
- Geração de arquivo G-code (.nc) com todas as peças posicionadas
- Download do arquivo gerado

**Stack Tecnológica**:
- Next.js 15 com App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zod para validação
- Canvas API para preview visual
- Client-side rendering (sem backend necessário)

---

## ESTÁGIO 1: SETUP INICIAL DO PROJETO

### Sub-estágio 1.1: Configuração do Ambiente
**Objetivo**: Criar novo projeto Next.js e configurar dependências base

**Tarefas**:
1. Criar novo app Next.js 15 com TypeScript
2. Configurar Tailwind CSS
3. Instalar shadcn/ui CLI
4. Configurar estrutura de pastas inicial
5. Criar arquivo de variáveis de ambiente (se necessário)
6. Configurar prettier/eslint (opcional)

**Comandos**:
```bash
npx create-next-app@latest cnc-gcode-generator --typescript --tailwind --app --no-src-dir
cd cnc-gcode-generator
npx shadcn-ui@latest init
```

**Estrutura de Pastas Inicial**:
```
app/
  page.tsx                 # Página principal
  layout.tsx              # Layout raiz
  globals.css             # Estilos globais
components/
  ui/                     # Componentes shadcn/ui
lib/
  utils.ts                # Utilitários
types/
  index.ts                # Tipos TypeScript
public/
```

**Commit**: `feat: setup inicial do projeto Next.js 15 com Tailwind e shadcn/ui`

---

### Sub-estágio 1.2: Definição de Tipos TypeScript
**Objetivo**: Criar todos os tipos necessários baseados no código Delphi

**Tarefas**:
1. Criar tipo `Peca` (largura, altura)
2. Criar tipo `PecaPosicionada` (x, y, largura, altura)
3. Criar tipo `ConfiguracoesChapa` (largura, altura, espessura)
4. Criar tipo `ConfiguracoesCorte` (profundidade, espacamento)
5. Criar tipo `Candidato` (x, y) para algoritmo de nesting

**Arquivo**: `types/index.ts`

**Conteúdo**:
```typescript
export type Peca = {
  largura: number;
  altura: number;
  id: string; // UUID para React keys
};

export type PecaPosicionada = {
  x: number;
  y: number;
  largura: number;
  altura: number;
  id: string;
};

export type ConfiguracoesChapa = {
  largura: number;
  altura: number;
  espessura: number;
};

export type ConfiguracoesCorte = {
  profundidade: number;
  espacamento: number;
};

export type Candidato = {
  x: number;
  y: number;
};
```

**Commit**: `feat: adicionar tipos TypeScript para peças e configurações`

---

## ESTÁGIO 2: ALGORITMO DE NESTING

### Sub-estágio 2.1: Função de Validação de Espaço
**Objetivo**: Implementar a função `cabeNoEspaco` que verifica se uma peça cabe em determinada posição

**Tarefas**:
1. Criar arquivo `lib/nesting-algorithm.ts`
2. Implementar função `cabeNoEspaco` (linhas 63-85 do Delphi)
3. Validar limites da chapa
4. Validar colisões com peças já posicionadas
5. Considerar espaçamento mínimo entre peças
6. Adicionar testes unitários (opcional)

**Arquivo**: `lib/nesting-algorithm.ts`

**Lógica**:
- Verificar se peça excede limites da chapa
- Para cada peça já posicionada, verificar se há sobreposição considerando espaçamento
- Retornar true se cabe, false caso contrário

**Commit**: `feat: implementar função de validação de espaço para nesting`

---

### Sub-estágio 2.2: Algoritmo de Posicionamento
**Objetivo**: Implementar algoritmo de nesting que posiciona todas as peças

**Tarefas**:
1. Implementar função `posicionarPecas` no mesmo arquivo
2. Ordenar peças por área (maiores primeiro)
3. Implementar lógica de candidatos (pontos possíveis)
4. Para cada peça, tentar posicionar no primeiro candidato disponível
5. Adicionar novos candidatos (direita e abaixo da peça posicionada)
6. Retornar array de `PecaPosicionada` ou indicar quais não couberam

**Função Principal**:
```typescript
export function posicionarPecas(
  pecas: Peca[],
  chapaLargura: number,
  chapaAltura: number,
  espacamento: number
): {
  posicionadas: PecaPosicionada[];
  naoCouberam: Peca[];
}
```

**Lógica** (baseada em linhas 282-327 do Delphi):
- Ordenar peças por área decrescente
- Iniciar com candidato (0, 0)
- Para cada peça, tentar cada candidato
- Se couber, adicionar à lista de posicionadas e gerar novos candidatos
- Se não couber em nenhum candidato, adicionar à lista de não couberam

**Commit**: `feat: implementar algoritmo de nesting com ordenação por área`

---

## ESTÁGIO 3: GERAÇÃO DE G-CODE

### Sub-estágio 3.1: Função de Geração de G-code
**Objetivo**: Implementar a função que gera o código G-code a partir das peças posicionadas

**Tarefas**:
1. Criar arquivo `lib/gcode-generator.ts`
2. Implementar função `gerarGCode`
3. Adicionar cabeçalho com legenda
4. Para cada peça posicionada, gerar comandos de corte
5. Implementar múltiplas passadas baseado na profundidade
6. Adicionar comandos de finalização
7. Garantir separador decimal como ponto (.)

**Arquivo**: `lib/gcode-generator.ts`

**Função Principal**:
```typescript
export function gerarGCode(
  pecasPos: PecaPosicionada[],
  config: ConfiguracoesChapa,
  corte: ConfiguracoesCorte
): string
```

**Lógica** (baseada em linhas 329-448 do Delphi):
- Cabeçalho com legenda dos comandos
- Informações da chapa e profundidade
- Comandos iniciais (G21, G90, G0 Z5, M3 S18000)
- Para cada peça:
  - Calcular número de passadas (profundidade / 5mm)
  - Para cada passada:
    - Posicionar em (X, Y)
    - Descer Z
    - Cortar retângulo (4 lados)
    - Subir Z
- Comandos finais (G0 Z5, M5, G0 X0 Y0, M30)

**Formato de números**: Usar `.toFixed(2)` e `replace(',', '.')` se necessário

**Commit**: `feat: implementar geração de G-code com múltiplas passadas`

---

### Sub-estágio 3.2: Função de Download
**Objetivo**: Criar função utilitária para download do arquivo .nc

**Tarefas**:
1. Criar função `downloadGCode` em `lib/utils.ts`
2. Criar Blob com conteúdo UTF-8
3. Criar URL temporária
4. Criar elemento `<a>` com download
5. Trigger de click programático
6. Limpar URL temporária

**Função**:
```typescript
export function downloadGCode(conteudo: string, nomeArquivo: string = 'corte.nc'): void
```

**Commit**: `feat: adicionar função de download de arquivo G-code`

---

## ESTÁGIO 4: COMPONENTES DE UI - CONFIGURAÇÕES

### Sub-estágio 4.1: Componente de Configurações da Chapa
**Objetivo**: Criar componente para inputs de largura, altura e espessura da chapa

**Tarefas**:
1. Instalar shadcn/ui components necessários: `input`, `label`, `card`
2. Criar componente `components/ConfiguracoesChapa.tsx`
3. Criar 3 inputs numéricos (largura, altura, espessura)
4. Adicionar labels descritivos
5. Adicionar valores padrão (2850, 1500, 15)
6. Implementar callbacks onChange
7. Adicionar validação visual (opcional: border vermelho se inválido)

**Props**:
```typescript
type ConfiguracoesChapaProps = {
  config: ConfiguracoesChapa;
  onChange: (config: ConfiguracoesChapa) => void;
};
```

**Comandos shadcn/ui**:
```bash
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add card
```

**Layout**: Card com título "Configurações Gerais" e 3 inputs em grid

**Commit**: `feat: criar componente de configurações da chapa`

---

### Sub-estágio 4.2: Componente de Configurações de Corte
**Objetivo**: Criar componente para inputs de profundidade e espaçamento

**Tarefas**:
1. Criar componente `components/ConfiguracoesCorte.tsx`
2. Criar 2 inputs numéricos (profundidade, espaçamento)
3. Adicionar labels descritivos
4. Adicionar valores padrão (15, 50)
5. Implementar callbacks onChange

**Props**:
```typescript
type ConfiguracoesCorteProps = {
  config: ConfiguracoesCorte;
  onChange: (config: ConfiguracoesCorte) => void;
};
```

**Layout**: Card com título "Configurações do Corte" e 2 inputs em grid

**Commit**: `feat: criar componente de configurações de corte`

---

## ESTÁGIO 5: COMPONENTES DE UI - CADASTRO E LISTA

### Sub-estágio 5.1: Componente de Cadastro de Peças
**Objetivo**: Criar componente para adicionar novas peças à lista

**Tarefas**:
1. Instalar shadcn/ui component: `button`
2. Criar componente `components/CadastroPeca.tsx`
3. Criar 2 inputs numéricos (largura, altura)
4. Adicionar botão "Adicionar"
5. Implementar validação (valores > 0)
6. Implementar callback onAdicionar
7. Simular nesting antes de adicionar (validar se cabe)
8. Mostrar erro se não couber
9. Limpar inputs após adicionar

**Props**:
```typescript
type CadastroPecaProps = {
  onAdicionar: (peca: Peca) => void;
  configChapa: ConfiguracoesChapa;
  espacamento: number;
  pecasExistentes: Peca[];
};
```

**Lógica de Validação** (baseada em linhas 102-199 do Delphi):
- Criar lista temporária com peças existentes + nova peça
- Executar algoritmo de nesting
- Se a nova peça couber, permitir adicionar
- Caso contrário, mostrar mensagem de erro

**Comandos shadcn/ui**:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add toast
```

**Commit**: `feat: criar componente de cadastro de peças com validação`

---

### Sub-estágio 5.2: Componente de Lista de Peças
**Objetivo**: Criar componente que exibe todas as peças cadastradas

**Tarefas**:
1. Instalar shadcn/ui component: `scroll-area` (opcional)
2. Criar componente `components/ListaPecas.tsx`
3. Renderizar lista de peças com dimensões
4. Adicionar botão de remover para cada peça (opcional)
5. Mostrar contador de peças
6. Adicionar área de scroll se necessário

**Props**:
```typescript
type ListaPecasProps = {
  pecas: Peca[];
  onRemover?: (id: string) => void; // Opcional para v1
};
```

**Layout**: Card com título "Lista de Peças" e lista scrollável

**Formato de item**: "500 x 300 mm" (com botão X opcional)

**Commit**: `feat: criar componente de lista de peças`

---

## ESTÁGIO 6: PREVIEW VISUAL

### Sub-estágio 6.1: Componente Canvas Base
**Objetivo**: Criar componente Canvas que renderiza a chapa vazia

**Tarefas**:
1. Criar componente `components/PreviewCanvas.tsx`
2. Criar elemento `<canvas>` com ref
3. Implementar lógica de dimensionamento (fit na área disponível)
4. Calcular escala baseado em dimensões da chapa
5. Desenhar retângulo da chapa (borda preta, fundo branco)
6. Adicionar useEffect para redesenhar quando props mudarem

**Props**:
```typescript
type PreviewCanvasProps = {
  chapaLargura: number;
  chapaAltura: number;
  pecasPosicionadas: PecaPosicionada[];
};
```

**Lógica de Escala** (baseada em linhas 268-272 do Delphi):
```typescript
const escala = Math.min(
  canvasWidth / chapaLargura,
  canvasHeight / chapaAltura
);
```

**Commit**: `feat: criar componente Canvas base com chapa`

---

### Sub-estágio 6.2: Renderização de Peças no Canvas
**Objetivo**: Desenhar todas as peças posicionadas na chapa

**Tarefas**:
1. Adicionar lógica de renderização de peças
2. Para cada peça posicionada, desenhar retângulo
3. Aplicar escala corretamente
4. Usar cores diferentes para cada peça (opcional)
5. Adicionar borda para as peças
6. Garantir que redesenha quando lista de peças muda

**Lógica de Desenho** (baseada em linhas 310-314 do Delphi):
```typescript
pecasPosicionadas.forEach(peca => {
  ctx.strokeRect(
    peca.x * escala,
    peca.y * escala,
    peca.largura * escala,
    peca.altura * escala
  );
});
```

**Melhorias Visuais** (opcional):
- Cores alternadas para peças
- Números identificando cada peça
- Grid de fundo

**Commit**: `feat: implementar renderização de peças no canvas`

---

## ESTÁGIO 7: INTEGRAÇÃO E PÁGINA PRINCIPAL

### Sub-estágio 7.1: Gerenciamento de Estado
**Objetivo**: Criar estado centralizado na página principal

**Tarefas**:
1. Editar `app/page.tsx`
2. Criar estados para:
   - `configChapa: ConfiguracoesChapa`
   - `configCorte: ConfiguracoesCorte`
   - `pecas: Peca[]`
   - `pecasPosicionadas: PecaPosicionada[]`
3. Implementar função `adicionarPeca`
4. Implementar função `atualizarPosicionamento` (roda nesting)
5. Implementar função `gerarArquivo`
6. Adicionar useEffect para recalcular posicionamento quando necessário

**Estados Iniciais**:
```typescript
const [configChapa, setConfigChapa] = useState<ConfiguracoesChapa>({
  largura: 2850,
  altura: 1500,
  espessura: 15
});

const [configCorte, setConfigCorte] = useState<ConfiguracoesCorte>({
  profundidade: 15,
  espacamento: 50
});

const [pecas, setPecas] = useState<Peca[]>([]);
const [pecasPosicionadas, setPecasPosicionadas] = useState<PecaPosicionada[]>([]);
```

**Commit**: `feat: adicionar gerenciamento de estado na página principal`

---

### Sub-estágio 7.2: Layout e Composição dos Componentes
**Objetivo**: Montar layout final da página com todos os componentes

**Tarefas**:
1. Criar layout responsivo com grid/flex
2. Posicionar componentes:
   - Lado esquerdo: Configurações + Cadastro + Lista
   - Lado direito: Preview Canvas (maior área)
3. Adicionar título da página
4. Adicionar botão "Gerar G-code" no final
5. Conectar todos os callbacks
6. Testar fluxo completo

**Layout Sugerido**:
```
+----------------------------------+
| Gerador de G-code CNC           |
+----------------------------------+
| [Config Chapa]  | [Preview      |
| [Config Corte]  |  Canvas       |
| [Cadastro]      |  Grande]      |
| [Lista Peças]   |               |
| [Gerar G-code]  |               |
+----------------------------------+
```

**Responsividade**: Em mobile, empilhar verticalmente

**Commit**: `feat: montar layout principal com todos os componentes`

---

### Sub-estágio 7.3: Funcionalidade de Gerar G-code
**Objetivo**: Conectar botão de gerar com as funções de geração e download

**Tarefas**:
1. Adicionar handler `handleGerarGCode`
2. Validar se há peças cadastradas
3. Chamar `gerarGCode` com peças posicionadas e configurações
4. Chamar `downloadGCode` com resultado
5. Adicionar feedback visual (toast de sucesso)
6. Tratar erros (se houver)

**Validações**:
- Verificar se `pecas.length > 0`
- Mostrar erro se não houver peças

**Commit**: `feat: implementar funcionalidade completa de geração de G-code`

---

## ESTÁGIO 8: AJUSTES FINAIS E TESTES

### Sub-estágio 8.1: Validações e Tratamento de Erros
**Objetivo**: Adicionar validações robustas em todos os inputs

**Tarefas**:
1. Validar valores mínimos/máximos para dimensões
2. Validar tipos numéricos (impedir letras)
3. Adicionar mensagens de erro claras
4. Implementar Zod schemas (opcional)
5. Adicionar feedback visual para erros
6. Testar casos extremos (valores muito grandes, zero, negativos)

**Validações Importantes**:
- Largura/altura > 0
- Profundidade > 0
- Espaçamento >= 0
- Peça não pode ser maior que a chapa

**Commit**: `feat: adicionar validações completas e tratamento de erros`

---

### Sub-estágio 8.2: Melhorias de UX
**Objetivo**: Polir a experiência do usuário

**Tarefas**:
1. Adicionar loading states se necessário
2. Adicionar placeholders nos inputs
3. Adicionar tooltips explicativos (opcional)
4. Melhorar feedback visual (animações sutis)
5. Adicionar unidades de medida (mm) nos labels
6. Garantir tab order correto
7. Testar acessibilidade básica

**Melhorias de Usabilidade**:
- Input de peça limpa após adicionar
- Focus automático no próximo campo
- Enter no input adiciona peça
- Confirmação antes de remover peça (se implementado)

**Commit**: `feat: melhorias de UX e acessibilidade`

---

### Sub-estágio 8.3: Testes Manuais Completos
**Objetivo**: Testar todas as funcionalidades end-to-end

**Tarefas**:
1. Testar fluxo básico: configurar → adicionar peças → visualizar → gerar
2. Testar com 1 peça, 5 peças, 20 peças
3. Testar peças que não cabem
4. Testar alteração de configurações com peças já adicionadas
5. Testar arquivo G-code gerado (abrir no notepad, verificar formato)
6. Testar responsividade em diferentes tamanhos de tela
7. Testar em diferentes navegadores (Chrome, Firefox, Safari)
8. Documentar bugs encontrados e corrigir

**Cenários de Teste**:
- ✅ Adicionar peça que cabe
- ✅ Tentar adicionar peça que não cabe
- ✅ Alterar dimensões da chapa após adicionar peças
- ✅ Gerar G-code com múltiplas peças
- ✅ Verificar posicionamento correto no preview
- ✅ Verificar formato do arquivo .nc gerado

**Commit**: `test: realizar testes manuais completos e correções`

---

## ESTÁGIO 9: DOCUMENTAÇÃO E DEPLOY

### Sub-estágio 9.1: Documentação
**Objetivo**: Criar documentação básica do projeto

**Tarefas**:
1. Atualizar README.md com:
   - Descrição do projeto
   - Screenshots (opcional)
   - Como instalar
   - Como usar
   - Tecnologias utilizadas
2. Adicionar comentários JSDoc em funções complexas
3. Criar arquivo `.env.example` se houver variáveis de ambiente

**README.md deve incluir**:
```markdown
# Gerador de G-code CNC

Aplicação web para gerar código G-code para fresadoras CNC com algoritmo de nesting automático.

## Funcionalidades
- Configuração de chapa e parâmetros de corte
- Cadastro de múltiplas peças retangulares
- Algoritmo de nesting (bin packing 2D)
- Preview visual 2D do posicionamento
- Geração de arquivo G-code (.nc)

## Como usar
1. Clone o repositório
2. `npm install`
3. `npm run dev`
4. Acesse http://localhost:3000

## Tecnologias
- Next.js 15
- TypeScript
- Tailwind CSS
- shadcn/ui
```

**Commit**: `docs: adicionar documentação do projeto`

---

### Sub-estágio 9.2: Build e Deploy
**Objetivo**: Preparar aplicação para produção

**Tarefas**:
1. Executar `npm run build` e corrigir erros
2. Testar build de produção localmente (`npm run start`)
3. Otimizar bundle size se necessário
4. Configurar deploy na Vercel:
   - Conectar repositório GitHub
   - Configurar variáveis de ambiente (se houver)
   - Deploy automático
5. Testar aplicação em produção
6. Configurar domínio customizado (opcional)

**Comandos**:
```bash
npm run build
npm run start # Testar localmente
vercel --prod # Ou usar interface da Vercel
```

**Commit**: `chore: preparar aplicação para deploy em produção`

---

## ESTÁGIO 10: FUNCIONALIDADES FUTURAS (OPCIONAL)

### Possíveis Melhorias
- [ ] Salvar/carregar configurações no localStorage
- [ ] Exportar/importar lista de peças (JSON)
- [ ] Rotação de peças para melhor aproveitamento
- [ ] Diferentes estratégias de nesting
- [ ] Preview 3D (Three.js)
- [ ] Otimização de caminho da fresa
- [ ] Suporte a formas não retangulares
- [ ] Histórico de projetos
- [ ] PWA (Progressive Web App)
- [ ] Testes automatizados (Jest, Playwright)

---

## Progresso Atual

- [ ] **Estágio 1**: Setup Inicial
  - [ ] Sub-estágio 1.1: Configuração do Ambiente
  - [ ] Sub-estágio 1.2: Definição de Tipos TypeScript

- [ ] **Estágio 2**: Algoritmo de Nesting
  - [ ] Sub-estágio 2.1: Função de Validação de Espaço
  - [ ] Sub-estágio 2.2: Algoritmo de Posicionamento

- [ ] **Estágio 3**: Geração de G-Code
  - [ ] Sub-estágio 3.1: Função de Geração de G-code
  - [ ] Sub-estágio 3.2: Função de Download

- [ ] **Estágio 4**: Componentes de UI - Configurações
  - [ ] Sub-estágio 4.1: Componente de Configurações da Chapa
  - [ ] Sub-estágio 4.2: Componente de Configurações de Corte

- [ ] **Estágio 5**: Componentes de UI - Cadastro e Lista
  - [ ] Sub-estágio 5.1: Componente de Cadastro de Peças
  - [ ] Sub-estágio 5.2: Componente de Lista de Peças

- [ ] **Estágio 6**: Preview Visual
  - [ ] Sub-estágio 6.1: Componente Canvas Base
  - [ ] Sub-estágio 6.2: Renderização de Peças no Canvas

- [ ] **Estágio 7**: Integração e Página Principal
  - [ ] Sub-estágio 7.1: Gerenciamento de Estado
  - [ ] Sub-estágio 7.2: Layout e Composição dos Componentes
  - [ ] Sub-estágio 7.3: Funcionalidade de Gerar G-code

- [ ] **Estágio 8**: Ajustes Finais e Testes
  - [ ] Sub-estágio 8.1: Validações e Tratamento de Erros
  - [ ] Sub-estágio 8.2: Melhorias de UX
  - [ ] Sub-estágio 8.3: Testes Manuais Completos

- [ ] **Estágio 9**: Documentação e Deploy
  - [ ] Sub-estágio 9.1: Documentação
  - [ ] Sub-estágio 9.2: Build e Deploy

---

## Notas de Desenvolvimento

### Decisões Técnicas
- **Client-side only**: Toda lógica roda no navegador, sem necessidade de backend
- **Canvas API**: Para preview 2D, melhor performance que SVG para muitos elementos
- **Algoritmo de nesting**: Implementação "greedy" (gulosa) - não garante solução ótima mas é rápida
- **Formato numérico**: Sempre usar ponto como separador decimal no G-code

### Referências do Código Delphi
- **Algoritmo de nesting**: `uFrmCNC2.pas` linhas 250-327 (AtualizarPreview)
- **Geração de G-code**: `uFrmCNC2.pas` linhas 329-448 (GerarGCodePecas)
- **Validação de espaço**: `uFrmCNC2.pas` linhas 63-85 (CabeNoEspaco)
- **Validação ao adicionar**: `uFrmCNC2.pas` linhas 102-199 (btnAdicionarClick)
