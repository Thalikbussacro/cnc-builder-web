# Testes E2E e Visual Regression

## Estrutura de Testes

### Testes Funcionais
- `gcode-generation.spec.ts` - Testes do fluxo de geração de G-code

### Testes de Visual Regression
- `visual-regression.spec.ts` - Testes de consistência visual

## Executando os Testes

### Todos os testes E2E
```bash
npm run test:e2e
```

### Modo UI (interface gráfica)
```bash
npm run test:e2e:ui
```

### Modo headed (ver o navegador)
```bash
npm run test:e2e:headed
```

### Apenas visual regression
```bash
npx playwright test e2e/visual-regression.spec.ts
```

## Visual Regression

### Atualizando Screenshots Baseline
Quando há mudanças intencionais no visual da aplicação:

```bash
npx playwright test e2e/visual-regression.spec.ts --update-snapshots
```

### Como Funciona
Os testes de visual regression comparam screenshots atuais com baselines armazenados em `e2e/visual-regression.spec.ts-snapshots/`.

**Coberto por testes visuais:**
- Preview canvas com peças posicionadas
- Página inicial (estado vazio)
- Lista de peças
- Dark mode (se disponível)

### Tolerância de Diferenças
Os testes permitem pequenas diferenças de renderização:
- Canvas/componentes: até 100 pixels diferentes
- Página completa: até 200 pixels diferentes

### Quando os Testes Falham
Se um teste visual falhar, verifique:
1. As mudanças visuais foram intencionais?
   - **Sim**: Atualize os baselines com `--update-snapshots`
   - **Não**: Há um bug visual, corrija o código
2. Veja os diffs gerados em `test-results/`

## Estrutura de Snapshots
```
e2e/
  visual-regression.spec.ts-snapshots/
    homepage-initial-state-chromium-win32.png
    lista-pecas-3-items-chromium-win32.png
    preview-canvas-2-pecas-chromium-win32.png
```

## Boas Práticas

1. **Sempre rode os testes antes de commit**
   ```bash
   npm run test:e2e
   ```

2. **Revise diffs visuais cuidadosamente**
   - Use `npm run test:e2e:ui` para ver diffs lado a lado

3. **Mantenha baselines atualizados**
   - Após mudanças intencionais de UI, atualize os screenshots

4. **Não ignore falhas visuais**
   - Cada falha pode indicar um bug de regressão
