# Gerador de G-code CNC

Aplicação web para gerar código G-code para fresadoras CNC com algoritmo de nesting automático.

## 🚀 Funcionalidades

- ✅ Configuração de dimensões da chapa (largura, altura, espessura)
- ✅ Configuração de parâmetros de corte (profundidade, espaçamento)
- ✅ Cadastro de múltiplas peças retangulares
- ✅ Algoritmo de nesting automático (bin packing 2D)
- ✅ Preview visual 2D mostrando posicionamento das peças na chapa
- ✅ Validação em tempo real se a peça cabe na chapa
- ✅ Geração de arquivo G-code (.nc) com todas as peças posicionadas
- ✅ Download do arquivo gerado

## 🛠️ Tecnologias

- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes de UI
- **Canvas API** - Preview visual 2D

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Executar servidor de desenvolvimento
npm run dev

# Abrir navegador em http://localhost:3000
```

## 🎯 Como Usar

1. **Configure a Chapa**: Defina largura, altura e espessura da chapa de metal
2. **Configure o Corte**: Defina profundidade do corte e espaçamento entre peças
3. **Adicione Peças**: Cadastre as dimensões das peças retangulares que deseja cortar
   - A aplicação valida automaticamente se a peça cabe na chapa
   - O preview é atualizado em tempo real
4. **Visualize o Preview**: Veja como as peças foram posicionadas na chapa
5. **Gere o G-code**: Clique em "Gerar G-code" para baixar o arquivo .nc

## 📝 Formato do G-code

O arquivo gerado contém:
- Legenda explicativa dos comandos G-code
- Configuração inicial (unidades, coordenadas, spindle)
- Comandos de corte para cada peça com múltiplas passadas
- Comandos de finalização

### Exemplo de saída:

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
G1 X0.00 Y0.00 ; Corta lado esquerdo (fecha o retângulo)
G0 Z5 ; Levanta fresa após corte

...

G0 Z5 ; Levanta a fresa
M5 ; Desliga o spindle
G0 X0 Y0 ; Volta para o ponto inicial
M30 ; Fim do programa
```

## 🧮 Algoritmo de Nesting

O algoritmo utiliza uma estratégia **greedy** (gulosa):

1. Ordena peças por área (maiores primeiro)
2. Mantém lista de pontos candidatos para posicionamento
3. Para cada peça, tenta posicionar no primeiro candidato válido
4. Valida se não há colisão com peças já posicionadas
5. Gera novos candidatos (direita e abaixo da peça posicionada)

**Nota**: Este algoritmo não garante solução ótima, mas é rápido e eficiente para a maioria dos casos.

## 📁 Estrutura do Projeto

```
├── app/
│   ├── page.tsx           # Página principal com estado e integração
│   ├── layout.tsx         # Layout raiz
│   └── globals.css        # Estilos globais
├── components/
│   ├── ConfiguracoesChapa.tsx    # Inputs da chapa
│   ├── ConfiguracoesCorte.tsx    # Inputs de corte
│   ├── CadastroPeca.tsx          # Formulário de cadastro
│   ├── ListaPecas.tsx            # Lista de peças cadastradas
│   ├── PreviewCanvas.tsx         # Canvas com preview visual
│   └── ui/                       # Componentes shadcn/ui
├── lib/
│   ├── nesting-algorithm.ts      # Algoritmo de posicionamento
│   ├── gcode-generator.ts        # Geração e download de G-code
│   └── utils.ts                  # Utilitários
└── types/
    └── index.ts                  # Tipos TypeScript
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run start` - Inicia servidor de produção
- `npm run lint` - Executa linter

## 📚 Referências

- Migrado da aplicação Delphi original ([uFrmCNC2.pas](CNC%20Builder%20Delphi/uFrmCNC2.pas))
- Implementação completa documentada em [SETUP-GCODE.md](SETUP-GCODE.md)

## 🚧 Melhorias Futuras

- [ ] Rotação de peças para melhor aproveitamento
- [ ] Diferentes estratégias de nesting (escolha pelo usuário)
- [ ] Preview 3D com Three.js
- [ ] Otimização de caminho da fresa
- [ ] Suporte a formas não retangulares
- [ ] Salvar/carregar projetos (localStorage)
- [ ] Exportar/importar lista de peças (JSON)
- [ ] PWA (Progressive Web App)

## 📄 Licença

Este projeto foi desenvolvido para uso interno.

---

**Desenvolvido com Next.js 15 + TypeScript + Tailwind CSS**
