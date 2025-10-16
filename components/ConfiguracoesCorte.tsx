"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { InfoTooltip } from "@/components/InfoTooltip";
import { parametrosInfo } from "@/lib/parametros-info";
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

  const handleCheckboxChange = (campo: keyof ConfiguracoesCorte, valor: boolean) => {
    onChange({ ...config, [campo]: valor });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações do Corte</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Label htmlFor="profundidade">Profundidade</Label>
              <InfoTooltip
                title={parametrosInfo.profundidade.title}
                content={parametrosInfo.profundidade.content}
              />
            </div>
            <Input
              id="profundidade"
              type="number"
              value={config.profundidade}
              onChange={(e) => handleChange("profundidade", e.target.value)}
              min="0"
              step="1"
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Label htmlFor="profundidadePorPassada">Prof./Passada</Label>
              <InfoTooltip
                title={parametrosInfo.profundidadePorPassada.title}
                content={parametrosInfo.profundidadePorPassada.content}
              />
            </div>
            <Input
              id="profundidadePorPassada"
              type="number"
              value={config.profundidadePorPassada}
              onChange={(e) => handleChange("profundidadePorPassada", e.target.value)}
              min="0.1"
              step="0.5"
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <Label htmlFor="espacamento">Espaçamento</Label>
            <InfoTooltip
              title={parametrosInfo.espacamento.title}
              content={parametrosInfo.espacamento.content}
            />
          </div>
          <Input
            id="espacamento"
            type="number"
            value={config.espacamento}
            onChange={(e) => handleChange("espacamento", e.target.value)}
            min="0"
            step="5"
          />
        </div>

        <div className="pt-2 border-t">
          <h3 className="text-xs font-semibold mb-2">Velocidades e Potência</h3>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Label htmlFor="feedrate">Vel. Avanço</Label>
                <InfoTooltip
                  title={parametrosInfo.feedrate.title}
                  content={parametrosInfo.feedrate.content}
                />
              </div>
              <Input
                id="feedrate"
                type="number"
                value={config.feedrate}
                onChange={(e) => handleChange("feedrate", e.target.value)}
                min="100"
                max="5000"
                step="100"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Label htmlFor="plungeRate">Vel. Mergulho</Label>
                <InfoTooltip
                  title={parametrosInfo.plungeRate.title}
                  content={parametrosInfo.plungeRate.content}
                />
              </div>
              <Input
                id="plungeRate"
                type="number"
                value={config.plungeRate}
                onChange={(e) => handleChange("plungeRate", e.target.value)}
                min="50"
                max="2000"
                step="50"
              />
            </div>
          </div>

          <div className="space-y-1 mt-2.5">
            <div className="flex items-center gap-1">
              <Label htmlFor="rapidsSpeed">Vel. Rápida</Label>
              <InfoTooltip
                title={parametrosInfo.rapidsSpeed.title}
                content={parametrosInfo.rapidsSpeed.content}
              />
            </div>
            <Input
              id="rapidsSpeed"
              type="number"
              value={config.rapidsSpeed}
              onChange={(e) => handleChange("rapidsSpeed", e.target.value)}
              min="500"
              max="10000"
              step="100"
            />
          </div>

          <div className="space-y-1 mt-2">
            <div className="flex items-center gap-1">
              <Label htmlFor="spindleSpeed">Rotação</Label>
              <InfoTooltip
                title={parametrosInfo.spindleSpeed.title}
                content={parametrosInfo.spindleSpeed.content}
              />
            </div>
            <Input
              id="spindleSpeed"
              type="number"
              value={config.spindleSpeed}
              onChange={(e) => handleChange("spindleSpeed", e.target.value)}
              min="5000"
              max="30000"
              step="1000"
            />
          </div>

          <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded">
            Plunge rate geralmente é 30-50% do feedrate
          </div>
        </div>

        <div className="pt-2 border-t">
          <h3 className="text-xs font-semibold mb-2">Rampa de Entrada</h3>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="usarRampa"
                checked={config.usarRampa}
                onCheckedChange={(checked) => handleCheckboxChange("usarRampa", checked as boolean)}
              />
              <Label
                htmlFor="usarRampa"
                className="text-sm font-normal cursor-pointer"
              >
                Usar rampa de entrada
              </Label>
              <InfoTooltip
                title={parametrosInfo.usarRampa.title}
                content={parametrosInfo.usarRampa.content}
              />
            </div>

            {config.usarRampa && (
              <div className="space-y-1 ml-6">
                <div className="flex items-center gap-1">
                  <Label htmlFor="anguloRampa">Ângulo da Rampa (°)</Label>
                  <InfoTooltip
                    title={parametrosInfo.anguloRampa.title}
                    content={parametrosInfo.anguloRampa.content}
                  />
                </div>
                <Input
                  id="anguloRampa"
                  type="number"
                  value={config.anguloRampa}
                  onChange={(e) => handleChange("anguloRampa", e.target.value)}
                  min="2"
                  max="5"
                  step="0.5"
                />
                <div className="text-xs text-muted-foreground mt-1 p-2 bg-muted rounded">
                  Recomendado: 3° (equilíbrio ideal). Mínimo: 2° (mais suave). Máximo: 5° (mais rápido)
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
