"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

type ComandoGCode = {
  codigo: string;
  nome: string;
  descricao: string;
  exemplo: string;
  usoReal: string;
};

const COMANDOS_G: ComandoGCode[] = [
  {
    codigo: "G0",
    nome: "Movimento Rápido",
    descricao: "Move a ferramenta rapidamente para uma posição sem cortar. Usado para posicionamento entre peças ou ir para posição inicial.",
    exemplo: "G0 X10 Y20 Z5",
    usoReal: "Quando terminar de cortar uma peça e precisa ir para outra posição sem cortar no caminho. Exemplo: após cortar um retângulo em X0 Y0, usar G0 para ir rápido até X100 Y100 onde está a próxima peça."
  },
  {
    codigo: "G1",
    nome: "Movimento Linear com Corte",
    descricao: "Move a ferramenta em linha reta COM velocidade controlada (feedrate). É o comando principal de corte.",
    exemplo: "G1 X50 Y30 F1500",
    usoReal: "TODO corte em linha reta. Exemplo: cortar lado de um retângulo de X0 Y0 até X100 Y0 com velocidade de 1500mm/min."
  },
  {
    codigo: "G2",
    nome: "Arco Horário (CW)",
    descricao: "Corta um arco no sentido horário. I e J definem o centro do arco em relação ao ponto atual.",
    exemplo: "G2 X20 Y20 I10 J0 F1000",
    usoReal: "Fazer cantos arredondados ou círculos. Exemplo: ao invés de canto reto de 90°, fazer um raio de 5mm. Peças com design orgânico ou furos circulares."
  },
  {
    codigo: "G3",
    nome: "Arco Anti-horário (CCW)",
    descricao: "Corta um arco no sentido anti-horário. Igual G2 mas na direção oposta.",
    exemplo: "G3 X20 Y20 I0 J10 F1000",
    usoReal: "Mesma aplicação que G2, mas direção oposta. Usar conforme o sentido que você quer que a fresa siga ao redor do arco."
  },
  {
    codigo: "G4",
    nome: "Pausa (Dwell)",
    descricao: "Para o movimento por um tempo. Útil para dar tempo do spindle atingir velocidade ou limpar rebarbas.",
    exemplo: "G4 P2.0",
    usoReal: "Após ligar o spindle (M3), fazer G4 P2 para esperar 2 segundos até ele atingir velocidade completa antes de começar a cortar."
  },
  {
    codigo: "G17",
    nome: "Plano XY (Padrão)",
    descricao: "Define que arcos (G2/G3) serão calculados no plano XY (horizontal). É o padrão para CNC router 2.5D.",
    exemplo: "G17",
    usoReal: "Colocar no início do programa para garantir que todos os arcos sejam horizontais. Padrão para corte de chapas planas."
  },
  {
    codigo: "G20",
    nome: "Unidades em Polegadas",
    descricao: "Define que todas as coordenadas estão em polegadas.",
    exemplo: "G20",
    usoReal: "Quando seu projeto CAD está em polegadas. CUIDADO: se usar G21 (mm) e depois G20, todas as coordenadas mudam de escala!"
  },
  {
    codigo: "G21",
    nome: "Unidades em Milímetros",
    descricao: "Define que todas as coordenadas estão em milímetros. SEMPRE usar no início do programa.",
    exemplo: "G21",
    usoReal: "PRIMEIRA linha do seu G-code (depois dos comentários). Garante que X100 significa 100mm e não 100 polegadas."
  },
  {
    codigo: "G28",
    nome: "Ir para Home",
    descricao: "Move todos os eixos para a posição inicial (home) definida na máquina.",
    exemplo: "G28",
    usoReal: "No final do programa, após M5 (desligar spindle), usar G28 para voltar a máquina para posição de repouso/troca de material."
  },
  {
    codigo: "G40",
    nome: "Cancelar Compensação",
    descricao: "Desliga G41/G42. SEMPRE usar após terminar cada peça que usou compensação.",
    exemplo: "G40",
    usoReal: "Após cortar uma peça com G41 (externo), OBRIGATÓRIO usar G40 antes da próxima peça. Senão a próxima peça sai com offset errado!"
  },
  {
    codigo: "G41",
    nome: "Compensação ESQUERDA",
    descricao: "Fresa fica à ESQUERDA do caminho. Use para cortes EXTERNOS - quando quer que a PEÇA fique do lado direito.",
    exemplo: "G41 D1",
    usoReal: "Cortar contorno EXTERNO de peças retangulares. Você programa o retângulo de 100x50mm e a máquina automaticamente compensa o diâmetro da fresa (ex: 6mm) para a peça sair exata."
  },
  {
    codigo: "G42",
    nome: "Compensação DIREITA",
    descricao: "Fresa fica à DIREITA do caminho. Use para cortes INTERNOS - quando quer fazer um FURO.",
    exemplo: "G42 D1",
    usoReal: "Fazer um furo retangular ou buraco. Programa um retângulo de 50x30mm e a máquina compensa para DENTRO, fazendo o furo do tamanho certo."
  },
  {
    codigo: "G54",
    nome: "Sistema de Coordenadas 1",
    descricao: "Ativa o sistema de coordenadas de trabalho #1. Permite ter várias origens salvas.",
    exemplo: "G54",
    usoReal: "Quando você tem 4 chapas fixadas na mesa em posições diferentes. G54 para chapa 1, G55 para chapa 2, etc. Cada uma tem sua origem própria."
  },
  {
    codigo: "G90",
    nome: "Coordenadas ABSOLUTAS",
    descricao: "Todas as coordenadas são relativas à ORIGEM (0,0,0). SEMPRE usar esse modo.",
    exemplo: "G90",
    usoReal: "SEGUNDA linha do programa (depois de G21). Com G90, se você manda X100, vai para posição 100mm da origem. Previsível e seguro."
  },
  {
    codigo: "G91",
    nome: "Coordenadas INCREMENTAIS",
    descricao: "Coordenadas são relativas à posição ATUAL. Perigoso para iniciantes.",
    exemplo: "G91",
    usoReal: "Raramente usado. Exemplo: fazer um padrão repetitivo - corta, move +10mm, corta, move +10mm. Mas melhor calcular absoluto."
  },
];

const COMANDOS_M: ComandoGCode[] = [
  {
    codigo: "M0",
    nome: "Parada OBRIGATÓRIA",
    descricao: "Para completamente o programa. Só continua quando operador apertar START de novo.",
    exemplo: "M0",
    usoReal: "Trocar ferramenta manualmente, ou verificar medida no meio do corte, ou aspirar cavacos acumulados antes de continuar."
  },
  {
    codigo: "M2",
    nome: "Fim do Programa (Antigo)",
    descricao: "Finaliza o programa. Versão antiga, hoje se usa M30.",
    exemplo: "M2",
    usoReal: "Máquinas antigas. Hoje em dia prefira M30 que faz a mesma coisa + reset."
  },
  {
    codigo: "M3",
    nome: "Liga Spindle HORÁRIO",
    descricao: "Liga o motor que gira a fresa, no sentido horário (CW). OBRIGATÓRIO antes de cortar.",
    exemplo: "M3 S18000",
    usoReal: "SEMPRE antes de começar a cortar: M3 S18000 (liga spindle a 18000 RPM) + G4 P2 (espera 2s) + começa cortes. Sem isso a fresa não gira!"
  },
  {
    codigo: "M4",
    nome: "Liga Spindle ANTI-HORÁRIO",
    descricao: "Liga spindle girando ao contrário (CCW). Raramente usado.",
    exemplo: "M4 S12000",
    usoReal: "Algumas operações especiais como rosqueamento. Para corte normal sempre use M3."
  },
  {
    codigo: "M5",
    nome: "Desliga Spindle",
    descricao: "Para completamente o spindle. OBRIGATÓRIO no final.",
    exemplo: "M5",
    usoReal: "SEMPRE no final do programa, antes de M30. Sequência: termina cortes → G0 Z50 (sobe fresa) → M5 (desliga) → M30 (fim)."
  },
  {
    codigo: "M6",
    nome: "Troca de Ferramenta",
    descricao: "Executa troca de ferramenta. Precedido por T (número). Pode pausar para troca manual.",
    exemplo: "T2 M6",
    usoReal: "Você tem 3 peças: 2 usam fresa de 6mm (T1) e 1 usa de 3mm (T2). Ao chegar na terceira peça: T2 M6 (troca para fresa 2)."
  },
  {
    codigo: "M8",
    nome: "Liga Refrigeração",
    descricao: "Liga sistema de refrigeração líquida/névoa se a máquina tiver.",
    exemplo: "M8",
    usoReal: "Cortar alumínio ou acrílico que gera muito calor. Liga M8 junto com M3, desliga M9 junto com M5."
  },
  {
    codigo: "M9",
    nome: "Desliga Refrigeração",
    descricao: "Desliga refrigeração.",
    exemplo: "M9",
    usoReal: "Final do programa, após M5 e antes de M30."
  },
  {
    codigo: "M30",
    nome: "Fim do Programa + Reset",
    descricao: "Finaliza programa e retorna ao início. Versão moderna recomendada.",
    exemplo: "M30",
    usoReal: "ÚLTIMA linha de todo G-code. Desliga tudo, volta cursor para linha 1, deixa máquina pronta para próximo programa."
  },
];

const PARAMETROS: ComandoGCode[] = [
  {
    codigo: "F",
    nome: "Feedrate (Velocidade de Avanço)",
    descricao: "Velocidade que a fresa SE MOVE durante o corte em mm/min.",
    exemplo: "F1500",
    usoReal: "G1 X100 Y50 F1500 significa: vai até (100,50) cortando a 1500mm/min. MDF: 1500-2500. Alumínio: 800-1200. Acrílico: 1000-1800."
  },
  {
    codigo: "S",
    nome: "Spindle Speed (RPM)",
    descricao: "Velocidade de ROTAÇÃO da fresa em RPM.",
    exemplo: "S18000",
    usoReal: "M3 S18000 = liga fresa girando a 18000 RPM. MDF: 16000-20000. Alumínio: 12000-16000 (mais devagar para não quebrar fresa)."
  },
  {
    codigo: "T",
    nome: "Tool Number (Número da Ferramenta)",
    descricao: "Qual fresa usar (1-99). Cada número tem diâmetro/tipo diferente.",
    exemplo: "T1",
    usoReal: "T1 M6 = troca para fresa #1 (ex: 6mm reta). T2 M6 = troca para fresa #2 (ex: 3mm reta). Você define na máquina qual é qual."
  },
  {
    codigo: "D",
    nome: "Tool Diameter Offset",
    descricao: "Número do offset de diâmetro. Usado com G41/G42 para dizer quanto compensar.",
    exemplo: "D1",
    usoReal: "G41 D1 = usa offset D1 (ex: você configurou D1 = 6mm). A máquina afasta 3mm (raio) do caminho automaticamente."
  },
  {
    codigo: "P",
    nome: "Pausa (segundos)",
    descricao: "Tempo de espera em segundos (usado com G4).",
    exemplo: "P2.5",
    usoReal: "G4 P2.5 = espera 2.5 segundos parado. Usar após M3 para spindle acelerar, ou após corte para limpar rebarbas."
  },
  {
    codigo: "X",
    nome: "Coordenada Eixo X (Largura)",
    descricao: "Posição no eixo X (esquerda-direita) em mm ou polegadas.",
    exemplo: "X100.5",
    usoReal: "G0 X100.5 = vai para posição X=100.5mm. Se G90 (absoluto), vai para 100.5mm da origem. Se G91 (incremental), move +100.5mm da posição atual."
  },
  {
    codigo: "Y",
    nome: "Coordenada Eixo Y (Profundidade)",
    descricao: "Posição no eixo Y (frente-trás) em mm ou polegadas.",
    exemplo: "Y50.25",
    usoReal: "G1 Y50.25 F1500 = corta até Y=50.25mm com velocidade 1500mm/min."
  },
  {
    codigo: "Z",
    nome: "Coordenada Eixo Z (Altura)",
    descricao: "Posição no eixo Z (cima-baixo). Negativo = desce/corta, positivo = sobe.",
    exemplo: "Z-5.0",
    usoReal: "G1 Z-5.0 F300 = desce fresa até -5mm de profundidade com plunge rate 300mm/min. Z5 = sobe para 5mm (segurança)."
  },
  {
    codigo: "I",
    nome: "Offset X do Centro do Arco",
    descricao: "Distância INCREMENTAL do ponto atual até o centro do arco no eixo X.",
    exemplo: "I10.0",
    usoReal: "G2 X30 Y20 I10 J0 = corta arco até (30,20) com centro 10mm à direita (+X) do ponto inicial. Raio = sqrt(I²+J²)."
  },
  {
    codigo: "J",
    nome: "Offset Y do Centro do Arco",
    descricao: "Distância INCREMENTAL do ponto atual até o centro do arco no eixo Y.",
    exemplo: "J10.0",
    usoReal: "G3 X20 Y30 I0 J10 = arco anti-horário até (20,30) com centro 10mm para frente (+Y) do ponto inicial."
  },
  {
    codigo: "R",
    nome: "Raio do Arco",
    descricao: "Alternativa a I/J. Define o raio do arco diretamente.",
    exemplo: "R15.5",
    usoReal: "G2 X30 Y30 R15.5 = arco horário até (30,30) com raio de 15.5mm. Mais simples que I/J quando você sabe o raio."
  },
];

export function DicionarioGCode() {
  const [aberto, setAberto] = useState(false);

  if (!aberto) {
    return (
      <Button
        onClick={() => setAberto(true)}
        variant="outline"
        size="sm"
        className="gap-2 h-8 sm:h-9 text-xs sm:text-sm border-amber-600/50 hover:bg-amber-600/10 hover:border-amber-600"
      >
        <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span className="hidden sm:inline">Dicionário G-code</span>
        <span className="sm:hidden">G-code</span>
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#1a1814] overflow-hidden flex flex-col">
      {/* Header fixo */}
      <div className="border-b border-amber-600/30 bg-[#292318] px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-amber-500">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
              Dicionário Completo de G-code
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Referência detalhada com exemplos práticos de todos os comandos
            </p>
          </div>
          <Button
            onClick={() => setAberto(false)}
            variant="ghost"
            size="icon"
            className="flex-shrink-0 hover:bg-red-600/20 hover:text-red-500"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Conteúdo scrollável */}
      <ScrollArea className="flex-1">
        <div className="px-4 sm:px-6 py-4 sm:py-6 max-w-6xl mx-auto">
          <div className="space-y-8">
            {/* Comandos G */}
            <section>
              <div className="bg-amber-600/10 border border-amber-600/30 rounded-lg p-3 mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-amber-500">Comandos G - Movimento e Controle</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Comandos que controlam COMO a máquina se move e corta
                </p>
              </div>
              <div className="grid gap-4">
                {COMANDOS_G.map((cmd) => (
                  <div key={cmd.codigo} className="bg-secondary/40 border border-border rounded-lg p-4 hover:border-amber-600/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <code className="font-mono font-bold text-amber-400 text-base sm:text-lg bg-black/60 px-3 py-2 rounded-md min-w-[70px] text-center flex-shrink-0">
                        {cmd.codigo}
                      </code>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="font-bold text-base sm:text-lg">{cmd.nome}</div>
                        <div className="text-sm text-muted-foreground leading-relaxed">{cmd.descricao}</div>
                        <div className="bg-black/40 rounded p-2 sm:p-3 space-y-1.5">
                          <div className="text-xs text-muted-foreground">Exemplo:</div>
                          <code className="text-sm text-green-400 font-mono block">{cmd.exemplo}</code>
                        </div>
                        <div className="bg-blue-950/30 border border-blue-600/20 rounded p-2 sm:p-3 space-y-1">
                          <div className="text-xs font-semibold text-blue-400">💡 Quando usar na prática:</div>
                          <div className="text-xs sm:text-sm text-blue-200/90 leading-relaxed">{cmd.usoReal}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Comandos M */}
            <section>
              <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-3 mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-blue-400">Comandos M - Funções da Máquina</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Comandos que controlam spindle, refrigeração e ciclo do programa
                </p>
              </div>
              <div className="grid gap-4">
                {COMANDOS_M.map((cmd) => (
                  <div key={cmd.codigo} className="bg-secondary/40 border border-border rounded-lg p-4 hover:border-blue-600/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <code className="font-mono font-bold text-blue-400 text-base sm:text-lg bg-black/60 px-3 py-2 rounded-md min-w-[70px] text-center flex-shrink-0">
                        {cmd.codigo}
                      </code>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="font-bold text-base sm:text-lg">{cmd.nome}</div>
                        <div className="text-sm text-muted-foreground leading-relaxed">{cmd.descricao}</div>
                        <div className="bg-black/40 rounded p-2 sm:p-3 space-y-1.5">
                          <div className="text-xs text-muted-foreground">Exemplo:</div>
                          <code className="text-sm text-green-400 font-mono block">{cmd.exemplo}</code>
                        </div>
                        <div className="bg-blue-950/30 border border-blue-600/20 rounded p-2 sm:p-3 space-y-1">
                          <div className="text-xs font-semibold text-blue-400">💡 Quando usar na prática:</div>
                          <div className="text-xs sm:text-sm text-blue-200/90 leading-relaxed">{cmd.usoReal}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Parâmetros */}
            <section>
              <div className="bg-green-600/10 border border-green-600/30 rounded-lg p-3 mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-green-400">Parâmetros - Eixos e Valores</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Letras que acompanham os comandos G e M com valores numéricos
                </p>
              </div>
              <div className="grid gap-4">
                {PARAMETROS.map((param) => (
                  <div key={param.codigo} className="bg-secondary/40 border border-border rounded-lg p-4 hover:border-green-600/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <code className="font-mono font-bold text-green-400 text-base sm:text-lg bg-black/60 px-3 py-2 rounded-md min-w-[70px] text-center flex-shrink-0">
                        {param.codigo}
                      </code>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="font-bold text-base sm:text-lg">{param.nome}</div>
                        <div className="text-sm text-muted-foreground leading-relaxed">{param.descricao}</div>
                        <div className="bg-black/40 rounded p-2 sm:p-3 space-y-1.5">
                          <div className="text-xs text-muted-foreground">Exemplo:</div>
                          <code className="text-sm text-green-400 font-mono block">{param.exemplo}</code>
                        </div>
                        <div className="bg-blue-950/30 border border-blue-600/20 rounded p-2 sm:p-3 space-y-1">
                          <div className="text-xs font-semibold text-blue-400">💡 Quando usar na prática:</div>
                          <div className="text-xs sm:text-sm text-blue-200/90 leading-relaxed">{param.usoReal}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Exemplo completo */}
            <section className="bg-amber-900/20 border-2 border-amber-600/40 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-amber-500 mb-3 sm:mb-4">📋 Exemplo de G-code Completo</h3>
              <div className="bg-black/60 rounded-lg p-3 sm:p-4 space-y-1 font-mono text-xs sm:text-sm overflow-x-auto">
                <div className="text-gray-400">; Programa para cortar retângulo 100x50mm em MDF 15mm</div>
                <div className="text-green-400">G21</div> <span className="text-gray-500">; Milímetros</span><br/>
                <div className="text-green-400">G90</div> <span className="text-gray-500">; Coordenadas absolutas</span><br/>
                <div className="text-green-400">G0 Z5</div> <span className="text-gray-500">; Sobe fresa para segurança</span><br/>
                <div className="text-blue-400">T1 M6</div> <span className="text-gray-500">; Troca para fresa T1 (6mm)</span><br/>
                <div className="text-blue-400">M3 S18000</div> <span className="text-gray-500">; Liga spindle a 18000 RPM</span><br/>
                <div className="text-green-400">G4 P2</div> <span className="text-gray-500">; Espera 2 segundos</span><br/>
                <div className="text-green-400">G0 X0 Y0</div> <span className="text-gray-500">; Vai rápido para início</span><br/>
                <div className="text-green-400">G41 D1</div> <span className="text-gray-500">; Ativa compensação esquerda (externo)</span><br/>
                <div className="text-green-400">G1 Z-5 F300</div> <span className="text-gray-500">; Desce 5mm com plunge rate 300</span><br/>
                <div className="text-green-400">G1 X100 Y0 F1500</div> <span className="text-gray-500">; Corta lado inferior</span><br/>
                <div className="text-green-400">G1 X100 Y50 F1500</div> <span className="text-gray-500">; Corta lado direito</span><br/>
                <div className="text-green-400">G1 X0 Y50 F1500</div> <span className="text-gray-500">; Corta lado superior</span><br/>
                <div className="text-green-400">G1 X0 Y0 F1500</div> <span className="text-gray-500">; Corta lado esquerdo</span><br/>
                <div className="text-green-400">G1 Z5 F300</div> <span className="text-gray-500">; Sobe fresa</span><br/>
                <div className="text-green-400">G40</div> <span className="text-gray-500">; Cancela compensação</span><br/>
                <div className="text-blue-400">M5</div> <span className="text-gray-500">; Desliga spindle</span><br/>
                <div className="text-green-400">G28</div> <span className="text-gray-500">; Volta para home</span><br/>
                <div className="text-blue-400">M30</div> <span className="text-gray-500">; Fim do programa</span>
              </div>
            </section>

            {/* Dicas finais */}
            <section className="bg-red-900/20 border border-red-600/30 rounded-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-red-400 mb-3">⚠️ Erros Comuns para EVITAR</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">✗</span> <span>Esquecer G21 no início → máquina pode interpretar como polegadas</span></li>
                <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">✗</span> <span>Usar G41 e esquecer G40 depois → próxima peça sai com offset errado</span></li>
                <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">✗</span> <span>M3 sem G4 depois → começa a cortar com spindle ainda acelerando</span></li>
                <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">✗</span> <span>Descer Z muito rápido (usar feedrate ao invés de plunge rate)</span></li>
                <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">✗</span> <span>Confundir G41 com G42 → fresa corta no lado errado</span></li>
                <li className="flex gap-2"><span className="text-red-400 flex-shrink-0">✗</span> <span>Esquecer M5 no final → spindle fica ligado queimando!</span></li>
              </ul>
            </section>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
