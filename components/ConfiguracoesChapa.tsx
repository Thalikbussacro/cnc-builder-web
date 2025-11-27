"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InfoTooltip } from "@/components/InfoTooltip";
import { parametrosInfo } from "@/lib/parametros-info";
import type { ConfiguracoesChapa } from "@/types";
import { useValidatedInput } from "@/hooks/useValidatedInput";
import { useValidationContext } from "@/contexts/ValidationContext";
import { cn } from "@/lib/utils";

type ConfiguracoesChapaProps = {
  config: ConfiguracoesChapa;
  onChange: (config: ConfiguracoesChapa) => void;
};

export function ConfiguracoesChapa({ config, onChange }: ConfiguracoesChapaProps) {
  const { registerError, clearError } = useValidationContext();

  // Validação de largura
  const largura = useValidatedInput(
    config.largura,
    (value) => onChange({ ...config, largura: value }),
    'chapaLargura'
  );

  // Validação de altura
  const altura = useValidatedInput(
    config.altura,
    (value) => onChange({ ...config, altura: value }),
    'chapaAltura'
  );

  // Validação de espessura
  const espessura = useValidatedInput(
    config.espessura,
    (value) => onChange({ ...config, espessura: value }),
    'espessuraChapa'
  );

  // Registra/limpa erros no contexto global
  useEffect(() => {
    if (largura.hasError) {
      registerError('chapa', 'largura');
    } else {
      clearError('chapa', 'largura');
    }
  }, [largura.hasError, registerError, clearError]);

  useEffect(() => {
    if (altura.hasError) {
      registerError('chapa', 'altura');
    } else {
      clearError('chapa', 'altura');
    }
  }, [altura.hasError, registerError, clearError]);

  useEffect(() => {
    if (espessura.hasError) {
      registerError('chapa', 'espessura');
    } else {
      clearError('chapa', 'espessura');
    }
  }, [espessura.hasError, registerError, clearError]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações da Chapa</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Label htmlFor="chapaLargura">Largura (Eixo X)</Label>
              <InfoTooltip
                title={parametrosInfo.chapaLargura.title}
                content={parametrosInfo.chapaLargura.content}
              />
            </div>
            <Input
              id="chapaLargura"
              type="number"
              value={largura.inputValue}
              onChange={largura.handleChange}
              onBlur={largura.handleBlur}
              step="10"
              className={cn(largura.hasError && "border-destructive focus-visible:ring-destructive")}
            />
            {largura.hasError && largura.errorMessage && (
              <p className="text-xs text-destructive mt-1">{largura.errorMessage}</p>
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Label htmlFor="chapaAltura">Altura (Eixo Y)</Label>
              <InfoTooltip
                title={parametrosInfo.chapaAltura.title}
                content={parametrosInfo.chapaAltura.content}
              />
            </div>
            <Input
              id="chapaAltura"
              type="number"
              value={altura.inputValue}
              onChange={altura.handleChange}
              onBlur={altura.handleBlur}
              step="10"
              className={cn(altura.hasError && "border-destructive focus-visible:ring-destructive")}
            />
            {altura.hasError && altura.errorMessage && (
              <p className="text-xs text-destructive mt-1">{altura.errorMessage}</p>
            )}
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
            value={espessura.inputValue}
            onChange={espessura.handleChange}
            onBlur={espessura.handleBlur}
            step="0.5"
            className={cn(espessura.hasError && "border-destructive focus-visible:ring-destructive")}
          />
          {espessura.hasError && espessura.errorMessage && (
            <p className="text-xs text-destructive mt-1">{espessura.errorMessage}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
