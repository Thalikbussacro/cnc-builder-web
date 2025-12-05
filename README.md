# CNC Builder Web

Aplicação web para geração de código G-code para fresadoras CNC com algoritmo de nesting automático.

## Descrição

Este sistema permite a configuração de chapas, cadastro de peças retangulares e geração automática de código G-code otimizado para máquinas CNC. Inclui preview visual 2D, validação em tempo real e suporte a múltiplos formatos de arquivo (.tap, .nc, .gcode, .cnc).

## Requisitos

- Node.js 18.x ou superior
- npm 9.x ou superior

## Instalação

```bash
npm install
```

## Executar

### Desenvolvimento

```bash
npm run dev
```

Acesse `http://localhost:3000`

### Produção

```bash
npm run build
npm run start
```

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

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript 5
- **Estilização**: Tailwind CSS 3, shadcn/ui
- **Estado**: Zustand 5
- **Validação**: Zod
- **Canvas**: API nativa do navegador
- **Build**: Turbopack

## Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run start` - Servidor de produção
- `npm run lint` - Linter (ESLint)

## Algoritmo de Nesting

O sistema utiliza uma estratégia greedy de bin packing 2D:

1. Ordenação de peças por área (decrescente)
2. Manutenção de lista de pontos candidatos
3. Posicionamento iterativo com validação de colisões
4. Geração de novos candidatos após cada posicionamento

## Integração com API

A aplicação se comunica com uma API externa para geração de G-code. Configure a URL da API através da variável de ambiente:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
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
