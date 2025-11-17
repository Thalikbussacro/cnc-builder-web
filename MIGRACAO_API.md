# Migração: G-Code Generator para API REST Standalone

**Objetivo:** Separar responsabilidades arquiteturais extraindo toda a lógica de geração de G-code para uma API REST independente usando Node.js + Express, mantendo o frontend Next.js como cliente puro.

## Princípios da Migração

- **SimplicidadeFirst**: Começar com endpoints mínimos, expandir conforme necessário
- **Incremental**: Cada fase é testável e deployável isoladamente
- **Apenas V2**: Usar exclusivamente o gerador V2 otimizado
- **Defaults Inteligentes**: API deve funcionar com mínimo de parâmetros obrigatórios
- **Sem Fallback**: Remover completamente lógica client-side, API é fonte única de verdade

## Arquitetura Atual (Baseline)

O projeto **cnc-builder-web** é atualmente 100% client-side:
- ❌ Sem backend (Next.js apenas para UI)
- ❌ Sem banco de dados (usa localStorage)
- ✅ Todo processamento no navegador
- ✅ Sem latência de rede
- ✅ Performance não é problema

**Funcionalidades a migrar:**
- Gerador G-code V2 (`lib/gcode-generator-v2.ts`)
- 3 algoritmos de nesting (greedy, shelf, guillotine)
- Validações de configuração
- Cálculo de tempo estimado
- Otimização TSP de ordem de corte

---

## Fase 1: Configuração do Projeto API

**Objetivo:** Criar estrutura base funcional e testável

### 1.1 Criar estrutura base do projeto API
```bash
# Fora do projeto cnc-builder-web
mkdir cnc-builder-api
cd cnc-builder-api
npm init -y
```

- [ ] Inicializar projeto Node.js
- [ ] Configurar TypeScript
- [ ] Instalar dependências base:
  ```bash
  npm install express cors
  npm install -D typescript @types/node @types/express @types/cors ts-node-dev
  ```

### 1.2 Configurar estrutura de pastas
```
cnc-builder-api/
├── src/
│   ├── routes/
│   │   └── gcode.routes.ts
│   ├── services/
│   │   ├── gcode-generator-v2.ts
│   │   ├── nesting-algorithm.ts
│   │   └── validator.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── defaults.ts
│   └── server.ts
├── package.json
├── tsconfig.json
└── .env.example
```

- [ ] Criar estrutura de diretórios
- [ ] Configurar `tsconfig.json` com strict mode
- [ ] Criar `.gitignore` (node_modules, dist, .env)

### 1.3 Configurar scripts do package.json
```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "echo \"Teste manual via curl/Postman\""
  }
}
```

- [ ] Adicionar scripts
- [ ] Testar `npm run dev` (deve falhar, ainda não temos server.ts)

### ✅ Checkpoint 1.1: Estrutura criada
**Teste:** `npm run dev` executa (mesmo que dê erro de arquivo faltando)

---

## Fase 2: Migração da Lógica de Negócio

**Objetivo:** Copiar código existente e adaptá-lo para funcionar server-side

### 2.1 Copiar tipos TypeScript
```bash
# Do projeto cnc-builder-web
cp types/index.ts ../cnc-builder-api/src/types/
```

- [ ] Copiar `types/index.ts` do projeto web
- [ ] Verificar compilação: `npm run build`
- [ ] Ajustar imports se necessário (remover `@/` alias)

### 2.2 Migrar algoritmo de nesting
```bash
cp lib/nesting-algorithm.ts ../cnc-builder-api/src/services/
```

- [ ] Copiar `lib/nesting-algorithm.ts`
- [ ] Ajustar imports: trocar `@/types` por `../types`
- [ ] **CRÍTICO**: Remover dependências de browser (se houver `window`, `document`, etc)
- [ ] Testar compilação

**Validação:**
```typescript
// Criar arquivo test/nesting-test.ts
import { posicionarPecas } from '../src/services/nesting-algorithm';
const resultado = posicionarPecas([...], 2850, 1500, 50, 'guillotine');
console.log(resultado);
```

### 2.3 Migrar gerador G-code V2
```bash
cp lib/gcode-generator-v2.ts ../cnc-builder-api/src/services/
cp lib/gcode-generator.ts ../cnc-builder-api/src/services/
```

- [ ] Copiar ambos arquivos (V2 depende de funções do V1)
- [ ] Ajustar imports
- [ ] **CRÍTICO**: Remover `downloadGCode()` (depende de DOM)
- [ ] Manter apenas: `gerarGCodeV2()`, `calcularTempoEstimado()`, `formatarTempo()`, `removerComentarios()`

**Validação:**
```typescript
// Criar test/gcode-test.ts
import { gerarGCodeV2 } from '../src/services/gcode-generator-v2';
const gcode = gerarGCodeV2([...], {...}, {...}, undefined, true);
console.log(gcode.substring(0, 500)); // Primeiras linhas
```

### 2.4 Migrar validações
```bash
cp lib/validator.ts ../cnc-builder-api/src/services/
cp lib/validation-rules.ts ../cnc-builder-api/src/services/
```

- [ ] Copiar arquivos de validação
- [ ] Ajustar imports
- [ ] Testar compilação

### 2.5 Criar sistema de defaults
Criar `src/utils/defaults.ts`:

```typescript
import type { ConfiguracoesChapa, ConfiguracoesCorte, ConfiguracoesFerramenta } from '../types';

export const DEFAULT_CONFIG_CHAPA: ConfiguracoesChapa = {
  largura: 2850,
  altura: 1500,
  espessura: 15,
};

export const DEFAULT_CONFIG_CORTE: ConfiguracoesCorte = {
  profundidade: 15,
  espacamento: 50,
  profundidadePorPassada: 4,
  feedrate: 1500,
  plungeRate: 500,
  rapidsSpeed: 4000,
  spindleSpeed: 18000,
  usarRampa: false,
  anguloRampa: 3,
  aplicarRampaEm: 'primeira-passada',
  usarMesmoEspacamentoBorda: true,
  margemBorda: 50,
};

export const DEFAULT_CONFIG_FERRAMENTA: ConfiguracoesFerramenta = {
  diametro: 6,
  numeroFerramenta: 1,
};

/**
 * Mescla configurações fornecidas com defaults
 */
export function mergeWithDefaults<T>(partial: Partial<T>, defaults: T): T {
  return { ...defaults, ...partial };
}
```

- [ ] Criar arquivo com defaults
- [ ] Exportar função `mergeWithDefaults()`
- [ ] Testar compilação

### ✅ Checkpoint 2.1: Lógica migrada
**Teste:** Todos arquivos compilam sem erro (`npm run build`)

---

## Fase 3: Implementação da API REST

**Objetivo:** Criar servidor Express funcional com endpoint único de geração

### 3.1 Configurar servidor Express
Criar `src/server.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import gcodeRoutes from './routes/gcode.routes';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Permite requests grandes

// Rotas
app.use('/api', gcodeRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Tratamento global de erros
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API rodando em http://localhost:${PORT}`);
});
```

- [ ] Criar `src/server.ts`
- [ ] Configurar CORS (permitir todas origens por enquanto)
- [ ] Configurar JSON parsing com limite 10mb
- [ ] Adicionar health check em `/health`

### 3.2 Criar endpoint de geração
Criar `src/routes/gcode.routes.ts`:

```typescript
import { Router } from 'express';
import type { Peca } from '../types';
import { posicionarPecas } from '../services/nesting-algorithm';
import { gerarGCodeV2, calcularTempoEstimado } from '../services/gcode-generator-v2';
import { mergeWithDefaults, DEFAULT_CONFIG_CHAPA, DEFAULT_CONFIG_CORTE, DEFAULT_CONFIG_FERRAMENTA } from '../utils/defaults';

const router = Router();

/**
 * POST /api/gcode/generate
 *
 * Body (todos campos opcionais exceto 'pecas'):
 * {
 *   pecas: Peca[],                          // OBRIGATÓRIO
 *   configChapa?: Partial<ConfiguracoesChapa>,
 *   configCorte?: Partial<ConfiguracoesCorte>,
 *   configFerramenta?: Partial<ConfiguracoesFerramenta>,
 *   metodoNesting?: 'greedy' | 'shelf' | 'guillotine',  // Default: guillotine
 *   incluirComentarios?: boolean            // Default: true
 * }
 *
 * Response:
 * {
 *   gcode: string,
 *   metadata: {
 *     linhas: number,
 *     tamanhoBytes: number,
 *     tempoEstimado: { ... },
 *     metricas: { areaUtilizada, eficiencia },
 *     configuracoes: { ... }  // Configurações finais aplicadas
 *   }
 * }
 */
router.post('/gcode/generate', (req, res) => {
  try {
    const {
      pecas,
      configChapa,
      configCorte,
      configFerramenta,
      metodoNesting = 'guillotine',
      incluirComentarios = true
    } = req.body;

    // Validação básica
    if (!pecas || !Array.isArray(pecas) || pecas.length === 0) {
      return res.status(400).json({
        error: 'Parâmetro "pecas" é obrigatório e deve ser array não vazio',
      });
    }

    // Mescla com defaults
    const configChapaFinal = mergeWithDefaults(configChapa || {}, DEFAULT_CONFIG_CHAPA);
    const configCorteFinal = mergeWithDefaults(configCorte || {}, DEFAULT_CONFIG_CORTE);
    const configFerramentaFinal = configFerramenta
      ? mergeWithDefaults(configFerramenta, DEFAULT_CONFIG_FERRAMENTA)
      : undefined;

    // Calcula margem de borda
    const margemBorda = configCorteFinal.usarMesmoEspacamentoBorda
      ? undefined
      : configCorteFinal.margemBorda;

    // Executa nesting
    const resultadoNesting = posicionarPecas(
      pecas,
      configChapaFinal.largura,
      configChapaFinal.altura,
      configCorteFinal.espacamento,
      metodoNesting,
      margemBorda
    );

    // Verifica se alguma peça não coube
    if (resultadoNesting.naoCouberam.length > 0) {
      return res.status(400).json({
        error: 'Algumas peças não couberam na chapa',
        naoCouberam: resultadoNesting.naoCouberam.map(p => ({
          id: p.id,
          nome: p.nome,
          largura: p.largura,
          altura: p.altura
        }))
      });
    }

    // Gera G-code
    const gcode = gerarGCodeV2(
      resultadoNesting.posicionadas,
      configChapaFinal,
      configCorteFinal,
      configFerramentaFinal,
      incluirComentarios
    );

    // Calcula tempo estimado
    const tempoEstimado = calcularTempoEstimado(
      resultadoNesting.posicionadas,
      configChapaFinal,
      configCorteFinal
    );

    // Metadata
    const linhas = gcode.split('\n').length;
    const tamanhoBytes = Buffer.byteLength(gcode, 'utf8');

    res.json({
      gcode,
      metadata: {
        linhas,
        tamanhoBytes,
        tempoEstimado,
        metricas: resultadoNesting.metricas,
        configuracoes: {
          chapa: configChapaFinal,
          corte: configCorteFinal,
          ferramenta: configFerramentaFinal,
          nesting: {
            metodo: metodoNesting,
            pecasPosicionadas: resultadoNesting.posicionadas.length,
            eficiencia: resultadoNesting.metricas.eficiencia
          }
        }
      }
    });

  } catch (error: any) {
    console.error('Erro ao gerar G-code:', error);
    res.status(500).json({
      error: 'Erro ao gerar G-code',
      message: error.message
    });
  }
});

export default router;
```

- [ ] Criar arquivo de rotas
- [ ] Implementar endpoint `POST /api/gcode/generate`
- [ ] Aplicar defaults inteligentes
- [ ] Validar peças obrigatórias
- [ ] Retornar erro se peças não couberam

### 3.3 Testar endpoint localmente
Criar `test/manual-test.sh`:

```bash
#!/bin/bash

# Teste 1: Request mínimo (só peças)
curl -X POST http://localhost:3001/api/gcode/generate \
  -H "Content-Type: application/json" \
  -d '{
    "pecas": [
      { "largura": 100, "altura": 200, "tipoCorte": "externo", "id": "1" },
      { "largura": 150, "altura": 150, "tipoCorte": "externo", "id": "2" }
    ]
  }'

# Teste 2: Request completo
curl -X POST http://localhost:3001/api/gcode/generate \
  -H "Content-Type: application/json" \
  -d '{
    "pecas": [
      { "largura": 100, "altura": 200, "tipoCorte": "externo", "id": "1", "nome": "Teste 1" }
    ],
    "configChapa": {
      "largura": 1000,
      "altura": 1000,
      "espessura": 10
    },
    "configCorte": {
      "profundidade": 10,
      "espacamento": 30
    },
    "metodoNesting": "shelf",
    "incluirComentarios": false
  }'
```

**Testes obrigatórios:**
- [ ] `npm run dev` - servidor sobe sem erros
- [ ] `curl http://localhost:3001/health` - retorna `{"status":"ok"}`
- [ ] Teste 1 (mínimo) - gera G-code com defaults
- [ ] Teste 2 (completo) - gera G-code com configs customizadas
- [ ] Validar que G-code gerado está correto (conferir primeiras linhas)
- [ ] Validar metadata (linhas, bytes, tempo, métricas)

### ✅ Checkpoint 3.1: API funcional
**Teste:** Conseguir gerar G-code via curl/Postman com sucesso

---

## Fase 4: Testes e Documentação

**Objetivo:** Garantir que API funciona corretamente e está documentada

### 4.1 Bateria de testes completa
Criar `test/test-suite.sh`:

```bash
#!/bin/bash
set -e

echo "=== SUITE DE TESTES DA API ==="

# Teste 1: Health check
echo "\n[1/7] Health check..."
curl -s http://localhost:3001/health | grep "ok" && echo "✅ PASS" || echo "❌ FAIL"

# Teste 2: Request mínimo (só peças)
echo "\n[2/7] Request mínimo (defaults)..."
curl -s -X POST http://localhost:3001/api/gcode/generate \
  -H "Content-Type: application/json" \
  -d '{"pecas":[{"largura":100,"altura":200,"tipoCorte":"externo","id":"1"}]}' \
  | grep "gcode" && echo "✅ PASS" || echo "❌ FAIL"

# Teste 3: Múltiplas peças
echo "\n[3/7] Múltiplas peças..."
curl -s -X POST http://localhost:3001/api/gcode/generate \
  -H "Content-Type: application/json" \
  -d '{"pecas":[{"largura":100,"altura":100,"tipoCorte":"externo","id":"1"},{"largura":200,"altura":200,"tipoCorte":"externo","id":"2"},{"largura":50,"altura":50,"tipoCorte":"interno","id":"3"}]}' \
  | grep "gcode" && echo "✅ PASS" || echo "❌ FAIL"

# Teste 4: Diferentes métodos de nesting
echo "\n[4/7] Método nesting = greedy..."
curl -s -X POST http://localhost:3001/api/gcode/generate \
  -H "Content-Type: application/json" \
  -d '{"pecas":[{"largura":100,"altura":100,"tipoCorte":"externo","id":"1"}],"metodoNesting":"greedy"}' \
  | grep "gcode" && echo "✅ PASS greedy" || echo "❌ FAIL greedy"

curl -s -X POST http://localhost:3001/api/gcode/generate \
  -H "Content-Type: application/json" \
  -d '{"pecas":[{"largura":100,"altura":100,"tipoCorte":"externo","id":"1"}],"metodoNesting":"shelf"}' \
  | grep "gcode" && echo "✅ PASS shelf" || echo "❌ FAIL shelf"

# Teste 5: Com e sem comentários
echo "\n[5/7] Sem comentários..."
curl -s -X POST http://localhost:3001/api/gcode/generate \
  -H "Content-Type: application/json" \
  -d '{"pecas":[{"largura":100,"altura":100,"tipoCorte":"externo","id":"1"}],"incluirComentarios":false}' \
  | grep "gcode" && echo "✅ PASS" || echo "❌ FAIL"

# Teste 6: Com ferramenta customizada
echo "\n[6/7] Ferramenta customizada..."
curl -s -X POST http://localhost:3001/api/gcode/generate \
  -H "Content-Type: application/json" \
  -d '{"pecas":[{"largura":100,"altura":100,"tipoCorte":"externo","id":"1"}],"configFerramenta":{"diametro":8,"numeroFerramenta":2}}' \
  | grep "gcode" && echo "✅ PASS" || echo "❌ FAIL"

# Teste 7: Validação de erro (sem peças)
echo "\n[7/7] Validação de erro..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3001/api/gcode/generate \
  -H "Content-Type: application/json" \
  -d '{}')
[ "$HTTP_CODE" = "400" ] && echo "✅ PASS (retornou 400)" || echo "❌ FAIL (esperava 400, recebeu $HTTP_CODE)"

echo "\n=== FIM DOS TESTES ==="
```

**Checklist de testes:**
- [ ] Criar `test/test-suite.sh`
- [ ] Dar permissão de execução: `chmod +x test/test-suite.sh`
- [ ] Executar: `./test/test-suite.sh`
- [ ] Todos os 7 testes passam ✅

### 4.2 Documentação da API
Criar `API_DOCS.md`:

```markdown
# API de Geração de G-Code

API REST para geração de código G (G-code) para máquinas CNC.

## Base URL
```
http://localhost:3001
```

## Endpoints

### `GET /health`
Health check da API.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### `POST /api/gcode/generate`
Gera código G-code a partir de peças e configurações.

**Request Body:**
```typescript
{
  pecas: Peca[],                          // OBRIGATÓRIO
  configChapa?: Partial<ConfiguracoesChapa>,
  configCorte?: Partial<ConfiguracoesCorte>,
  configFerramenta?: Partial<ConfiguracoesFerramenta>,
  metodoNesting?: 'greedy' | 'shelf' | 'guillotine',  // Default: guillotine
  incluirComentarios?: boolean            // Default: true
}
```

**Tipo Peca:**
```typescript
{
  largura: number,      // mm
  altura: number,       // mm
  tipoCorte: 'externo' | 'interno' | 'na-linha',
  id: string,
  nome?: string,
  ignorada?: boolean
}
```

**Response Success (200):**
```json
{
  "gcode": "G21\nG90\n...",
  "metadata": {
    "linhas": 450,
    "tamanhoBytes": 12500,
    "tempoEstimado": {
      "tempoCorte": 120.5,
      "tempoMergulho": 30.2,
      "tempoPosicionamento": 15.8,
      "tempoTotal": 166.5
    },
    "metricas": {
      "areaUtilizada": 45000,
      "eficiencia": 85.5,
      "tempo": 12.3
    },
    "configuracoes": {
      "chapa": {...},
      "corte": {...},
      "ferramenta": {...},
      "nesting": {
        "metodo": "guillotine",
        "pecasPosicionadas": 5,
        "eficiencia": 85.5
      }
    }
  }
}
```

**Response Error (400) - Peças não informadas:**
```json
{
  "error": "Parâmetro 'pecas' é obrigatório e deve ser array não vazio"
}
```

**Response Error (400) - Peças não couberam:**
```json
{
  "error": "Algumas peças não couberam na chapa",
  "naoCouberam": [
    { "id": "3", "nome": "Peça Grande", "largura": 3000, "altura": 2000 }
  ]
}
```

**Exemplo cURL:**
```bash
curl -X POST http://localhost:3001/api/gcode/generate \
  -H "Content-Type: application/json" \
  -d '{
    "pecas": [
      { "largura": 100, "altura": 200, "tipoCorte": "externo", "id": "1" }
    ]
  }'
```

**Exemplo JavaScript fetch:**
```javascript
const response = await fetch('http://localhost:3001/api/gcode/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    pecas: [
      { largura: 100, altura: 200, tipoCorte: 'externo', id: '1' }
    ],
    metodoNesting: 'shelf',
    incluirComentarios: false
  })
});

const { gcode, metadata } = await response.json();
console.log('G-code gerado:', gcode);
console.log('Tempo estimado:', metadata.tempoEstimado.tempoTotal, 'segundos');
```

## Configurações Padrão

Se não especificados, os seguintes valores são usados:

**configChapa:**
- largura: 2850mm
- altura: 1500mm
- espessura: 15mm

**configCorte:**
- profundidade: 15mm
- espacamento: 50mm
- profundidadePorPassada: 4mm
- feedrate: 1500mm/min
- plungeRate: 500mm/min
- rapidsSpeed: 4000mm/min
- spindleSpeed: 18000 RPM
- usarRampa: false
- anguloRampa: 3°
- aplicarRampaEm: 'primeira-passada'

**configFerramenta:**
- Se não informado, não aplica compensação G41/G42
```

- [ ] Criar `API_DOCS.md`
- [ ] Documentar todos endpoints
- [ ] Adicionar exemplos de uso
- [ ] Documentar defaults

### 4.3 Variáveis de ambiente
Criar `.env.example`:

```bash
# Porta do servidor
PORT=3001

# Ambiente (development, production)
NODE_ENV=development

# CORS (separe múltiplas origens por vírgula)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

- [ ] Criar `.env.example`
- [ ] Criar `.gitignore` (incluir `.env`, `node_modules/`, `dist/`)
- [ ] Documentar variáveis no README

### ✅ Checkpoint 4.1: API testada e documentada
**Teste:** Todos testes passam + documentação completa

---

## Fase 5: Integração com Frontend

**Objetivo:** Conectar frontend Next.js à API e remover processamento client-side

### 5.1 Criar cliente da API
Criar `lib/api-client.ts` no projeto **cnc-builder-web**:

```typescript
import type { Peca, ConfiguracoesChapa, ConfiguracoesCorte, ConfiguracoesFerramenta } from '@/types';
import type { MetodoNesting } from '@/lib/nesting-algorithm';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface GerarGCodeRequest {
  pecas: Peca[];
  configChapa?: Partial<ConfiguracoesChapa>;
  configCorte?: Partial<ConfiguracoesCorte>;
  configFerramenta?: Partial<ConfiguracoesFerramenta>;
  metodoNesting?: MetodoNesting;
  incluirComentarios?: boolean;
}

export interface GerarGCodeResponse {
  gcode: string;
  metadata: {
    linhas: number;
    tamanhoBytes: number;
    tempoEstimado: any;
    metricas: any;
    configuracoes: any;
  };
}

export class ApiClient {
  /**
   * Gera G-code via API
   */
  static async gerarGCode(request: GerarGCodeRequest): Promise<GerarGCodeResponse> {
    const response = await fetch(`${API_BASE_URL}/api/gcode/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao gerar G-code');
    }

    return response.json();
  }

  /**
   * Health check da API
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      return data.status === 'ok';
    } catch {
      return false;
    }
  }
}
```

- [ ] Criar `lib/api-client.ts`
- [ ] Adicionar variável de ambiente no `.env.local`:
  ```
  NEXT_PUBLIC_API_URL=http://localhost:3001
  ```
- [ ] Testar com `ApiClient.healthCheck()`

### 5.2 Migrar app/page.tsx para usar API
No arquivo `app/page.tsx`, fazer as seguintes mudanças:

**ANTES (client-side):**
```typescript
import { gerarGCode, calcularTempoEstimado } from "@/lib/gcode-generator";

// ...

const gcode = gerarGCode(pecasPosicionadas, configChapa, configCorte, configFerramenta, versaoGerador, incluirComentarios);
```

**DEPOIS (via API):**
```typescript
import { ApiClient } from "@/lib/api-client";

// ...

// Remover estado de gcodeGerado (vem da API agora)
const [carregando, setCarregando] = useState(false);
const [erro, setErro] = useState<string | null>(null);

// Handler modificado
const handleVisualizarGCode = async () => {
  try {
    setCarregando(true);
    setErro(null);

    // Gera via API
    const response = await ApiClient.gerarGCode({
      pecas,
      configChapa,
      configCorte,
      configFerramenta,
      metodoNesting,
      incluirComentarios
    });

    setGcodeGerado(response.gcode);
    setTempoEstimado(response.metadata.tempoEstimado);
    setMetricas(response.metadata.metricas);
    setVisualizadorAberto(true);

  } catch (error: any) {
    setErro(error.message);
    console.error('Erro ao gerar G-code:', error);
  } finally {
    setCarregando(false);
  }
};
```

**Mudanças necessárias:**
- [ ] Importar `ApiClient`
- [ ] Adicionar estados `carregando` e `erro`
- [ ] Modificar `handleVisualizarGCode` para async
- [ ] Adicionar loading state no botão "Visualizar G-code"
- [ ] Adicionar mensagem de erro na UI se falhar

### 5.3 Remover lógica client-side (APÓS testar integração)
**IMPORTANTE:** Só fazer isso DEPOIS que API estiver 100% funcional!

- [ ] Remover `lib/gcode-generator.ts`
- [ ] Remover `lib/gcode-generator-v2.ts`
- [ ] Remover `lib/nesting-algorithm.ts`
- [ ] Remover `lib/validator.ts` e `lib/validation-rules.ts`
- [ ] Limpar imports não usados
- [ ] Testar build: `npm run build`

### 5.4 Testes de integração
- [ ] Servidor API rodando: `cd ../cnc-builder-api && npm run dev`
- [ ] Frontend rodando: `npm run dev`
- [ ] Testar adição de peças
- [ ] Testar mudança de configurações
- [ ] Testar geração de G-code
- [ ] Testar visualização
- [ ] Testar download de arquivo
- [ ] Verificar que não há erros no console

### ✅ Checkpoint 5.1: Frontend integrado
**Teste:** Conseguir gerar G-code pelo frontend usando a API

---

## Fase 6: Deploy e Produção

**Objetivo:** Colocar API em produção e conectar frontend

### 6.1 Preparar API para produção
Adicionar melhorias de segurança e performance:

```bash
cd cnc-builder-api
npm install helmet compression express-rate-limit
```

Atualizar `src/server.ts`:

```typescript
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

// Segurança
app.use(helmet());

// Compressão de responses
app.use(compression());

// Rate limiting (100 requests por 15 minutos)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Muitas requisições deste IP, tente novamente em 15 minutos'
});
app.use('/api/', limiter);
```

- [ ] Instalar dependências de produção
- [ ] Adicionar helmet, compression, rate-limit
- [ ] Testar localmente
- [ ] Criar script de build: `npm run build`

### 6.2 Deploy da API (Render.com - Recomendado)
**Por que Render?** Gratuito, fácil, suporta TypeScript nativamente.

**Passo a passo:**

1. Criar `render.yaml` na raiz do projeto API:
```yaml
services:
  - type: web
    name: cnc-builder-api
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001
```

2. Fazer push para GitHub (se ainda não fez):
```bash
cd cnc-builder-api
git init
git add .
git commit -m "Initial API setup"
git remote add origin <seu-repo-url>
git push -u origin main
```

3. Deploy no Render:
   - Ir para https://render.com
   - Criar conta / login
   - New > Web Service
   - Conectar repositório GitHub
   - Selecionar branch `main`
   - Render detecta automaticamente o `render.yaml`
   - Deploy!

- [ ] Criar `render.yaml`
- [ ] Push para GitHub
- [ ] Deploy no Render
- [ ] Anotar URL da API (ex: `https://cnc-builder-api.onrender.com`)
- [ ] Testar health check: `curl https://sua-api.onrender.com/health`

### 6.3 Configurar frontend para produção
Atualizar `.env.local` e `.env.production`:

```bash
# .env.local (desenvolvimento)
NEXT_PUBLIC_API_URL=http://localhost:3001

# .env.production (produção - criar este arquivo)
NEXT_PUBLIC_API_URL=https://sua-api.onrender.com
```

- [ ] Criar `.env.production`
- [ ] Adicionar URL da API em produção
- [ ] Testar build local: `npm run build && npm start`
- [ ] Verificar que chama API correta

### 6.4 Deploy do frontend (Vercel - Recomendado)
**Por que Vercel?** Criadores do Next.js, deploy mais otimizado.

**Passo a passo:**

1. Push frontend para GitHub (se ainda não fez)
```bash
cd cnc-builder-web
git add .
git commit -m "Update to use API"
git push
```

2. Deploy na Vercel:
   - Ir para https://vercel.com
   - Login com GitHub
   - Import Project
   - Selecionar repositório `cnc-builder-web`
   - Adicionar variável de ambiente:
     - `NEXT_PUBLIC_API_URL` = `https://sua-api.onrender.com`
   - Deploy!

- [ ] Push para GitHub
- [ ] Deploy na Vercel
- [ ] Adicionar variável `NEXT_PUBLIC_API_URL`
- [ ] Anotar URL do frontend (ex: `https://cnc-builder.vercel.app`)
- [ ] Testar app em produção

### 6.5 Configurar CORS na API para produção
Atualizar `src/server.ts` com CORS específico:

```typescript
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'https://cnc-builder.vercel.app' // Seu domínio do frontend
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
```

- [ ] Atualizar CORS
- [ ] Adicionar variável `ALLOWED_ORIGINS` no Render
- [ ] Redeploy API
- [ ] Testar integração frontend + backend em produção

### ✅ Checkpoint 6.1: Em produção!
**Teste:** App funcionando 100% em produção via URL pública

---

## Melhorias Futuras (Opcional)

Após a migração básica estar completa, considerar:

### Segurança
- [ ] Implementar API keys para autenticação
- [ ] Adicionar HTTPS obrigatório
- [ ] Implementar logs de auditoria

### Performance
- [ ] Adicionar cache Redis para G-codes repetidos
- [ ] Implementar fila de jobs para geração assíncrona (BullMQ)
- [ ] Monitoramento com Prometheus/Grafana

### Novos Recursos
- [ ] Endpoint `/api/validate` - validar sem gerar
- [ ] Endpoint `/api/preview` - prévia de nesting sem G-code
- [ ] Suporte a outros formatos de saída (DXF, SVG)
- [ ] Histórico de G-codes gerados (com banco de dados)

---

## Checklist Final

### API
- [ ] Código compilando sem erros
- [ ] Testes manuais passando
- [ ] Documentação completa (`API_DOCS.md`)
- [ ] Deploy em produção (Render)
- [ ] Health check acessível
- [ ] CORS configurado

### Frontend
- [ ] Cliente API implementado (`lib/api-client.ts`)
- [ ] Integração testada localmente
- [ ] Loading states implementados
- [ ] Tratamento de erros na UI
- [ ] Lógica client-side removida
- [ ] Deploy em produção (Vercel)

### Integração
- [ ] Frontend consegue chamar API em dev
- [ ] Frontend consegue chamar API em prod
- [ ] Sem erros CORS
- [ ] Geração de G-code funcionando end-to-end
- [ ] Download de arquivos funcionando

---

## Resumo da Arquitetura Final

```
┌─────────────────────────────────────────┐
│   Frontend (Next.js)                    │
│   - Vercel                               │
│   - React + TypeScript                  │
│   - UI/UX apenas                        │
│   - LocalStorage para preferências      │
└──────────────┬──────────────────────────┘
               │ HTTP/JSON
               │ POST /api/gcode/generate
               ▼
┌─────────────────────────────────────────┐
│   Backend API (Node.js + Express)       │
│   - Render.com                          │
│   - TypeScript                          │
│   - Gerador V2                          │
│   - 3 algoritmos de nesting             │
│   - Validações                          │
│   - Defaults inteligentes               │
└─────────────────────────────────────────┘
```

**Benefícios alcançados:**
✅ Separação clara de responsabilidades
✅ Frontend leve e rápido
✅ Backend reutilizável (pode ser usado por outros clientes)
✅ Escalável (pode adicionar cache, fila, etc)
✅ Manutenção facilitada (mudanças na lógica não afetam UI)

---

**Stack Tecnológico Final:**
- **Backend:** Node.js 18+, Express 4, TypeScript 5
- **Frontend:** Next.js 15, React 19, TypeScript 5
- **Deploy:** Render.com (API) + Vercel (Frontend)
- **Segurança:** Helmet, CORS, Rate Limiting

---

**Data de início:** _____/_____/_____
**Data de conclusão:** _____/_____/_____

**Próximos passos após conclusão:**
1. Monitorar logs da API por 1 semana
2. Coletar feedback de uso
3. Planejar melhorias de performance se necessário
