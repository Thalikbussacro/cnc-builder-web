"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { Peca } from "@/types";

type ListaPecasProps = {
  pecas: Peca[];
  onRemover?: (id: string) => void;
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

export function ListaPecas({ pecas, onRemover }: ListaPecasProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg">
          Lista de Peças ({pecas.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pecas.length === 0 ? (
          <p className="text-xs sm:text-sm text-muted-foreground text-center py-4">
            Nenhuma peça cadastrada
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 sm:max-h-64 overflow-y-auto pr-1">
            {pecas.map((peca, index) => {
              const cor = CORES[index % CORES.length];
              const tipoInfo = TIPO_CORTE_INFO[peca.tipoCorte];
              return (
                <div
                  key={peca.id}
                  className="flex flex-col gap-1.5 p-2 bg-secondary/30 rounded-lg border border-border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2">
                    {/* Indicador de cor */}
                    <div
                      className="w-3 h-3 rounded-full border-2 flex-shrink-0"
                      style={{
                        backgroundColor: cor.hex + '60',
                        borderColor: cor.hex,
                      }}
                    />
                    {/* Nome ou Número */}
                    <span className="text-xs font-bold flex-1 min-w-0 truncate" title={peca.nome || `Peça #${index + 1}`}>
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
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    {/* Dimensões */}
                    <span className="font-mono font-medium text-muted-foreground">
                      {peca.largura.toFixed(0)}×{peca.altura.toFixed(0)}mm
                    </span>
                    {/* Tipo de Corte */}
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${tipoInfo.bg} ${tipoInfo.color}`}>
                      {tipoInfo.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
