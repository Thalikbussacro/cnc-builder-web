"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, X, Search } from "lucide-react";
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
  const [busca, setBusca] = useState("");

  // Fecha com ESC e bloqueia scroll
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAberto(false);
      }
    };

    if (aberto) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [aberto]);

  // Filtrar comandos com base na busca
  const comandosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    if (!termo) {
      return {
        comandosG: COMANDOS_G,
        comandosM: COMANDOS_M,
        parametros: PARAMETROS,
      };
    }

    const filtrar = (comandos: ComandoGCode[]) =>
      comandos.filter((cmd) => {
        const codigoMatch = cmd.codigo.toLowerCase().includes(termo);
        const nomeMatch = cmd.nome.toLowerCase().includes(termo);
        return codigoMatch || nomeMatch;
      });

    return {
      comandosG: filtrar(COMANDOS_G),
      comandosM: filtrar(COMANDOS_M),
      parametros: filtrar(PARAMETROS),
    };
  }, [busca]);

  const totalResultados =
    comandosFiltrados.comandosG.length +
    comandosFiltrados.comandosM.length +
    comandosFiltrados.parametros.length;

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
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity"
        onClick={() => setAberto(false)}
      />

      {/* Painel Lateral Deslizante */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-1/2 bg-background border-l-2 border-amber-600/20 z-[100] shadow-2xl transform transition-transform duration-300 ease-in-out ${
          aberto ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header Fixo */}
          <div className="border-b-2 border-amber-600/30 bg-amber-950/10 dark:bg-amber-950/30 px-4 py-3 flex-shrink-0">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-amber-500">
                  <BookOpen className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">Dicionário G-code</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Referência completa com exemplos práticos
                </p>
              </div>
              <Button
                onClick={() => setAberto(false)}
                variant="ghost"
                size="icon"
                className="flex-shrink-0 h-8 w-8 hover:bg-red-600/20 hover:text-red-500"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Campo de Pesquisa */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Pesquisar comandos... (ex: G0, movimento, feedrate)"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9 h-9 bg-background/50 border-border focus:border-amber-600/50"
              />
            </div>

            {/* Contador de resultados */}
            {busca && (
              <p className="text-xs text-muted-foreground mt-2">
                {totalResultados === 0
                  ? "Nenhum resultado encontrado"
                  : `${totalResultados} resultado${totalResultados !== 1 ? "s" : ""} encontrado${totalResultados !== 1 ? "s" : ""}`}
              </p>
            )}
          </div>

          {/* Conteúdo Scrollável */}
          <ScrollArea className="flex-1">
            <div className="px-4 py-4 space-y-6">
              {/* Comandos G */}
              {comandosFiltrados.comandosG.length > 0 && (
                <section>
                  <div className="bg-amber-600/10 border border-amber-600/30 rounded-md p-2 mb-3">
                    <h3 className="text-sm font-bold text-amber-500">Comandos G - Movimento e Controle</h3>
                  </div>
                  <div className="space-y-2">
                    {comandosFiltrados.comandosG.map((cmd) => (
                      <div key={cmd.codigo} className="bg-amber-50/50 dark:bg-secondary/40 border-2 border-amber-200/50 dark:border-border rounded-lg p-3 hover:border-amber-500/60 dark:hover:border-amber-600/50 transition-colors">
                        <div className="flex items-start gap-3">
                          <code className="font-mono font-bold text-amber-700 dark:text-amber-400 text-sm bg-amber-100 dark:bg-black/60 px-2 py-1 rounded min-w-[50px] text-center flex-shrink-0">
                            {cmd.codigo}
                          </code>
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="font-bold text-sm text-foreground">{cmd.nome}</div>
                            <div className="text-xs text-muted-foreground leading-relaxed">{cmd.descricao}</div>
                            <div className="bg-amber-100/50 dark:bg-black/40 rounded p-2 space-y-1">
                              <div className="text-[10px] text-muted-foreground font-semibold">Exemplo:</div>
                              <code className="text-xs text-amber-700 dark:text-amber-300 font-mono block font-semibold">{cmd.exemplo}</code>
                            </div>
                            <div className="bg-amber-100 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-600/20 rounded p-2 space-y-0.5">
                              <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400">Quando usar:</div>
                              <div className="text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed">{cmd.usoReal}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Comandos M */}
              {comandosFiltrados.comandosM.length > 0 && (
                <section>
                  <div className="bg-orange-600/10 border border-orange-600/30 rounded-md p-2 mb-3">
                    <h3 className="text-sm font-bold text-orange-500">Comandos M - Funções da Máquina</h3>
                  </div>
                  <div className="space-y-2">
                    {comandosFiltrados.comandosM.map((cmd) => (
                      <div key={cmd.codigo} className="bg-orange-50/50 dark:bg-secondary/40 border-2 border-orange-200/50 dark:border-border rounded-lg p-3 hover:border-orange-500/60 dark:hover:border-orange-600/50 transition-colors">
                        <div className="flex items-start gap-3">
                          <code className="font-mono font-bold text-orange-700 dark:text-orange-400 text-sm bg-orange-100 dark:bg-black/60 px-2 py-1 rounded min-w-[50px] text-center flex-shrink-0">
                            {cmd.codigo}
                          </code>
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="font-bold text-sm text-foreground">{cmd.nome}</div>
                            <div className="text-xs text-muted-foreground leading-relaxed">{cmd.descricao}</div>
                            <div className="bg-orange-100/50 dark:bg-black/40 rounded p-2 space-y-1">
                              <div className="text-[10px] text-muted-foreground font-semibold">Exemplo:</div>
                              <code className="text-xs text-orange-700 dark:text-orange-300 font-mono block font-semibold">{cmd.exemplo}</code>
                            </div>
                            <div className="bg-orange-100 dark:bg-orange-950/30 border border-orange-300 dark:border-orange-600/20 rounded p-2 space-y-0.5">
                              <div className="text-[10px] font-bold text-orange-700 dark:text-orange-400">Quando usar:</div>
                              <div className="text-xs text-orange-900 dark:text-orange-200/90 leading-relaxed">{cmd.usoReal}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Parâmetros */}
              {comandosFiltrados.parametros.length > 0 && (
                <section>
                  <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-md p-2 mb-3">
                    <h3 className="text-sm font-bold text-yellow-500">Parâmetros - Eixos e Valores</h3>
                  </div>
                  <div className="space-y-2">
                    {comandosFiltrados.parametros.map((param) => (
                      <div key={param.codigo} className="bg-yellow-50/50 dark:bg-secondary/40 border-2 border-yellow-200/50 dark:border-border rounded-lg p-3 hover:border-yellow-500/60 dark:hover:border-yellow-600/50 transition-colors">
                        <div className="flex items-start gap-3">
                          <code className="font-mono font-bold text-yellow-700 dark:text-yellow-400 text-sm bg-yellow-100 dark:bg-black/60 px-2 py-1 rounded min-w-[50px] text-center flex-shrink-0">
                            {param.codigo}
                          </code>
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="font-bold text-sm text-foreground">{param.nome}</div>
                            <div className="text-xs text-muted-foreground leading-relaxed">{param.descricao}</div>
                            <div className="bg-yellow-100/50 dark:bg-black/40 rounded p-2 space-y-1">
                              <div className="text-[10px] text-muted-foreground font-semibold">Exemplo:</div>
                              <code className="text-xs text-yellow-700 dark:text-yellow-300 font-mono block font-semibold">{param.exemplo}</code>
                            </div>
                            <div className="bg-yellow-100 dark:bg-yellow-950/30 border border-yellow-300 dark:border-yellow-600/20 rounded p-2 space-y-0.5">
                              <div className="text-[10px] font-bold text-yellow-700 dark:text-yellow-400">Quando usar:</div>
                              <div className="text-xs text-yellow-900 dark:text-yellow-200/90 leading-relaxed">{param.usoReal}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Exemplo completo - sempre visível */}
              {!busca && (
                <>
                  <section className="bg-amber-100/80 dark:bg-amber-900/20 border-2 border-amber-400/50 dark:border-amber-600/40 rounded-lg p-3">
                    <h3 className="text-sm font-bold text-amber-700 dark:text-amber-500 mb-2">Exemplo de G-code Completo</h3>
                    <div className="bg-slate-800 dark:bg-black/60 rounded-md p-2.5 space-y-0.5 font-mono text-[11px] overflow-x-auto">
                      <div className="text-gray-400">; Programa para cortar retângulo 100x50mm em madeira MDF 15mm</div>
                      <div className="text-amber-400">G21</div> <span className="text-gray-500">; Milímetros</span><br/>
                      <div className="text-amber-400">G90</div> <span className="text-gray-500">; Coordenadas absolutas</span><br/>
                      <div className="text-amber-400">G0 Z5</div> <span className="text-gray-500">; Sobe fresa para segurança</span><br/>
                      <div className="text-orange-400">T1 M6</div> <span className="text-gray-500">; Troca para fresa T1 (6mm)</span><br/>
                      <div className="text-orange-400">M3 S18000</div> <span className="text-gray-500">; Liga spindle a 18000 RPM</span><br/>
                      <div className="text-amber-400">G4 P2</div> <span className="text-gray-500">; Espera 2 segundos</span><br/>
                      <div className="text-amber-400">G0 X0 Y0</div> <span className="text-gray-500">; Vai rápido para início</span><br/>
                      <div className="text-amber-400">G41 D1</div> <span className="text-gray-500">; Ativa compensação esquerda (externo)</span><br/>
                      <div className="text-amber-400">G1 Z-5 F300</div> <span className="text-gray-500">; Desce 5mm com plunge rate 300</span><br/>
                      <div className="text-amber-400">G1 X100 Y0 F1500</div> <span className="text-gray-500">; Corta lado inferior</span><br/>
                      <div className="text-amber-400">G1 X100 Y50 F1500</div> <span className="text-gray-500">; Corta lado direito</span><br/>
                      <div className="text-amber-400">G1 X0 Y50 F1500</div> <span className="text-gray-500">; Corta lado superior</span><br/>
                      <div className="text-amber-400">G1 X0 Y0 F1500</div> <span className="text-gray-500">; Corta lado esquerdo</span><br/>
                      <div className="text-amber-400">G1 Z5 F300</div> <span className="text-gray-500">; Sobe fresa</span><br/>
                      <div className="text-amber-400">G40</div> <span className="text-gray-500">; Cancela compensação</span><br/>
                      <div className="text-orange-400">M5</div> <span className="text-gray-500">; Desliga spindle</span><br/>
                      <div className="text-amber-400">G28</div> <span className="text-gray-500">; Volta para home</span><br/>
                      <div className="text-orange-400">M30</div> <span className="text-gray-500">; Fim do programa</span>
                    </div>
                  </section>

                  {/* Dicas finais */}
                  <section className="bg-red-100/80 dark:bg-red-900/20 border-2 border-red-400/50 dark:border-red-600/30 rounded-lg p-3 mb-4">
                    <h3 className="text-sm font-bold text-red-700 dark:text-red-400 mb-2">ATENÇÃO - Erros Comuns para EVITAR</h3>
                    <ul className="space-y-1.5 text-xs">
                      <li className="flex gap-2"><span className="text-red-600 dark:text-red-400 flex-shrink-0 font-bold">X</span> <span className="text-red-900 dark:text-red-200">Esquecer G21 no início - máquina pode interpretar como polegadas</span></li>
                      <li className="flex gap-2"><span className="text-red-600 dark:text-red-400 flex-shrink-0 font-bold">X</span> <span className="text-red-900 dark:text-red-200">Usar G41 e esquecer G40 depois - próxima peça sai com offset errado</span></li>
                      <li className="flex gap-2"><span className="text-red-600 dark:text-red-400 flex-shrink-0 font-bold">X</span> <span className="text-red-900 dark:text-red-200">M3 sem G4 depois - começa a cortar com spindle ainda acelerando</span></li>
                      <li className="flex gap-2"><span className="text-red-600 dark:text-red-400 flex-shrink-0 font-bold">X</span> <span className="text-red-900 dark:text-red-200">Descer Z muito rápido (usar feedrate ao invés de plunge rate)</span></li>
                      <li className="flex gap-2"><span className="text-red-600 dark:text-red-400 flex-shrink-0 font-bold">X</span> <span className="text-red-900 dark:text-red-200">Confundir G41 com G42 - fresa corta no lado errado da madeira</span></li>
                      <li className="flex gap-2"><span className="text-red-600 dark:text-red-400 flex-shrink-0 font-bold">X</span> <span className="text-red-900 dark:text-red-200">Esquecer M5 no final - spindle fica ligado queimando o motor</span></li>
                    </ul>
                  </section>
                </>
              )}

              {/* Mensagem quando não há resultados */}
              {busca && totalResultados === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-sm">
                    Nenhum comando encontrado para &quot;{busca}&quot;
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Tente pesquisar por código (G0, M3) ou nome (movimento, spindle)
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
}
