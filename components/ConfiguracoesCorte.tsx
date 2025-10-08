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
      <CardHeader className="pb-3">
        <CardTitle className="text-lg sm:text-xl">Configurações do Corte</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        <div className="space-y-2">
          <Label htmlFor="profundidade" className="text-xs sm:text-sm">
            Profundidade (mm)
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
        <div className="space-y-2">
          <Label htmlFor="espacamento" className="text-xs sm:text-sm">
            Espaçamento (mm)
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
      </CardContent>
    </Card>
  );
}
