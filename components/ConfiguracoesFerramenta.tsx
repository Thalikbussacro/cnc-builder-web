"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ConfiguracoesFerramenta, TipoCorte } from "@/types";

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

        <div className="pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="tipoCorte" className="text-xs sm:text-sm font-semibold">
              Tipo de Corte
            </Label>
            <Select value={config.tipoCorte} onValueChange={(value) => handleChange("tipoCorte", value as TipoCorte)}>
              <SelectTrigger id="tipoCorte" className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="externo">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">🔵 Externo (G41)</span>
                    <span className="text-xs text-muted-foreground">
                      Fresa corta por FORA - Peça fica menor
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="interno">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">🔴 Interno (G42)</span>
                    <span className="text-xs text-muted-foreground">
                      Fresa corta por DENTRO - Para furos
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="na-linha">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">⚪ Na Linha (G40)</span>
                    <span className="text-xs text-muted-foreground">
                      Fresa segue exatamente a marcação
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-xs text-muted-foreground mt-2 p-2 bg-secondary/30 rounded">
            <div className="font-semibold mb-1">💡 Compensação de Ferramenta:</div>
            <ul className="space-y-0.5 ml-4 list-disc">
              <li><strong>Externo:</strong> Use para cortar peças (offset = diâmetro/2)</li>
              <li><strong>Interno:</strong> Use para fazer furos/recortes internos</li>
              <li><strong>Na linha:</strong> Centro da fresa segue o caminho</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
