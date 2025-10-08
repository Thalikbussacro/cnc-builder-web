"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Peca } from "@/types";

type ListaPecasProps = {
  pecas: Peca[];
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

export function ListaPecas({ pecas }: ListaPecasProps) {
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 sm:max-h-64 overflow-y-auto pr-1">
            {pecas.map((peca, index) => {
              const cor = CORES[index % CORES.length];
              return (
                <div
                  key={peca.id}
                  className="flex items-center gap-1.5 p-2 bg-secondary/30 rounded-md border border-border"
                >
                  {/* Indicador de cor */}
                  <div
                    className="w-4 h-4 rounded border-2 flex-shrink-0"
                    style={{
                      backgroundColor: cor.hex + '40',
                      borderColor: cor.hex,
                    }}
                  />
                  {/* Número e dimensões */}
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-xs font-semibold truncate">
                      #{index + 1}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground truncate">
                      {peca.largura.toFixed(0)}×{peca.altura.toFixed(0)}mm
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
