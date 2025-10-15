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
      <CardHeader>
        <CardTitle>Configurações Gerais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Label htmlFor="chapaLargura">Largura</Label>
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
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Label htmlFor="chapaAltura">Altura</Label>
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
            />
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <Label htmlFor="chapaEspessura">Espessura</Label>
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
          />
        </div>
      </CardContent>
    </Card>
  );
}
