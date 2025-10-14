"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { Peca } from "@/types";

type ListaPecasProps = {
  pecas: Peca[];
  onRemover?: (id: string) => void;
};

// Mesmas cores do PreviewCanvas
const CORES = [
  { hex: "#e67e22", nome: "Laranja" },
  { hex: "#3498db", nome: "Azul" },
  { hex: "#95a5a6", nome: "Cinza" },
  { hex: "#e74c3c", nome: "Vermelho" },
  { hex: "#16a085", nome: "Verde" },
  { hex: "#f39c12", nome: "Amarelo" },
];

// Mapeamento de tipo de corte para emoji e label
const TIPO_CORTE_INFO = {
  'externo': { emoji: '🔵', label: 'Ext' },
  'interno': { emoji: '🔴', label: 'Int' },
  'na-linha': { emoji: '⚪', label: 'Linha' },
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
          <p className="text-xs sm:text-sm text-gray-500 text-center py-4">
            Nenhuma peça cadastrada
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2 max-h-48 sm:max-h-64 overflow-y-auto pr-1">
            {pecas.map((peca, index) => {
              const cor = CORES[index % CORES.length];
              const tipoInfo = TIPO_CORTE_INFO[peca.tipoCorte];
              return (
                <div
                  key={peca.id}
                  className="flex items-center gap-2 p-2 bg-secondary/30 rounded-md border border-border"
                >
                  {/* Indicador de cor */}
                  <div
                    className="w-4 h-4 rounded border-2 flex-shrink-0"
                    style={{
                      backgroundColor: cor.hex + '40',
                      borderColor: cor.hex,
                    }}
                  />
                  {/* Número */}
                  <span className="text-xs font-semibold w-6 flex-shrink-0">
                    #{index + 1}
                  </span>
                  {/* Dimensões */}
                  <span className="text-xs font-medium text-muted-foreground flex-1 min-w-0 truncate">
                    {peca.largura.toFixed(0)}×{peca.altura.toFixed(0)}mm
                  </span>
                  {/* Tipo de Corte */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-xs">{tipoInfo.emoji}</span>
                    <span className="text-xs font-medium">{tipoInfo.label}</span>
                  </div>
                  {/* Botão Remover */}
                  {onRemover && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive flex-shrink-0"
                      onClick={() => onRemover(peca.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
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
