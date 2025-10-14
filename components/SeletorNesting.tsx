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
    <Card className="p-3 sm:p-4">
      <div className="space-y-3">
        <div>
          <h2 className="text-base font-semibold mb-3">Algoritmo de Nesting</h2>

          <div className="space-y-2">
            <Label htmlFor="metodo-nesting" className="text-sm font-medium">
              Método de Posicionamento
            </Label>
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

        {/* Métricas */}
        {metricas && (
          <div className="pt-2 border-t space-y-2">
            <h3 className="text-sm font-semibold">Métricas de Performance</h3>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-secondary/30 p-2 rounded">
                <div className="text-muted-foreground text-[10px] sm:text-xs">Eficiência</div>
                <div className="font-bold text-sm sm:text-base">{metricas.eficiencia.toFixed(1)}%</div>
              </div>

              <div className="bg-secondary/30 p-2 rounded">
                <div className="text-muted-foreground text-[10px] sm:text-xs">Área (mm²)</div>
                <div className="font-bold text-sm sm:text-base">
                  {(metricas.areaUtilizada / 1000).toFixed(0)}k
                </div>
              </div>

              <div className="bg-secondary/30 p-2 rounded">
                <div className="text-muted-foreground text-[10px] sm:text-xs">Tempo (ms)</div>
                <div className="font-bold text-sm sm:text-base">{metricas.tempo.toFixed(1)}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
