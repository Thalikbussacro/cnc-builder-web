"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Peca } from "@/types";

type ListaPecasProps = {
  pecas: Peca[];
};

export function ListaPecas({ pecas }: ListaPecasProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg sm:text-xl">
          Lista de Peças ({pecas.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pecas.length === 0 ? (
          <p className="text-xs sm:text-sm text-gray-500 text-center py-4">
            Nenhuma peça cadastrada
          </p>
        ) : (
          <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto pr-1">
            {pecas.map((peca, index) => (
              <div
                key={peca.id}
                className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-md border"
              >
                <span className="text-xs sm:text-sm font-medium">
                  Peça {index + 1}:
                </span>
                <span className="text-xs sm:text-sm text-gray-700">
                  {peca.largura.toFixed(0)} x {peca.altura.toFixed(0)} mm
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
