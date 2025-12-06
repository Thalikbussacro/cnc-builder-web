"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InfoTooltip } from "@/components/InfoTooltip";
import { SanitizationAlert } from "@/components/SanitizationAlert";
import { parametrosInfo } from "@/lib/parametros-info";
import { useValidatedInput } from "@/hooks/useValidatedInput";
import { useValidationContext } from "@/contexts/ValidationContext";
import { useConfigStore } from "@/stores/useConfigStore";
import { cn } from "@/lib/utils";
import type { ConfiguracoesChapa as ConfiguracoesChapaType } from "@/types";

type ConfiguracoesChapaProps = {
  onValidate?: (newConfig: Partial<ConfiguracoesChapaType>) => Promise<boolean>;
};

export function ConfiguracoesChapa({ onValidate }: ConfiguracoesChapaProps = {}) {
  const { registerError, clearError } = useValidationContext();
  const { configChapa, setConfigChapa } = useConfigStore();

  // Handler que valida antes de aplicar mudança
  const handleConfigChange = async (newConfig: Partial<ConfiguracoesChapaType>) => {
    // Se há validação, executa antes
    if (onValidate) {
      const cabem = await onValidate(newConfig);
      if (!cabem) {
        // Não aplica a mudança, o modal vai aparecer
        return;
      }
    }
    // Aplica a mudança
    setConfigChapa(newConfig);
  };

  // Validação de largura
  const largura = useValidatedInput(
    configChapa.largura,
    (value) => handleConfigChange({ largura: value }),
    'chapaLargura'
  );

  // Validação de altura
  const altura = useValidatedInput(
    configChapa.altura,
    (value) => handleConfigChange({ altura: value }),
    'chapaAltura'
  );

  // Validação de espessura
  const espessura = useValidatedInput(
    configChapa.espessura,
    (value) => handleConfigChange({ espessura: value }),
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
              <Label htmlFor="chapaLargura">Largura (Eixo X) - mm</Label>
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
              aria-label="Largura da chapa em milímetros (Eixo X)"
              aria-invalid={largura.hasError}
              aria-describedby={largura.hasError ? "chapaLargura-error" : undefined}
            />
            {largura.hasError && largura.errorMessage && (
              <p id="chapaLargura-error" role="alert" className="text-xs text-destructive mt-1">{largura.errorMessage}</p>
            )}
            <SanitizationAlert
              alert={largura.sanitizationAlert}
              onDismiss={largura.dismissSanitizationAlert}
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Label htmlFor="chapaAltura">Altura (Eixo Y) - mm</Label>
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
              aria-label="Altura da chapa em milímetros (Eixo Y)"
              aria-invalid={altura.hasError}
              aria-describedby={altura.hasError ? "chapaAltura-error" : undefined}
            />
            {altura.hasError && altura.errorMessage && (
              <p id="chapaAltura-error" role="alert" className="text-xs text-destructive mt-1">{altura.errorMessage}</p>
            )}
            <SanitizationAlert
              alert={altura.sanitizationAlert}
              onDismiss={altura.dismissSanitizationAlert}
            />
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <Label htmlFor="chapaEspessura">Espessura - mm</Label>
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
            min="1"
            step="1"
            className={cn(espessura.hasError && "border-destructive focus-visible:ring-destructive")}
            aria-label="Espessura da chapa em milímetros"
            aria-invalid={espessura.hasError}
            aria-describedby={espessura.hasError ? "chapaEspessura-error" : undefined}
          />
          {espessura.hasError && espessura.errorMessage && (
            <p id="chapaEspessura-error" role="alert" className="text-xs text-destructive mt-1">{espessura.errorMessage}</p>
          )}
          <SanitizationAlert
            alert={espessura.sanitizationAlert}
            onDismiss={espessura.dismissSanitizationAlert}
          />
        </div>
      </CardContent>
    </Card>
  );
}
