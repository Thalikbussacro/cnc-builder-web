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
      <CardHeader>
        <CardTitle>Configurações do Corte</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="profundidade">Profundidade do Corte (mm)</Label>
          <Input
            id="profundidade"
            type="number"
            value={config.profundidade}
            onChange={(e) => handleChange("profundidade", e.target.value)}
            min="0"
            step="1"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="espacamento">Espaçamento Entre Cortes (mm)</Label>
          <Input
            id="espacamento"
            type="number"
            value={config.espacamento}
            onChange={(e) => handleChange("espacamento", e.target.value)}
            min="0"
            step="5"
          />
        </div>
      </CardContent>
    </Card>
  );
}
