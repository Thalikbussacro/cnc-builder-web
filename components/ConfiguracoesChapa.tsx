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
      <CardHeader>
        <CardTitle>Configurações Gerais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="chapaLargura">Largura da Chapa (mm)</Label>
            <Input
              id="chapaLargura"
              type="number"
              value={config.largura}
              onChange={(e) => handleChange("largura", e.target.value)}
              min="0"
              step="10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="chapaAltura">Altura da Chapa (mm)</Label>
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
        <div className="space-y-2">
          <Label htmlFor="chapaEspessura">Espessura da Chapa (mm)</Label>
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
