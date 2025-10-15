"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MetodoNesting } from "@/lib/nesting-algorithm";

type SeletorNestingProps = {
  metodo: MetodoNesting;
  onChange: (metodo: MetodoNesting) => void;
  metricas?: {
    areaUtilizada: number;
    eficiencia: number;
    tempo: number;
  };
};

export function SeletorNesting({ metodo, onChange, metricas }: SeletorNestingProps) {
  return (
    <Card>
      <div className="p-3.5 space-y-2.5">
        <div>
          <h2 className="text-sm font-semibold mb-2">Algoritmo de Nesting</h2>

          <div className="space-y-1">
            <Label htmlFor="metodo-nesting">Método de Posicionamento</Label>
            <Select value={metodo} onValueChange={(value) => onChange(value as MetodoNesting)}>
              <SelectTrigger id="metodo-nesting" className="w-full">
                <SelectValue placeholder="Selecione o método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="greedy">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Greedy FFD</span>
                    <span className="text-xs text-muted-foreground">
                      Rápido e previsível - Ordena por área
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="shelf">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Shelf/Skyline</span>
                    <span className="text-xs text-muted-foreground">
                      Melhor aproveitamento vertical
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="guillotine">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Guillotine</span>
                    <span className="text-xs text-muted-foreground">
                      Divisão retangular eficiente
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {metricas && (
          <div className="pt-2 border-t space-y-1.5">
            <h3 className="text-xs font-semibold">Métricas de Performance</h3>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-muted p-1.5 rounded">
                <div className="text-muted-foreground text-[10px]">Eficiência</div>
                <div className="font-bold text-sm">{metricas.eficiencia.toFixed(1)}%</div>
              </div>

              <div className="bg-muted p-1.5 rounded">
                <div className="text-muted-foreground text-[10px]">Área</div>
                <div className="font-bold text-sm">
                  {(metricas.areaUtilizada / 1000).toFixed(0)}k
                </div>
              </div>

              <div className="bg-muted p-1.5 rounded">
                <div className="text-muted-foreground text-[10px]">Tempo</div>
                <div className="font-bold text-sm">{metricas.tempo.toFixed(1)}ms</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
