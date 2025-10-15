# Migração de Layout - CNC Builder

Plano de migração do layout atual para o novo design system profissional e compacto.

---

## 🎯 Objetivos da Migração

- Implementar tema claro/escuro profissional (VSCode-inspired)
- Substituir cores marrom/madeira por paleta industrial moderna
- Aplicar tipografia Plus Jakarta Sans + JetBrains Mono
- Compactar espaçamentos para layout mais denso
- Adicionar sidebar colapsável com navegação organizada
- Implementar feedback visual consistente (loading, hover, transitions)
- Remover todos os emojis do código

---

## 📋 Regras de Migração

### 1. **Princípios de Design**
- ✅ Sempre tema claro como padrão (detectar preferência do sistema futuramente)
- ✅ Sem emojis em componentes ou textos
- ✅ Espaçamentos compactos mas respiráveis
- ✅ Tipografia clara e legível (JetBrains Mono para números)
- ✅ Feedback visual em todas as interações
- ✅ Transições suaves (200ms padrão)
- ✅ Cores harmônicas e profissionais

### 2. **Paleta de Cores**

**Tema Claro:**
```css
--bg-primary: #ffffff
--bg-secondary: #f8f9fa
--bg-tertiary: #e9ecef
--bg-hover: #f1f3f5

--text-primary: #1a1a1a
--text-secondary: #495057
--text-tertiary: #6c757d

--border-color: #dee2e6
--border-hover: #adb5bd

--primary: #f97316 (laranja industrial)
--secondary: #3b82f6 (azul técnico)
--success: #10b981
--danger: #ef4444
```

**Tema Escuro:**
```css
--bg-primary: #1e1e1e (VSCode dark)
--bg-secondary: #252526
--bg-tertiary: #2d2d30
--bg-hover: #37373d

--text-primary: #e4e4e7
--text-secondary: #a1a1aa
--text-tertiary: #71717a

--border-color: #3f3f46
--border-hover: #52525b

--primary: #fb923c
--secondary: #60a5fa
--success: #34d399
--danger: #f87171
```

### 3. **Espaçamentos Padrão**
```
xs: 4px
sm: 6px
md: 8px
lg: 10px
xl: 12px
2xl: 14px
3xl: 16px
```

### 4. **Tipografia**
```
h1: 16px (semibold)
h2: 14px (semibold)
h3: 13px (semibold)
body: 13px (regular)
small: 12px (regular)
caption: 11px (regular)
tiny: 10px (regular)
```

### 5. **Border Radius**
```
sm: 4px
md: 5px
lg: 6px
xl: 8px
```

---

## 📂 Arquivos a Modificar

### Fase 1: Configuração Base ✅
- [x] 1.1 - `tailwind.config.ts` - Configurar tema, cores e fontes
- [x] 1.2 - `app/globals.css` - Definir CSS variables e reset
- [x] 1.3 - `app/layout.tsx` - Adicionar fontes Google e theme provider

### Fase 2: Sistema de Tema ✅
- [x] 2.1 - `components/ThemeProvider.tsx` - Criar provider de tema (NOVO)
- [x] 2.2 - `components/ThemeToggle.tsx` - Criar botão toggle tema (NOVO)
- [x] 2.3 - `hooks/useTheme.ts` - Hook para gerenciar tema (NOVO)

### Fase 3: Componentes Base (shadcn/ui) ✅
- [x] 3.1 - `components/ui/button.tsx` - Ajustar tamanhos e espaçamentos
- [x] 3.2 - `components/ui/input.tsx` - Ajustar padding e font (JetBrains Mono)
- [x] 3.3 - `components/ui/label.tsx` - Ajustar font-size e peso
- [x] 3.4 - `components/ui/card.tsx` - Ajustar padding e radius
- [x] 3.5 - `components/ui/select.tsx` - Ajustar estilos
- [x] 3.6 - `components/ui/tabs.tsx` - Ajustar para nova sidebar
- [x] 3.7 - `components/ui/dialog.tsx` - Ajustar espaçamentos
- [x] 3.8 - `components/ui/scroll-area.tsx` - Manter consistência

### Fase 4: Nova Estrutura de Layout ✅
- [x] 4.1 - `components/Sidebar.tsx` - Criar sidebar colapsável (NOVO)
- [x] 4.2 - `components/Header.tsx` - Criar header compacto (NOVO)
- [x] 4.3 - `components/MainLayout.tsx` - Container principal (NOVO)
- [x] 4.4 - `app/page.tsx` - Refatorar para usar novo layout

### Fase 5: Componentes de Configuração ✅
- [x] 5.1 - `components/ConfiguracoesChapa.tsx` - Remover emojis, compactar
- [x] 5.2 - `components/ConfiguracoesCorte.tsx` - Remover emojis, compactar
- [x] 5.3 - `components/ConfiguracoesFerramenta.tsx` - Remover emojis, compactar
- [x] 5.4 - `components/SeletorNesting.tsx` - Remover emojis, compactar
- [x] 5.5 - `components/InfoTooltip.tsx` - Ajustar estilos

### Fase 6: Componentes de Trabalho ✅
- [x] 6.1 - `components/CadastroPeca.tsx` - Remover emojis, compactar form
- [x] 6.2 - `components/ListaPecas.tsx` - Compactar lista e badges
- [x] 6.3 - `components/PreviewCanvas.tsx` - Ajustar container
- [x] 6.4 - `components/PreviewFullscreen.tsx` - Ajustar modal
- [x] 6.5 - `components/VisualizadorGCode.tsx` - Remover emojis, ajustar
- [x] 6.6 - `components/DicionarioGCode.tsx` - Remover emojis, compactar

### Fase 7: Ajustes Finais ✅
- [x] 7.1 - Testar tema claro em todas as telas
- [x] 7.2 - Testar tema escuro em todas as telas
- [x] 7.3 - Testar sidebar colapsada/expandida
- [x] 7.4 - Verificar responsividade mobile
- [x] 7.5 - Ajustar contrastes e acessibilidade
- [x] 7.6 - Validar que não há emojis no código
- [x] 7.7 - Testar todos os estados de loading/hover/disabled

---

## 🔄 Processo de Trabalho

### Para cada arquivo modificado:

1. **Ler arquivo atual** e identificar pontos de mudança
2. **Remover emojis** de todos os textos e labels
3. **Ajustar classes Tailwind** conforme novos tamanhos:
   - `p-4` → `p-3.5` ou `p-3`
   - `gap-4` → `gap-3` ou `gap-2`
   - `text-base` → `text-sm`
   - `rounded-lg` → `rounded-md`
4. **Aplicar JetBrains Mono** em inputs numéricos e código
5. **Adicionar estados visuais** (hover, focus, active, disabled)
6. **Testar mudança** em ambos os temas
7. **Marcar como concluído** neste documento
8. **Commitar** com mensagem descritiva

### Commits sugeridos:
```
feat(theme): setup design system and theme provider
feat(ui): update button component with new spacing
feat(layout): implement collapsible sidebar navigation
refactor(config): remove emojis and compact spacing
```

---

## 📊 Métricas de Sucesso

- ✅ Zero emojis no código
- ✅ Tema claro e escuro funcionais
- ✅ Sidebar colapsável persistente
- ✅ Todos os componentes com feedback visual
- ✅ Espaçamentos 30% menores (média)
- ✅ Fontes Plus Jakarta Sans + JetBrains Mono aplicadas
- ✅ Transições suaves em todas as interações

---

## 🚀 Ordem de Execução

```
FASE 1 → FASE 2 → FASE 3 → FASE 4 → FASE 5 → FASE 6 → FASE 7
```

**Estimativa:** ~3-4 horas de trabalho focado

---

## 📝 Notas Importantes

- **NÃO modificar** lógica de negócio (nesting, gcode)
- **NÃO alterar** nomes de funções ou props
- **APENAS UI/UX** - layout, cores, espaçamentos, fontes
- **Testar sempre** após cada fase
- **Backup automático** via git commits frequentes

---

## ✅ Status Geral

| Fase | Status | Progresso |
|------|--------|-----------|
| Fase 1 | ✅ Concluída | 3/3 |
| Fase 2 | ✅ Concluída | 3/3 |
| Fase 3 | ✅ Concluída | 8/8 |
| Fase 4 | ✅ Concluída | 4/4 |
| Fase 5 | ✅ Concluída | 5/5 |
| Fase 6 | ✅ Concluída | 6/6 |
| Fase 7 | ✅ Concluída | 7/7 |

**Total:** 36/36 tarefas concluídas ✅

---

**Última atualização:** 2025-10-14
