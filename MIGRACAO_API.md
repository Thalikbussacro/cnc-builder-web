# Migração: G-Code Generator para API REST Standalone

**Objetivo:** Extrair toda a lógica de geração de G-code para uma API REST independente usando Node.js + Express, mantendo o frontend Next.js como cliente.

---

## Fase 1: Configuração do Projeto API

### 1.1 Criar estrutura base do projeto API
- [ ] Criar diretório `cnc-builder-api/` fora do projeto web
- [ ] Inicializar projeto Node.js (`npm init`)
- [ ] Configurar TypeScript (`tsconfig.json`)
- [ ] Instalar dependências base:
  - `express`
  - `typescript`
  - `@types/node`
  - `@types/express`
  - `ts-node-dev` (para desenvolvimento)
  - `cors`
  - `@types/cors`

### 1.2 Configurar estrutura de pastas
- [ ] Criar estrutura:
  ```
  cnc-builder-api/
  ├── src/
  │   ├── routes/
  │   ├── services/
  │   ├── types/
  │   ├── utils/
  │   └── server.ts
  ├── package.json
  ├── tsconfig.json
  └── .env.example
  ```

### 1.3 Configurar scripts do package.json
- [ ] Adicionar script `dev` (ts-node-dev)
- [ ] Adicionar script `build` (tsc)
- [ ] Adicionar script `start` (node dist/server.js)

---

## Fase 2: Migração da Lógica de Negócio

### 2.1 Copiar e adaptar tipos TypeScript
- [ ] Copiar `types/index.ts` do projeto web para `src/types/`
- [ ] Verificar se todos os tipos necessários estão presentes
- [ ] Ajustar imports se necessário

### 2.2 Migrar utilitários de G-code
- [ ] Copiar `lib/gcode-generator.ts` para `src/services/gcode-generator.ts`
- [ ] Copiar `lib/gcode-generator-v2.ts` para `src/services/gcode-generator-v2.ts`
- [ ] Ajustar imports dos tipos
- [ ] Verificar se todas as funções funcionam standalone (sem dependências de browser)

### 2.3 Criar serviço de geração
- [ ] Criar `src/services/GCodeService.ts`
- [ ] Implementar método `generate()` que chama as funções de geração
- [ ] Implementar validação de parâmetros de entrada
- [ ] Implementar tratamento de erros específico

---

## Fase 3: Implementação da API REST

### 3.1 Configurar servidor Express
- [ ] Criar `src/server.ts`
- [ ] Configurar Express básico
- [ ] Configurar CORS
- [ ] Configurar middleware de JSON parsing
- [ ] Configurar tratamento global de erros
- [ ] Configurar porta e variáveis de ambiente

### 3.2 Criar endpoints REST
- [ ] Criar `src/routes/gcode.routes.ts`
- [ ] Implementar `POST /api/gcode/generate`
  - Recebe: `{ pecasPos, config, corte, ferramenta?, versao?, incluirComentarios? }`
  - Retorna: `{ gcode: string, metadata: {...} }`
- [ ] Implementar `GET /api/health` (health check)
- [ ] Implementar `GET /api/versoes` (listar versões disponíveis do gerador)

### 3.3 Implementar validação de entrada
- [ ] Instalar `zod` para validação
- [ ] Criar schemas de validação para todos os parâmetros
- [ ] Adicionar middleware de validação nas rotas
- [ ] Retornar erros 400 com mensagens descritivas

---

## Fase 4: Testes e Documentação

### 4.1 Testes básicos
- [ ] Instalar ferramenta de testes HTTP (Postman/Insomnia/REST Client)
- [ ] Testar endpoint `/api/gcode/generate` com dados válidos
- [ ] Testar validação de entrada (dados inválidos)
- [ ] Testar diferentes versões do gerador (v1, v2)
- [ ] Testar com e sem comentários
- [ ] Testar com e sem ferramenta

### 4.2 Documentação da API
- [ ] Criar `API_DOCS.md` no projeto da API
- [ ] Documentar endpoint `POST /api/gcode/generate`
  - Parâmetros de entrada
  - Exemplos de request
  - Exemplos de response
  - Códigos de erro possíveis
- [ ] Documentar endpoint `GET /api/versoes`
- [ ] Adicionar exemplos de uso com `curl` e JavaScript `fetch`

### 4.3 Criar arquivo de ambiente
- [ ] Criar `.env.example` com variáveis necessárias
- [ ] Documentar cada variável de ambiente
- [ ] Criar `.gitignore` apropriado

---

## Fase 5: Integração com Frontend

### 5.1 Criar cliente da API no frontend
- [ ] Criar `lib/api/gcode-client.ts` no projeto Next.js
- [ ] Implementar função `generateGCode()` que chama a API
- [ ] Implementar tratamento de erros
- [ ] Adicionar variável de ambiente `NEXT_PUBLIC_API_URL`

### 5.2 Migrar frontend para usar a API
- [ ] Identificar todos os locais que usam `gerarGCode()` diretamente
- [ ] Substituir chamadas diretas por chamadas à API
- [ ] Adicionar loading states durante requisições
- [ ] Adicionar tratamento de erros na UI
- [ ] Testar fluxo completo

### 5.3 Manter fallback client-side (opcional)
- [ ] Implementar lógica de fallback se API estiver offline
- [ ] Adicionar toggle para escolher entre API e client-side
- [ ] Documentar comportamento de fallback

---

## Fase 6: Deploy e Produção

### 6.1 Preparar para deploy
- [ ] Criar `Dockerfile` para containerização (opcional)
- [ ] Configurar variáveis de ambiente de produção
- [ ] Adicionar logging (winston, pino, ou similar)
- [ ] Configurar rate limiting (express-rate-limit)
- [ ] Adicionar helmet.js para segurança

### 6.2 Deploy da API
- [ ] Escolher plataforma de hospedagem:
  - Opção A: Railway
  - Opção B: Render
  - Opção C: AWS EC2
  - Opção D: DigitalOcean
  - Opção E: Heroku
- [ ] Fazer deploy inicial
- [ ] Testar API em produção
- [ ] Configurar domínio/subdomínio (opcional)

### 6.3 Configurar CI/CD (opcional)
- [ ] Configurar GitHub Actions para testes
- [ ] Configurar deploy automático
- [ ] Configurar notificações de deploy

---

## Fase 7: Melhorias Futuras (Opcional)

### 7.1 Autenticação e autorização
- [ ] Implementar sistema de API keys
- [ ] Adicionar middleware de autenticação
- [ ] Documentar como obter e usar API key

### 7.2 Cache e performance
- [ ] Implementar cache de resultados (Redis)
- [ ] Adicionar compressão de resposta (gzip)
- [ ] Monitorar performance dos endpoints

### 7.3 Recursos adicionais
- [ ] Endpoint para validar configurações sem gerar G-code
- [ ] Endpoint para estimar tempo de processamento
- [ ] Endpoint para converter entre formatos de arquivo
- [ ] Webhook para notificar quando geração estiver pronta (para jobs longos)

---

## Checklist Final

- [ ] API rodando localmente sem erros
- [ ] Todos os endpoints testados e funcionando
- [ ] Frontend integrado e testado com a API
- [ ] Documentação completa criada
- [ ] API deployada em produção
- [ ] Frontend apontando para API de produção
- [ ] Variáveis de ambiente configuradas
- [ ] README.md atualizado com instruções de uso

---

## Notas Técnicas

### Stack Tecnológico
- **Backend:** Node.js + Express + TypeScript
- **Validação:** Zod
- **Segurança:** Helmet.js, CORS, express-rate-limit
- **Desenvolvimento:** ts-node-dev, nodemon

### Endpoints Planejados
```
GET  /api/health              - Health check
GET  /api/versoes             - Lista versões do gerador
POST /api/gcode/generate      - Gera G-code
```

### Estrutura de Response
```typescript
// Sucesso
{
  "success": true,
  "data": {
    "gcode": "G21\nG90...",
    "metadata": {
      "versao": "v2",
      "linhas": 450,
      "tamanhoKB": 12.5,
      "tempoEstimado": "15min 30s"
    }
  }
}

// Erro
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Parâmetro 'profundidade' é obrigatório",
    "details": {...}
  }
}
```

---

**Data de início:** _____/_____/_____
**Data de conclusão:** _____/_____/_____
