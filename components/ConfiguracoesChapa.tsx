"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ConfiguracoesChapa } from "@/types";

type ConfiguracoesChapaProps = {
  config: ConfiguracoesChapa;
  onChange: (config: ConfiguracoesChapa) => void;
};

export function ConfiguracoesChapa({ config, onChange }: ConfiguracoesChapaProps) {
  const handleChange = (campo: keyof ConfiguracoesChapa, valor: string) => {
    const numero = parseFloat(valor) || 0;
    onChange({ ...config, [campo]: numero });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg sm:text-xl">Configurações Gerais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-2">
            <Label htmlFor="chapaLargura" className="text-xs sm:text-sm">
              Largura (mm)
            </Label>
            <Input
              id="chapaLargura"
              type="number"
              value={config.largura}
              onChange={(e) => handleChange("largura", e.target.value)}
              min="0"
              step="10"
              className="h-9 sm:h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="chapaAltura" className="text-xs sm:text-sm">
              Altura (mm)
            </Label>
            <Input
              id="chapaAltura"
              type="number"
              value={config.altura}
              onChange={(e) => handleChange("altura", e.target.value)}
              min="0"
              step="10"
              className="h-9 sm:h-10"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="chapaEspessura" className="text-xs sm:text-sm">
            Espessura (mm)
          </Label>
          <Input
            id="chapaEspessura"
            type="number"
            value={config.espessura}
            onChange={(e) => handleChange("espessura", e.target.value)}
            min="0"
            step="1"
            className="h-9 sm:h-10"
          />
        </div>
      </CardContent>
    </Card>
  );
}
