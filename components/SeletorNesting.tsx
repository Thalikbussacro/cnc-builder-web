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
import { useConfigStore } from "@/stores/useConfigStore";
import type { TempoEstimado } from "@/types";
import { formatarTempo } from "@/lib/utils";

type SeletorNestingProps = {
  metricas?: {
    areaUtilizada: number;
    eficiencia: number;
    tempo: number;
  };
  tempoEstimado?: TempoEstimado;
};

export function SeletorNesting({ metricas, tempoEstimado }: SeletorNestingProps) {
  const { metodoNesting, setMetodoNesting } = useConfigStore();
  return (
    <Card>
      <div className="p-3.5 space-y-2.5">
        <div>
          <h2 className="text-sm font-semibold mb-2">Algoritmo de Nesting</h2>

          <div className="space-y-1">
            <Label htmlFor="metodo-nesting">Método de Posicionamento</Label>
            <Select value={metodoNesting} onValueChange={setMetodoNesting}>
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

        {tempoEstimado && (
          <div className="pt-2 border-t space-y-1.5">
            <h3 className="text-xs font-semibold">Tempo Estimado de Corte</h3>

            <div className="bg-primary/5 border border-primary/20 p-2.5 rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Tempo Total</span>
                <span className="text-lg font-bold text-primary">{formatarTempo(tempoEstimado.tempoTotal)}</span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                <div className="bg-background/50 p-1 rounded text-center">
                  <div className="text-muted-foreground">Corte</div>
                  <div className="font-semibold">{formatarTempo(tempoEstimado.tempoCorte)}</div>
                </div>
                <div className="bg-background/50 p-1 rounded text-center">
                  <div className="text-muted-foreground">Mergulho</div>
                  <div className="font-semibold">{formatarTempo(tempoEstimado.tempoMergulho)}</div>
                </div>
                <div className="bg-background/50 p-1 rounded text-center">
                  <div className="text-muted-foreground">Posic.</div>
                  <div className="font-semibold">{formatarTempo(tempoEstimado.tempoPosicionamento)}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
