"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InfoTooltip } from "@/components/InfoTooltip";
import { parametrosInfo } from "@/lib/parametros-info";
import type { ConfiguracoesFerramenta } from "@/types";
import type { ValidationField } from "@/lib/validator";
import { cn } from "@/lib/utils";

type ConfiguracoesFerramentaProps = {
  config: ConfiguracoesFerramenta;
  onChange: (config: ConfiguracoesFerramenta) => void;
  errorFields?: ValidationField[];
};

export function ConfiguracoesFerramenta({ config, onChange, errorFields = [] }: ConfiguracoesFerramentaProps) {
  const hasError = (field: ValidationField) => errorFields.includes(field);
  const handleChange = (campo: keyof ConfiguracoesFerramenta, valor: string | number) => {
    onChange({ ...config, [campo]: valor });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações da Ferramenta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Label htmlFor="diametro">Diâmetro</Label>
              <InfoTooltip
                title={parametrosInfo.ferramentaDiametro.title}
                content={parametrosInfo.ferramentaDiametro.content}
              />
            </div>
            <Input
              id="diametro"
              type="number"
              value={config.diametro}
              onChange={(e) => handleChange("diametro", parseFloat(e.target.value) || 0)}
              min="0.1"
              step="0.5"
              className={cn(hasError('diametroFresa') && "border-destructive focus-visible:ring-destructive")}
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Label htmlFor="numeroFerramenta">Número</Label>
              <InfoTooltip
                title={parametrosInfo.ferramentaNumero.title}
                content={parametrosInfo.ferramentaNumero.content}
              />
            </div>
            <Input
              id="numeroFerramenta"
              type="number"
              value={config.numeroFerramenta}
              onChange={(e) => handleChange("numeroFerramenta", parseInt(e.target.value) || 1)}
              min="1"
              max="99"
              step="1"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
