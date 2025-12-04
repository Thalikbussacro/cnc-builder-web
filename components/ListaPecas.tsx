"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";
import type { Peca } from "@/types";

type ListaPecasProps = {
  pecas: Peca[];
  onRemover?: (id: string) => void;
  onToggleIgnorar?: (id: string) => void;
};

// Cores temáticas quentes (mesmas do PreviewCanvas)
const CORES = [
  { hex: "#F5B642", nome: "Amarelo" },
  { hex: "#E67E22", nome: "Laranja" },
  { hex: "#D35400", nome: "Laranja Escuro" },
  { hex: "#F39C12", nome: "Dourado" },
  { hex: "#E59866", nome: "Pêssego" },
  { hex: "#DC7633", nome: "Terracota" },
];

// Mapeamento de tipo de corte sem emojis
const TIPO_CORTE_INFO = {
  'externo': { color: 'text-orange-600', label: 'Ext', bg: 'bg-orange-100 dark:bg-orange-950' },
  'interno': { color: 'text-amber-600', label: 'Int', bg: 'bg-amber-100 dark:bg-amber-950' },
  'na-linha': { color: 'text-yellow-600', label: 'Linha', bg: 'bg-yellow-100 dark:bg-yellow-950' },
} as const;

export function ListaPecas({ pecas, onRemover, onToggleIgnorar }: ListaPecasProps) {
  // Agrupa peças por dimensões para o resumo
  const resumo = pecas.reduce((acc, peca) => {
    const chave = `${peca.largura.toFixed(0)}×${peca.altura.toFixed(0)}`;
    acc[chave] = (acc[chave] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Ordena resumo por quantidade (decrescente)
  const resumoOrdenado = Object.entries(resumo)
    .sort(([, a], [, b]) => b - a)
    .map(([dimensoes, qtd]) => `${qtd}× ${dimensoes}mm`)
    .join(', ');

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg">
          Lista de Peças ({pecas.length})
        </CardTitle>
        {pecas.length > 0 && (
          <p className="text-xs font-medium text-foreground/70 pt-1 border-t border-border/50 mt-2 pt-2">
            <span className="font-semibold">Resumo:</span> {resumoOrdenado}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {pecas.length === 0 ? (
          <p className="text-xs sm:text-sm text-muted-foreground text-center py-4">
            Nenhuma peça cadastrada
          </p>
        ) : (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 sm:max-h-64 overflow-y-auto pr-1"
            role="list"
            aria-label="Lista de peças cadastradas"
          >
            {pecas.map((peca, index) => {
              const cor = CORES[index % CORES.length];
              const tipoInfo = TIPO_CORTE_INFO[peca.tipoCorte];
              const ignorada = peca.ignorada || false;

              return (
                <div
                  key={peca.id}
                  className={`flex flex-col gap-1.5 p-2 bg-secondary/30 rounded-lg border border-border hover:shadow-md transition-all ${
                    ignorada ? 'opacity-50 bg-muted/20' : ''
                  }`}
                  role="listitem"
                  aria-label={`${peca.nome || `Peça ${index + 1}`}, dimensões ${peca.largura}×${peca.altura}mm, tipo ${tipoInfo.label}${ignorada ? ', ignorada' : ''}`}
                >
                  {/* Linha 1: Indicador + Nome + Remover */}
                  <div className="flex items-center gap-2">
                    {/* Indicador de cor */}
                    <div
                      className="w-3 h-3 rounded-full border-2 flex-shrink-0"
                      style={{
                        backgroundColor: ignorada ? '#999' : cor.hex + '60',
                        borderColor: ignorada ? '#666' : cor.hex,
                      }}
                    />
                    {/* Nome ou Número */}
                    <span className={`text-xs font-bold flex-1 min-w-0 truncate ${ignorada ? 'line-through text-muted-foreground' : ''}`} title={peca.nome || `Peça #${index + 1}`}>
                      {peca.nome || `#${index + 1}`}
                    </span>
                    {/* Botão Remover */}
                    {onRemover && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 hover:bg-destructive/20 hover:text-destructive flex-shrink-0"
                        onClick={() => onRemover(peca.id)}
                        aria-label={`Remover ${peca.nome || `peça ${index + 1}`}`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>

                  {/* Linha 2: Dimensões + Tipo de Corte */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    {/* Dimensões */}
                    <span className={`font-mono font-medium ${ignorada ? 'text-muted-foreground/60' : 'text-muted-foreground'}`}>
                      {peca.largura.toFixed(0)}×{peca.altura.toFixed(0)}mm
                    </span>
                    {/* Tipo de Corte */}
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${ignorada ? 'bg-muted text-muted-foreground' : `${tipoInfo.bg} ${tipoInfo.color}`}`}>
                      {tipoInfo.label}
                    </span>
                  </div>

                  {/* Linha 3: Checkbox Ignorar com Label */}
                  {onToggleIgnorar && (
                    <div className="flex items-center gap-1.5 pt-0.5 border-t border-border/50">
                      <Checkbox
                        id={`ignorar-${peca.id}`}
                        checked={ignorada}
                        onCheckedChange={() => onToggleIgnorar(peca.id)}
                        className="h-3.5 w-3.5 flex-shrink-0"
                      />
                      <label
                        htmlFor={`ignorar-${peca.id}`}
                        className="text-[10px] font-medium text-muted-foreground cursor-pointer select-none"
                      >
                        Ignorar
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
