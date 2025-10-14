"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ConfiguracoesFerramenta } from "@/types";

type ConfiguracoesFerramentaProps = {
  config: ConfiguracoesFerramenta;
  onChange: (config: ConfiguracoesFerramenta) => void;
};

export function ConfiguracoesFerramenta({ config, onChange }: ConfiguracoesFerramentaProps) {
  const handleChange = (campo: keyof ConfiguracoesFerramenta, valor: string | number) => {
    onChange({ ...config, [campo]: valor });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg">Configurações da Ferramenta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3">
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="diametro" className="text-xs sm:text-sm">
              Diâmetro (mm)
            </Label>
            <Input
              id="diametro"
              type="number"
              value={config.diametro}
              onChange={(e) => handleChange("diametro", parseFloat(e.target.value) || 0)}
              min="0.1"
              step="0.5"
              className="h-9 sm:h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="numeroFerramenta" className="text-xs sm:text-sm">
              Número (T)
            </Label>
            <Input
              id="numeroFerramenta"
              type="number"
              value={config.numeroFerramenta}
              onChange={(e) => handleChange("numeroFerramenta", parseInt(e.target.value) || 1)}
              min="1"
              max="99"
              step="1"
              className="h-9 sm:h-10"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
