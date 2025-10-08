"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ConfiguracoesCorte } from "@/types";

type ConfiguracoesCorteProps = {
  config: ConfiguracoesCorte;
  onChange: (config: ConfiguracoesCorte) => void;
};

export function ConfiguracoesCorte({ config, onChange }: ConfiguracoesCorteProps) {
  const handleChange = (campo: keyof ConfiguracoesCorte, valor: string) => {
    const numero = parseFloat(valor) || 0;
    onChange({ ...config, [campo]: numero });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg">Configurações do Corte</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3">
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="profundidade" className="text-xs sm:text-sm">
              Profundidade Total (mm)
            </Label>
            <Input
              id="profundidade"
              type="number"
              value={config.profundidade}
              onChange={(e) => handleChange("profundidade", e.target.value)}
              min="0"
              step="1"
              className="h-9 sm:h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profundidadePorPassada" className="text-xs sm:text-sm">
              Prof. por Passada (mm)
            </Label>
            <Input
              id="profundidadePorPassada"
              type="number"
              value={config.profundidadePorPassada}
              onChange={(e) => handleChange("profundidadePorPassada", e.target.value)}
              min="0.1"
              step="0.5"
              className="h-9 sm:h-10"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="espacamento" className="text-xs sm:text-sm">
            Espaçamento entre Peças (mm)
          </Label>
          <Input
            id="espacamento"
            type="number"
            value={config.espacamento}
            onChange={(e) => handleChange("espacamento", e.target.value)}
            min="0"
            step="5"
            className="h-9 sm:h-10"
          />
        </div>

        <div className="pt-2 border-t">
          <h3 className="text-xs sm:text-sm font-semibold mb-2">Velocidades e Potência</h3>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="feedrate" className="text-xs">
                Feedrate (mm/min)
              </Label>
              <Input
                id="feedrate"
                type="number"
                value={config.feedrate}
                onChange={(e) => handleChange("feedrate", e.target.value)}
                min="100"
                max="5000"
                step="100"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="plungeRate" className="text-xs">
                Plunge Rate (mm/min)
              </Label>
              <Input
                id="plungeRate"
                type="number"
                value={config.plungeRate}
                onChange={(e) => handleChange("plungeRate", e.target.value)}
                min="50"
                max="2000"
                step="50"
                className="h-9"
              />
            </div>
          </div>

          <div className="space-y-1.5 mt-2">
            <Label htmlFor="spindleSpeed" className="text-xs">
              Spindle Speed (RPM)
            </Label>
            <Input
              id="spindleSpeed"
              type="number"
              value={config.spindleSpeed}
              onChange={(e) => handleChange("spindleSpeed", e.target.value)}
              min="5000"
              max="30000"
              step="1000"
              className="h-9"
            />
          </div>

          <div className="text-xs text-muted-foreground mt-2 p-2 bg-secondary/30 rounded">
            💡 Plunge rate geralmente é 30-50% do feedrate
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
