# ROADMAP - Melhorias Avançadas do Gerador de G-code CNC

Este documento organiza todas as funcionalidades avançadas pendentes para o gerador de G-code CNC, baseadas em necessidades profissionais identificadas.

---

## VISÃO GERAL DAS MELHORIAS

### Funcionalidades Principais a Implementar:
1. **Parâmetros Avançados de Corte** (Feedrate, Plunge Rate, Spindle Speed)
2. **Configurações de Ferramenta** (Diâmetro, tipo, material)
3. **Compensação de Ferramenta** (Corte interno/externo - G41/G42)
4. **Controle de Passadas** (Profundidade por passada configurável)
5. **Múltiplos Formatos de Exportação** (.nc, .tap, .gcode, .cnc)
6. **Presets de Material** (Madeira, MDF, Acrílico, Alumínio)

---

## PESQUISA TÉCNICA - PARÂMETROS G-CODE

### 1. FEEDRATE (F) - Taxa de Avanço
**O que é**: Velocidade de movimentação da fresa durante o corte
**Unidade**: mm/min ou in/min
**Comando G-code**: `F1000` (1000 mm/min)
**Valores Típicos**:
- Madeira/MDF: 1000-3000 mm/min
- Acrílico: 800-2000 mm/min
- Alumínio: 400-800 mm/min

**Impacto**:
- Muito baixo + RPM alto = superaquecimento, material queimado
- Muito alto = acabamento ruim, quebra de ferramenta

---

### 2. PLUNGE RATE (Fz) - Taxa de Mergulho
**O que é**: Velocidade de descida da fresa no eixo Z (penetração)
**Unidade**: mm/min
**Comando G-code**: `F300` (durante G1 Z-5)
**Valores Típicos**:
- Madeira/MDF: 300-800 mm/min
- Acrílico: 200-500 mm/min
- Alumínio: 100-400 mm/min

**Regra Geral**: Plunge rate = 30-50% do feedrate

**Impacto**:
- Muito rápido = quebra de ponta da fresa
- Muito lento = perda de produtividade

---

### 3. SPINDLE SPEED (S) - RPM do Spindle
**O que é**: Rotação por minuto da fresa
**Unidade**: RPM
**Comando G-code**: `S18000` (18.000 RPM)
**Valores Típicos**:
- Madeira/MDF: 18.000-24.000 RPM
- Acrílico: 12.000-18.000 RPM
- Alumínio: 10.000-15.000 RPM

**Impacto**:
- Muito alto + avanço lento = queima
- Muito baixo = acabamento ruim, lascamento

---

### 4. PROFUNDIDADE POR PASSADA (Depth per Pass)
**O que é**: Quanto a fresa desce em cada passada
**Unidade**: mm
**Valores Típicos**:
- Madeira/MDF: 3-5 mm
- Acrílico: 2-4 mm
- Alumínio: 1-2 mm

**Cálculo Atual**:
```typescript
const numPassadas = Math.ceil(profundidadeTotal / profundidadePorPassada);
```

**Problema Atual**: Código usa valor fixo de 5mm (`profundidade / 5`)

---

### 5. COMPENSAÇÃO DE FERRAMENTA (Tool Compensation)

#### **G41 - Compensação à Esquerda**
**Uso**: Corte **EXTERNO** (por fora da peça)
**Função**: Desloca caminho para a esquerda em `diâmetro_fresa / 2`
**Exemplo**:
```gcode
G41 D1          ; Ativa compensação esquerda com ferramenta D1
G1 X100 Y100    ; Movimenta com offset
G40             ; Cancela compensação
```

#### **G42 - Compensação à Direita**
**Uso**: Corte **INTERNO** (por dentro da peça, furos)
**Função**: Desloca caminho para a direita em `diâmetro_fresa / 2`
**Exemplo**:
```gcode
G42 D1          ; Ativa compensação direita com ferramenta D1
G1 X100 Y100    ; Movimenta com offset
G40             ; Cancela compensação
```

#### **G40 - Cancelar Compensação**
**Função**: Desativa qualquer compensação ativa

**Vantagem**:
- Mesmo programa serve para fresas de diferentes diâmetros
- Compensa desgaste da ferramenta
- Dimensões finais precisas

---

### 6. FORMATOS DE ARQUIVO

#### **.nc (Numerical Control)**
- **Mais comum** para CNC modernas
- Texto puro ASCII
- Compatível com a maioria dos controladores

#### **.tap (Tape)**
- **Origem histórica**: Fita perfurada
- Idêntico ao .nc (apenas extensão diferente)
- Preferido por alguns controladores antigos
- Texto puro ASCII

#### **.gcode**
- Formato genérico
- Usado por impressoras 3D e CNC
- Texto puro ASCII

#### **.cnc**
- Variação menos comum
- Idêntico aos demais
- Texto puro ASCII

**CONCLUSÃO**: Todos são **arquivos de texto idênticos**. A diferença é apenas a extensão.

**Implementação**: Permitir usuário escolher extensão no download.

---

## PLANO DE DESENVOLVIMENTO DETALHADO

### **ESTÁGIO 10: CONFIGURAÇÕES AVANÇADAS DE CORTE**

---

#### **Sub-estágio 10.1: Configurações de Velocidade e Potência**

**Objetivo**: Adicionar controles para Feedrate, Plunge Rate e Spindle Speed

**Tarefas**:
1. Atualizar tipo `ConfiguracoesCorte` em `types/index.ts`
2. Adicionar novos campos:
   - `feedrate: number` (mm/min)
   - `plungeRate: number` (mm/min)
   - `spindleSpeed: number` (RPM)
3. Atualizar componente `ConfiguracoesCorte.tsx`
4. Adicionar 3 novos inputs numéricos com labels explicativos
5. Definir valores padrão razoáveis:
   ```typescript
   feedrate: 1500,        // mm/min
   plungeRate: 500,       // mm/min
   spindleSpeed: 18000    // RPM
   ```

**Interface**:
```typescript
type ConfiguracoesCorte = {
  profundidade: number;
  espacamento: number;
  profundidadePorPassada: number;  // NOVO
  feedrate: number;                 // NOVO
  plungeRate: number;               // NOVO
  spindleSpeed: number;             // NOVO
};
```

**Commit**: `feat: adicionar configurações de velocidade (feedrate, plunge rate, spindle speed)`

---

#### **Sub-estágio 10.2: Profundidade por Passada Configurável**

**Objetivo**: Permitir controle fino de quanto desce por passada

**Tarefas**:
1. Adicionar campo `profundidadePorPassada` em `ConfiguracoesCorte`
2. Atualizar componente `ConfiguracoesCorte.tsx` com novo input
3. Modificar `gcode-generator.ts` para usar valor configurável
4. Substituir cálculo atual:
   ```typescript
   // ANTES
   const numPassadas = Math.ceil(profundidade / 5);

   // DEPOIS
   const numPassadas = Math.ceil(profundidade / config.profundidadePorPassada);
   ```
5. Adicionar validação: `profundidadePorPassada <= profundidadeTotal`

**Valores Padrão por Material**:
- Madeira/MDF: 4mm
- Acrílico: 3mm
- Alumínio: 1.5mm

**Commit**: `feat: adicionar controle de profundidade por passada`

---

#### **Sub-estágio 10.3: Integração de Velocidades no G-code**

**Objetivo**: Modificar gerador de G-code para usar novos parâmetros

**Tarefas**:
1. Atualizar função `gerarGCode` em `lib/gcode-generator.ts`
2. Usar `spindleSpeed` no comando `M3`:
   ```gcode
   M3 S${config.spindleSpeed}
   ```
3. Adicionar `feedrate` nos movimentos de corte (G1 XY):
   ```gcode
   G1 X${x} Y${y} F${config.feedrate}
   ```
4. Adicionar `plungeRate` nos movimentos de descida (G1 Z):
   ```gcode
   G1 Z${z} F${config.plungeRate}
   ```
5. Restaurar feedrate após plunge
6. Adicionar comentários explicativos no G-code gerado

**Exemplo de Sequência**:
```gcode
; Configurações de corte
; Spindle: 18000 RPM
; Feedrate: 1500 mm/min
; Plunge Rate: 500 mm/min
; Profundidade por passada: 4 mm

M3 S18000           ; Liga spindle
G0 X10 Y10          ; Posiciona rápido
G1 Z-4 F500         ; Desce com plunge rate
G1 X110 F1500       ; Corta com feedrate
G1 Y110 F1500       ; Continua corte
G1 Z5 F500          ; Sobe
```

**Commit**: `feat: integrar feedrate, plunge rate e spindle speed no G-code gerado`

---

### **ESTÁGIO 11: CONFIGURAÇÕES DE FERRAMENTA**

---

#### **Sub-estágio 11.1: Definição de Ferramenta**

**Objetivo**: Adicionar informações sobre a fresa utilizada

**Tarefas**:
1. Criar novo tipo `ConfiguracoesFerramenta` em `types/index.ts`
2. Adicionar campos:
   ```typescript
   type ConfiguracoesFerramenta = {
     diametro: number;           // mm (ex: 6mm)
     tipo: 'flat' | 'ball' | 'vbit';  // Tipo de ponta
     material: string;           // HSS, Carbide, Diamond
     numeroFerramenta: number;   // T1, T2, etc.
   };
   ```
3. Criar componente `ConfiguracoesFerramenta.tsx`
4. Adicionar Card com inputs para cada campo
5. Valores padrão:
   ```typescript
   diametro: 6,
   tipo: 'flat',
   material: 'Carbide',
   numeroFerramenta: 1
   ```

**Commit**: `feat: adicionar configurações de ferramenta (diâmetro, tipo, material)`

---

#### **Sub-estágio 11.2: Compensação de Ferramenta (G41/G42)**

**Objetivo**: Implementar corte interno/externo com compensação

**Tarefas**:
1. Adicionar campo `tipoCorte` em `ConfiguracoesFerramenta`:
   ```typescript
   tipoCorte: 'externo' | 'interno' | 'na-linha';
   ```
2. Atualizar componente `ConfiguracoesFerramenta.tsx`
3. Adicionar RadioGroup ou Select para escolher tipo de corte
4. Explicações inline:
   - **Externo (G41)**: Fresa corta por fora da marcação (peça final menor)
   - **Interno (G42)**: Fresa corta por dentro (para furos, peça final maior)
   - **Na linha (G40)**: Fresa segue exatamente a marcação
5. Modificar `gcode-generator.ts` para aplicar G41/G42/G40
6. Adicionar offset de `diametro/2` nos cálculos de caminho

**Lógica de Compensação**:
```typescript
function gerarCodigoComCompensacao(
  x: number,
  y: number,
  config: ConfiguracoesFerramenta
): string {
  const raio = config.diametro / 2;

  switch (config.tipoCorte) {
    case 'externo':
      return `G41 D${config.numeroFerramenta}\nG1 X${x} Y${y}`;
    case 'interno':
      return `G42 D${config.numeroFerramenta}\nG1 X${x} Y${y}`;
    case 'na-linha':
    default:
      return `G40\nG1 X${x} Y${y}`;
  }
}
```

**Commit**: `feat: implementar compensação de ferramenta (G41/G42) para corte interno/externo`

---

### **ESTÁGIO 12: PRESETS DE MATERIAL**

---

#### **Sub-estágio 12.1: Sistema de Presets**

**Objetivo**: Criar presets pré-configurados para materiais comuns

**Tarefas**:
1. Criar arquivo `lib/material-presets.ts`
2. Definir interface `MaterialPreset`:
   ```typescript
   interface MaterialPreset {
     nome: string;
     feedrate: number;
     plungeRate: number;
     spindleSpeed: number;
     profundidadePorPassada: number;
     descricao: string;
   }
   ```
3. Criar presets para materiais comuns:
   ```typescript
   export const PRESETS_MATERIAIS: MaterialPreset[] = [
     {
       nome: 'MDF 15mm',
       feedrate: 2000,
       plungeRate: 600,
       spindleSpeed: 18000,
       profundidadePorPassada: 4,
       descricao: 'Ideal para MDF de espessura média'
     },
     {
       nome: 'Madeira Maciça',
       feedrate: 1500,
       plungeRate: 500,
       spindleSpeed: 18000,
       profundidadePorPassada: 3,
       descricao: 'Pinho, cedro, compensado'
     },
     {
       nome: 'Acrílico 5-10mm',
       feedrate: 1200,
       plungeRate: 400,
       spindleSpeed: 15000,
       profundidadePorPassada: 3,
       descricao: 'Acrílico transparente ou colorido'
     },
     {
       nome: 'Alumínio',
       feedrate: 600,
       plungeRate: 200,
       spindleSpeed: 12000,
       profundidadePorPassada: 1.5,
       descricao: 'Alumínio 6061 ou similar'
     },
     {
       nome: 'Personalizado',
       feedrate: 1500,
       plungeRate: 500,
       spindleSpeed: 18000,
       profundidadePorPassada: 4,
       descricao: 'Configure manualmente os parâmetros'
     }
   ];
   ```
4. Criar componente `SeletorMaterial.tsx`
5. Adicionar Dropdown/RadioGroup para selecionar preset
6. Ao selecionar preset, preencher automaticamente campos de corte
7. Permitir edição manual após aplicar preset

**Commit**: `feat: adicionar presets de material (MDF, madeira, acrílico, alumínio)`

---

#### **Sub-estágio 12.2: Integração de Presets na UI**

**Objetivo**: Posicionar seletor de material na interface

**Tarefas**:
1. Adicionar `SeletorMaterial` acima de `ConfiguracoesCorte`
2. Criar handler `handleSelecionarMaterial`
3. Atualizar estado `configCorte` ao selecionar preset
4. Adicionar indicador visual de preset ativo
5. Mostrar tooltip/descrição do material selecionado
6. Adicionar botão "Resetar para Preset" caso usuário altere manualmente

**Layout Sugerido**:
```
┌─────────────────────────────────┐
│ Configurações da Chapa          │
├─────────────────────────────────┤
│ Material                         │
│ [Dropdown: MDF 15mm ▼]          │
│ ℹ️ Ideal para MDF espessura...  │
├─────────────────────────────────┤
│ Configurações de Corte          │
│ Feedrate: 2000 mm/min           │
│ Plunge Rate: 600 mm/min         │
│ Spindle Speed: 18000 RPM        │
│ Prof. por Passada: 4 mm         │
└─────────────────────────────────┘
```

**Commit**: `feat: integrar seletor de material na interface principal`

---

### **ESTÁGIO 13: MÚLTIPLOS FORMATOS DE EXPORTAÇÃO**

---

#### **Sub-estágio 13.1: Seletor de Formato de Arquivo**

**Objetivo**: Permitir escolha entre .nc, .tap, .gcode, .cnc

**Tarefas**:
1. Criar tipo `FormatoArquivo` em `types/index.ts`:
   ```typescript
   type FormatoArquivo = 'nc' | 'tap' | 'gcode' | 'cnc';
   ```
2. Adicionar estado `formatoArquivo` em `app/page.tsx`
3. Atualizar componente `VisualizadorGCode` ou criar novo componente
4. Adicionar RadioGroup ou ButtonGroup para selecionar formato
5. Mostrar descrição de cada formato:
   - **.nc**: Padrão moderno (recomendado)
   - **.tap**: Compatibilidade com controladores antigos
   - **.gcode**: Formato genérico (3D printers + CNC)
   - **.cnc**: Variação alternativa

**Commit**: `feat: adicionar seletor de formato de arquivo (.nc, .tap, .gcode, .cnc)`

---

#### **Sub-estágio 13.2: Atualizar Função de Download**

**Objetivo**: Gerar arquivo com extensão escolhida

**Tarefas**:
1. Modificar função `downloadGCode` em `lib/utils.ts`
2. Adicionar parâmetro `formato`:
   ```typescript
   export function downloadGCode(
     conteudo: string,
     formato: FormatoArquivo = 'nc'
   ): void
   ```
3. Construir nome do arquivo dinamicamente:
   ```typescript
   const nomeArquivo = `corte_${Date.now()}.${formato}`;
   ```
4. Garantir que conteúdo é idêntico independente da extensão
5. Adicionar timestamp no nome do arquivo para evitar sobrescrever

**Exemplo**:
```typescript
downloadGCode(gcode, 'tap');  // → corte_1735689234567.tap
downloadGCode(gcode, 'nc');   // → corte_1735689234567.nc
```

**Commit**: `feat: permitir download em múltiplos formatos (.nc, .tap, .gcode, .cnc)`

---

### **ESTÁGIO 14: MELHORIAS DE VISUALIZAÇÃO**

---

#### **Sub-estágio 14.1: Preview de Caminho de Corte**

**Objetivo**: Mostrar visualmente caminho da fresa (com compensação)

**Tarefas**:
1. Atualizar `PreviewCanvas.tsx`
2. Desenhar retângulo da peça (linha tracejada)
3. Desenhar caminho real da fresa (linha sólida)
4. Aplicar offset visual baseado em `tipoCorte` e `diametro`
5. Usar cores diferentes:
   - Verde: Peça final
   - Azul: Caminho da fresa
   - Vermelho: Área removida
6. Adicionar legenda

**Commit**: `feat: adicionar preview visual do caminho de corte com compensação`

---

#### **Sub-estágio 14.2: Simulação 3D (Opcional - Futuro)**

**Objetivo**: Preview 3D usando Three.js

**Tarefas**:
1. Instalar `three` e `@react-three/fiber`
2. Criar componente `Preview3D.tsx`
3. Renderizar chapa em 3D
4. Animar caminho da fresa
5. Permitir rotação/zoom da câmera

**Commit**: `feat: adicionar preview 3D interativo com Three.js`

---

### **ESTÁGIO 15: VALIDAÇÕES E SEGURANÇA**

---

#### **Sub-estágio 15.1: Validações de Parâmetros**

**Objetivo**: Evitar valores perigosos ou inválidos

**Tarefas**:
1. Criar `lib/validacoes.ts`
2. Implementar validações:
   ```typescript
   function validarConfiguracoesCorte(config: ConfiguracoesCorte): string[] {
     const erros: string[] = [];

     if (config.feedrate < 100 || config.feedrate > 5000) {
       erros.push('Feedrate deve estar entre 100 e 5000 mm/min');
     }

     if (config.plungeRate > config.feedrate) {
       erros.push('Plunge rate não deve exceder feedrate');
     }

     if (config.spindleSpeed < 5000 || config.spindleSpeed > 30000) {
       erros.push('Spindle speed deve estar entre 5000 e 30000 RPM');
     }

     if (config.profundidadePorPassada > config.profundidade) {
       erros.push('Profundidade por passada maior que profundidade total');
     }

     return erros;
   }
   ```
3. Adicionar validação antes de gerar G-code
4. Mostrar avisos em amarelo (warnings) para valores suspeitos
5. Bloquear geração se houver erros críticos

**Commit**: `feat: adicionar validações de segurança para parâmetros de corte`

---

#### **Sub-estágio 15.2: Calculadora de Chip Load (Opcional)**

**Objetivo**: Sugerir valores ideais baseados em fórmulas

**Tarefas**:
1. Implementar cálculo de chip load:
   ```typescript
   chipLoad = feedrate / (spindleSpeed * numFlutes)
   ```
2. Mostrar sugestão se valores estiverem fora do ideal
3. Adicionar botão "Otimizar Automaticamente"

**Commit**: `feat: adicionar calculadora de chip load e otimização automática`

---

## ORDEM DE IMPLEMENTAÇÃO RECOMENDADA

### **PRIORIDADE ALTA** (Necessidades Imediatas)
1. ✅ **Estágio 10.1**: Feedrate, Plunge Rate, Spindle Speed
2. ✅ **Estágio 10.2**: Profundidade por passada
3. ✅ **Estágio 10.3**: Integração no G-code
4. ✅ **Estágio 13.1**: Seletor de formato (.nc, .tap)
5. ✅ **Estágio 13.2**: Download multi-formato

### **PRIORIDADE MÉDIA** (Importante mas não urgente)
6. ⏳ **Estágio 11.1**: Configurações de ferramenta
7. ⏳ **Estágio 11.2**: Compensação G41/G42
8. ⏳ **Estágio 12.1**: Presets de material
9. ⏳ **Estágio 12.2**: Integração de presets

### **PRIORIDADE BAIXA** (Melhorias futuras)
10. 🔮 **Estágio 14.1**: Preview de caminho de corte
11. 🔮 **Estágio 15.1**: Validações avançadas
12. 🔮 **Estágio 15.2**: Calculadora chip load
13. 🔮 **Estágio 14.2**: Preview 3D (Three.js)

---

## ESTIMATIVAS DE TEMPO

| Estágio | Descrição | Tempo Estimado |
|---------|-----------|----------------|
| 10.1 | Velocidades UI | 1-2h |
| 10.2 | Prof. por passada | 0.5h |
| 10.3 | Integração G-code | 1h |
| 13.1-13.2 | Multi-formato | 1h |
| **TOTAL ALTA** | | **3.5-4.5h** |
| 11.1 | Config ferramenta | 1.5h |
| 11.2 | G41/G42 | 2-3h |
| 12.1-12.2 | Presets material | 2h |
| **TOTAL MÉDIA** | | **5.5-6.5h** |
| 14.1 | Preview caminho | 3h |
| 15.1 | Validações | 2h |
| 15.2 | Chip load calc | 2h |
| 14.2 | Three.js 3D | 6-8h |
| **TOTAL BAIXA** | | **13-15h** |

---

## REFERÊNCIAS TÉCNICAS

### Documentação G-code
- [G-Code Cheat Sheet - CNC Cookbook](https://www.cnccookbook.com/g-code-cheat-sheet-mdi/)
- [G41/G42 Cutter Compensation Guide](https://gcodetutor.com/gcode-tutorial/g41-g42-cutter-compensation.html)
- [LinuxCNC G-Code Reference](https://linuxcnc.org/docs/html/gcode/g-code.html)

### Feeds & Speeds
- [CNC Router Feeds and Speeds Guide](https://www.endmill.com.au/blog/cnc-router-feeds-and-speeds-the-adams-guide/)
- [G-Wizard Calculator](https://www.cnccookbook.com/g-wizard-cnc-feed-speed-calculator/)

### Formatos de Arquivo
- [Understanding CNC File Formats](https://cnccode.com/2025/07/22/understanding-cnc-file-formats-g-code-tap-nc-and-beyond/)

---

## NOTAS IMPORTANTES

### Sobre Compensação de Ferramenta (G41/G42)
⚠️ **ATENÇÃO**: Nem todos os controladores CNC suportam G41/G42 nativamente.
**Alternativa**: Calcular offset matematicamente no JavaScript antes de gerar G-code.

### Sobre Plunge Rate
💡 **DICA**: Sempre usar plunge rate menor que feedrate (geralmente 30-50%).

### Sobre Spindle Speed
🔧 **IMPORTANTE**: Verificar especificações do spindle antes de permitir valores acima de 24.000 RPM.

### Sobre Formatos .tap vs .nc
📝 **NOTA**: São idênticos. Apenas permita usuário escolher extensão preferida da máquina.

---

## PRÓXIMOS PASSOS IMEDIATOS

1. Começar pelo **Estágio 10.1** (Feedrate, Plunge, Spindle)
2. Testar geração de G-code com novos parâmetros
3. Validar output em simulador G-code online
4. Implementar **Estágio 13** (multi-formato)
5. Testar com máquina CNC real (se disponível)

---

## ATUALIZAÇÃO DO SETUP-GCODE.md

Este roadmap complementa o `SETUP-GCODE.md` original. Após concluir Estágios 10-15, atualizar:

```markdown
- [x] **Estágio 10**: Configurações Avançadas de Corte ✅
  - [x] Sub-estágio 10.1: Velocidade e Potência
  - [x] Sub-estágio 10.2: Profundidade por Passada
  - [x] Sub-estágio 10.3: Integração no G-code

- [x] **Estágio 11**: Configurações de Ferramenta ✅
  - [x] Sub-estágio 11.1: Definição de Ferramenta
  - [x] Sub-estágio 11.2: Compensação G41/G42

- [x] **Estágio 12**: Presets de Material ✅
  - [x] Sub-estágio 12.1: Sistema de Presets
  - [x] Sub-estágio 12.2: Integração na UI

- [x] **Estágio 13**: Múltiplos Formatos ✅
  - [x] Sub-estágio 13.1: Seletor de Formato
  - [x] Sub-estágio 13.2: Download Multi-formato
```

---

**Documento criado em**: 2025-01-08
**Última atualização**: 2025-01-08
**Versão**: 1.0
