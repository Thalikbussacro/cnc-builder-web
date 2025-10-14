"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InfoTooltip } from "@/components/InfoTooltip";
import { parametrosInfo } from "@/lib/parametros-info";
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
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg">Configurações Gerais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3">
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1">
              <Label htmlFor="chapaLargura" className="text-xs sm:text-sm">
                Largura (Width)
              </Label>
              <InfoTooltip
                title={parametrosInfo.chapaLargura.title}
                content={parametrosInfo.chapaLargura.content}
              />
            </div>
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
          <div className="space-y-1.5">
            <div className="flex items-center gap-1">
              <Label htmlFor="chapaAltura" className="text-xs sm:text-sm">
                Altura (Height)
              </Label>
              <InfoTooltip
                title={parametrosInfo.chapaAltura.title}
                content={parametrosInfo.chapaAltura.content}
              />
            </div>
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
        <div className="space-y-1.5">
          <div className="flex items-center gap-1">
            <Label htmlFor="chapaEspessura" className="text-xs sm:text-sm">
              Espessura (Thickness)
            </Label>
            <InfoTooltip
              title={parametrosInfo.chapaEspessura.title}
              content={parametrosInfo.chapaEspessura.content}
            />
          </div>
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
