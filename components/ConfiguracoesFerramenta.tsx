"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InfoTooltip } from "@/components/InfoTooltip";
import { SanitizationAlert } from "@/components/SanitizationAlert";
import { parametrosInfo } from "@/lib/parametros-info";
import { VALIDATION_RULES } from "@/lib/validation-rules";
import type { ConfiguracoesFerramenta } from "@/types";
import type { ValidationField } from "@/lib/validator";
import { cn } from "@/lib/utils";
import { useValidatedInput } from "@/hooks/useValidatedInput";
import { useValidationContext } from "@/contexts/ValidationContext";

type ConfiguracoesFerramentaProps = {
  config: ConfiguracoesFerramenta;
  onChange: (config: ConfiguracoesFerramenta) => void;
  errorFields?: ValidationField[];
};

export function ConfiguracoesFerramenta({ config, onChange, errorFields = [] }: ConfiguracoesFerramentaProps) {
  const { registerError, clearError } = useValidationContext();

  // Validação de campos
  const diametroInput = useValidatedInput(
    config.diametro,
    (value) => onChange({ ...config, diametro: value }),
    'diametroFresa'
  );

  const numeroFerramentaInput = useValidatedInput(
    config.numeroFerramenta,
    (value) => onChange({ ...config, numeroFerramenta: value }),
    'numeroFerramenta'
  );

  // Registra/limpa erros no contexto global
  useEffect(() => {
    if (diametroInput.hasError) {
      registerError('ferramenta', 'diametro');
    } else {
      clearError('ferramenta', 'diametro');
    }
  }, [diametroInput.hasError, registerError, clearError]);

  useEffect(() => {
    if (numeroFerramentaInput.hasError) {
      registerError('ferramenta', 'numeroFerramenta');
    } else {
      clearError('ferramenta', 'numeroFerramenta');
    }
  }, [numeroFerramentaInput.hasError, registerError, clearError]);

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
              value={diametroInput.inputValue}
              onChange={diametroInput.handleChange}
              onBlur={diametroInput.handleBlur}
              min={VALIDATION_RULES.diametroFresa.min}
              max={VALIDATION_RULES.diametroFresa.max}
              step="0.5"
              className={cn(diametroInput.hasError && "border-destructive focus-visible:ring-destructive")}
            />
            {diametroInput.hasError && diametroInput.errorMessage && (
              <p className="text-xs text-destructive mt-1">{diametroInput.errorMessage}</p>
            )}
            <SanitizationAlert
              alert={diametroInput.sanitizationAlert}
              onDismiss={diametroInput.dismissSanitizationAlert}
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
              value={numeroFerramentaInput.inputValue}
              onChange={numeroFerramentaInput.handleChange}
              onBlur={numeroFerramentaInput.handleBlur}
              min={VALIDATION_RULES.numeroFerramenta.min}
              max={VALIDATION_RULES.numeroFerramenta.max}
              step="1"
              className={cn(numeroFerramentaInput.hasError && "border-destructive focus-visible:ring-destructive")}
            />
            {numeroFerramentaInput.hasError && numeroFerramentaInput.errorMessage && (
              <p className="text-xs text-destructive mt-1">{numeroFerramentaInput.errorMessage}</p>
            )}
            <SanitizationAlert
              alert={numeroFerramentaInput.sanitizationAlert}
              onDismiss={numeroFerramentaInput.dismissSanitizationAlert}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
