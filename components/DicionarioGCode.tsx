"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

type ComandoGCode = {
  codigo: string;
  nome: string;
  descricao: string;
  exemplo?: string;
};

const COMANDOS_G: ComandoGCode[] = [
  { codigo: "G0", nome: "Movimento Rápido", descricao: "Move a ferramenta rapidamente para uma posição sem cortar. Usado para posicionamento.", exemplo: "G0 X10 Y20 Z5" },
  { codigo: "G1", nome: "Movimento Linear", descricao: "Move a ferramenta em linha reta com velocidade de avanço (feedrate). Usado para cortar.", exemplo: "G1 X50 Y30 F1500" },
  { codigo: "G2", nome: "Interpolação Circular Horária", descricao: "Move a ferramenta em arco no sentido horário.", exemplo: "G2 X20 Y20 I5 J5" },
  { codigo: "G3", nome: "Interpolação Circular Anti-horária", descricao: "Move a ferramenta em arco no sentido anti-horário.", exemplo: "G3 X20 Y20 I5 J5" },
  { codigo: "G4", nome: "Pausa (Dwell)", descricao: "Pausa o movimento por um tempo especificado.", exemplo: "G4 P2 (pausa 2 segundos)" },
  { codigo: "G17", nome: "Plano XY", descricao: "Define o plano de trabalho como XY (padrão para CNC router).", exemplo: "G17" },
  { codigo: "G18", nome: "Plano XZ", descricao: "Define o plano de trabalho como XZ.", exemplo: "G18" },
  { codigo: "G19", nome: "Plano YZ", descricao: "Define o plano de trabalho como YZ.", exemplo: "G19" },
  { codigo: "G20", nome: "Polegadas", descricao: "Define as unidades de medida como polegadas.", exemplo: "G20" },
  { codigo: "G21", nome: "Milímetros", descricao: "Define as unidades de medida como milímetros (padrão).", exemplo: "G21" },
  { codigo: "G28", nome: "Ir para Home", descricao: "Move a ferramenta para a posição inicial (home).", exemplo: "G28" },
  { codigo: "G40", nome: "Cancelar Compensação", descricao: "Cancela a compensação de diâmetro da ferramenta (G41/G42).", exemplo: "G40" },
  { codigo: "G41", nome: "Compensação Esquerda", descricao: "Ativa compensação à esquerda da peça. Use para cortes EXTERNOS - a fresa fica do lado esquerdo do caminho.", exemplo: "G41 D1" },
  { codigo: "G42", nome: "Compensação Direita", descricao: "Ativa compensação à direita da peça. Use para cortes INTERNOS (furos) - a fresa fica do lado direito do caminho.", exemplo: "G42 D1" },
  { codigo: "G43", nome: "Compensação de Comprimento +", descricao: "Aplica compensação positiva de comprimento da ferramenta.", exemplo: "G43 H1" },
  { codigo: "G49", nome: "Cancelar Comp. Comprimento", descricao: "Cancela compensação de comprimento da ferramenta.", exemplo: "G49" },
  { codigo: "G54-G59", nome: "Sistemas de Coordenadas", descricao: "Define diferentes sistemas de coordenadas de trabalho.", exemplo: "G54 (sistema 1)" },
  { codigo: "G80", nome: "Cancelar Ciclos", descricao: "Cancela ciclos de furação/rosqueamento.", exemplo: "G80" },
  { codigo: "G81", nome: "Ciclo de Furação", descricao: "Executa um ciclo de furação simples.", exemplo: "G81 X10 Y10 Z-5 R2 F100" },
  { codigo: "G90", nome: "Coordenadas Absolutas", descricao: "Define modo de coordenadas absolutas (relativas à origem).", exemplo: "G90" },
  { codigo: "G91", nome: "Coordenadas Incrementais", descricao: "Define modo de coordenadas incrementais (relativas à posição atual).", exemplo: "G91" },
  { codigo: "G92", nome: "Definir Posição", descricao: "Define a posição atual como um valor específico sem mover.", exemplo: "G92 X0 Y0 Z0" },
];

const COMANDOS_M: ComandoGCode[] = [
  { codigo: "M0", nome: "Parada Obrigatória", descricao: "Para completamente o programa até ser reiniciado manualmente.", exemplo: "M0" },
  { codigo: "M1", nome: "Parada Opcional", descricao: "Para o programa se a parada opcional estiver habilitada.", exemplo: "M1" },
  { codigo: "M2", nome: "Fim do Programa", descricao: "Finaliza o programa (versão antiga).", exemplo: "M2" },
  { codigo: "M3", nome: "Spindle Horário (CW)", descricao: "Liga o spindle girando no sentido horário.", exemplo: "M3 S18000 (18000 RPM)" },
  { codigo: "M4", nome: "Spindle Anti-horário (CCW)", descricao: "Liga o spindle girando no sentido anti-horário.", exemplo: "M4 S12000" },
  { codigo: "M5", nome: "Spindle Desligado", descricao: "Desliga o spindle.", exemplo: "M5" },
  { codigo: "M6", nome: "Troca de Ferramenta", descricao: "Executa a troca de ferramenta. Precedido por T (número da ferramenta).", exemplo: "T1 M6 (troca para T1)" },
  { codigo: "M7", nome: "Refrigeração Névoa ON", descricao: "Liga o sistema de refrigeração por névoa.", exemplo: "M7" },
  { codigo: "M8", nome: "Refrigeração Líquida ON", descricao: "Liga o sistema de refrigeração líquida.", exemplo: "M8" },
  { codigo: "M9", nome: "Refrigeração OFF", descricao: "Desliga todos os sistemas de refrigeração.", exemplo: "M9" },
  { codigo: "M30", nome: "Fim do Programa e Reset", descricao: "Finaliza o programa e retorna ao início (versão moderna).", exemplo: "M30" },
  { codigo: "M98", nome: "Chamar Subrotina", descricao: "Chama uma subrotina (subprograma).", exemplo: "M98 P1000" },
  { codigo: "M99", nome: "Retornar de Subrotina", descricao: "Retorna de uma subrotina ao programa principal.", exemplo: "M99" },
];

const PARAMETROS: ComandoGCode[] = [
  { codigo: "F", nome: "Feedrate (Avanço)", descricao: "Velocidade de avanço durante o corte em mm/min ou polegadas/min.", exemplo: "F1500 (1500 mm/min)" },
  { codigo: "S", nome: "Spindle Speed (RPM)", descricao: "Velocidade de rotação do spindle em RPM.", exemplo: "S18000 (18000 RPM)" },
  { codigo: "T", nome: "Tool Number", descricao: "Número da ferramenta a ser usada (1-99).", exemplo: "T1 (ferramenta 1)" },
  { codigo: "D", nome: "Tool Offset", descricao: "Offset de diâmetro da ferramenta (usado com G41/G42).", exemplo: "D1" },
  { codigo: "H", nome: "Length Offset", descricao: "Offset de comprimento da ferramenta (usado com G43).", exemplo: "H1" },
  { codigo: "P", nome: "Dwell Time / Program", descricao: "Tempo de pausa (G4) ou número de programa (M98).", exemplo: "P2.5 ou P1000" },
  { codigo: "X", nome: "Posição X", descricao: "Coordenada no eixo X.", exemplo: "X100.5" },
  { codigo: "Y", nome: "Posição Y", descricao: "Coordenada no eixo Y.", exemplo: "Y50.25" },
  { codigo: "Z", nome: "Posição Z", descricao: "Coordenada no eixo Z (profundidade).", exemplo: "Z-5.0" },
  { codigo: "I", nome: "Offset X para Arco", descricao: "Distância incremental do centro do arco no eixo X.", exemplo: "I10" },
  { codigo: "J", nome: "Offset Y para Arco", descricao: "Distância incremental do centro do arco no eixo Y.", exemplo: "J10" },
  { codigo: "K", nome: "Offset Z para Arco", descricao: "Distância incremental do centro do arco no eixo Z.", exemplo: "K5" },
  { codigo: "R", nome: "Raio / Plano de Retorno", descricao: "Raio de arco (G2/G3) ou plano de retorno em ciclos (G81).", exemplo: "R15.5" },
];

export function DicionarioGCode() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 h-8 sm:h-9 text-xs sm:text-sm border-amber-600/50 hover:bg-amber-600/10 hover:border-amber-600"
        >
          <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Dicionário G-code</span>
          <span className="sm:hidden">G-code</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-amber-500" />
            Dicionário de Comandos G-code
          </DialogTitle>
          <DialogDescription>
            Referência completa de comandos G, M e parâmetros utilizados em CNC
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Comandos G */}
            <section>
              <h3 className="text-lg font-semibold mb-3 text-amber-500 border-b pb-2">Comandos G (Movimento e Controle)</h3>
              <div className="grid gap-3">
                {COMANDOS_G.map((cmd) => (
                  <div key={cmd.codigo} className="bg-secondary/30 rounded-lg p-3 hover:bg-secondary/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <code className="font-mono font-bold text-amber-400 text-sm bg-black/40 px-2 py-1 rounded min-w-[60px] text-center">
                        {cmd.codigo}
                      </code>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{cmd.nome}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{cmd.descricao}</div>
                        {cmd.exemplo && (
                          <code className="text-xs bg-black/20 px-2 py-0.5 rounded mt-1 inline-block">
                            {cmd.exemplo}
                          </code>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Comandos M */}
            <section>
              <h3 className="text-lg font-semibold mb-3 text-blue-400 border-b pb-2">Comandos M (Máquina e Funções Auxiliares)</h3>
              <div className="grid gap-3">
                {COMANDOS_M.map((cmd) => (
                  <div key={cmd.codigo} className="bg-secondary/30 rounded-lg p-3 hover:bg-secondary/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <code className="font-mono font-bold text-blue-400 text-sm bg-black/40 px-2 py-1 rounded min-w-[60px] text-center">
                        {cmd.codigo}
                      </code>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{cmd.nome}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{cmd.descricao}</div>
                        {cmd.exemplo && (
                          <code className="text-xs bg-black/20 px-2 py-0.5 rounded mt-1 inline-block">
                            {cmd.exemplo}
                          </code>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Parâmetros */}
            <section>
              <h3 className="text-lg font-semibold mb-3 text-green-400 border-b pb-2">Parâmetros e Eixos</h3>
              <div className="grid gap-3">
                {PARAMETROS.map((param) => (
                  <div key={param.codigo} className="bg-secondary/30 rounded-lg p-3 hover:bg-secondary/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <code className="font-mono font-bold text-green-400 text-sm bg-black/40 px-2 py-1 rounded min-w-[60px] text-center">
                        {param.codigo}
                      </code>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{param.nome}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{param.descricao}</div>
                        {param.exemplo && (
                          <code className="text-xs bg-black/20 px-2 py-0.5 rounded mt-1 inline-block">
                            {param.exemplo}
                          </code>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Seção de dicas */}
            <section className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2 text-amber-500">💡 Dicas Importantes</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Plunge Rate:</strong> Geralmente é 30-50% do feedrate (velocidade de descida mais lenta)</li>
                <li>• <strong>G41 vs G42:</strong> G41 = Externo (peça), G42 = Interno (furos)</li>
                <li>• <strong>Sempre use G40:</strong> Cancele compensação após cada peça para evitar erros</li>
                <li>• <strong>Coordenadas absolutas (G90):</strong> Mais seguro e previsível que incrementais (G91)</li>
                <li>• <strong>Sequência típica:</strong> G21 → G90 → G0 Z5 → M3 S[RPM] → cortes → M5 → M30</li>
              </ul>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
