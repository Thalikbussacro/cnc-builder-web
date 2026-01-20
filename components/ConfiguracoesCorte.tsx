"use client";

import * as React from "react";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InfoTooltip } from "@/components/InfoTooltip";
import { SanitizationAlert } from "@/components/SanitizationAlert";
import { parametrosInfo } from "@/lib/parametros-info";
import { VALIDATION_RULES } from "@/lib/validation-rules";
import type { AplicarRampaEm, TipoRampa, ConfiguracoesCorte as ConfiguracoesCorteType } from "@/types";
import { cn } from "@/lib/utils";
import { useValidatedInput } from "@/hooks/useValidatedInput";
import { useValidationContext } from "@/contexts/ValidationContext";
import { useConfigStore } from "@/stores/useConfigStore";

type ConfiguracoesCorteProps = {
  onValidate?: (newConfig: Partial<ConfiguracoesCorteType>) => Promise<boolean>;
};

export function ConfiguracoesCorte({ onValidate }: ConfiguracoesCorteProps = {}) {
  const { registerError, clearError } = useValidationContext();
  const { configCorte, setConfigCorte } = useConfigStore();
  const config = configCorte;

  // Handler que valida antes de aplicar mudança
  const handleConfigChange = React.useCallback(async (newConfig: Partial<ConfiguracoesCorteType>) => {
    // Se há validação, executa antes
    if (onValidate) {
      const cabem = await onValidate(newConfig);
      if (!cabem) {
        // Não aplica a mudança, o modal vai aparecer
        return;
      }
    }
    // Aplica a mudança
    setConfigCorte(newConfig);
  }, [onValidate, setConfigCorte]);

  const onChange = handleConfigChange;

  // Estado para erro de validação matemática
  const [mathValidationError, setMathValidationError] = React.useState<string>('');

  // Estados para alertas de ajuste automático
  const [numeroPassadasAutoAdjustAlert, setNumeroPassadasAutoAdjustAlert] = React.useState<{
    show: boolean;
    message: string;
  }>({
    show: false,
    message: '',
  });

  const [profundidadePorPassadaAutoAdjustAlert, setProfundidadePorPassadaAutoAdjustAlert] = React.useState<{
    show: boolean;
    message: string;
  }>({
    show: false,
    message: '',
  });

  // Profundidade - editável, sem auto-ajuste
  const profundidadeInput = useValidatedInput(
    config.profundidade,
    (value) => onChange({ ...config, profundidade: value }),
    'profundidade'
  );

  // Número de passadas - auto-ajusta profundidadePorPassada
  const handleNumeroPassadasChange = (value: number) => {
    // Calcula nova profundidade por passada
    const novaProfundidadePorPassada = Math.round((config.profundidade / value) * 100) / 100;

    // Mostra alerta se mudou
    if (Math.abs(novaProfundidadePorPassada - config.profundidadePorPassada) > 0.01) {
      setNumeroPassadasAutoAdjustAlert({
        show: true,
        message: `Profundidade por passada ajustada para ${novaProfundidadePorPassada.toFixed(2)}mm`,
      });
    }

    // Aplica mudança diretamente SEM validação (não afeta nesting)
    setConfigCorte({
      ...config,
      numeroPassadas: value,
      profundidadePorPassada: novaProfundidadePorPassada
    });
  };

  const numeroPassadasInput = useValidatedInput(
    config.numeroPassadas,
    handleNumeroPassadasChange,
    'numeroPassadas'
  );

  // Profundidade por passada - auto-ajusta numeroPassadas
  const handleProfundidadePorPassadaChange = (value: number) => {
    // Calcula novo número de passadas
    const novoNumeroPassadas = Math.max(1, Math.min(100, Math.round(config.profundidade / value)));

    // Mostra alerta se mudou
    if (novoNumeroPassadas !== config.numeroPassadas) {
      setProfundidadePorPassadaAutoAdjustAlert({
        show: true,
        message: `Número de passadas ajustado para ${novoNumeroPassadas}`,
      });
    }

    // Aplica mudança diretamente SEM validação (não afeta nesting)
    setConfigCorte({
      ...config,
      profundidadePorPassada: value,
      numeroPassadas: novoNumeroPassadas
    });
  };

  const profundidadePorPassadaInput = useValidatedInput(
    config.profundidadePorPassada,
    handleProfundidadePorPassadaChange,
    'profundidadePorPassada'
  );

  // Dismiss handlers para alertas de auto-ajuste
  const dismissNumeroPassadasAutoAdjustAlert = React.useCallback(() => {
    setNumeroPassadasAutoAdjustAlert({ show: false, message: '' });
  }, []);

  const dismissProfundidadePorPassadaAutoAdjustAlert = React.useCallback(() => {
    setProfundidadePorPassadaAutoAdjustAlert({ show: false, message: '' });
  }, []);

  const espacamentoInput = useValidatedInput(
    config.espacamento,
    (value) => onChange({ ...config, espacamento: value }),
    'espacamento'
  );

  const margemBordaInput = useValidatedInput(
    config.margemBorda,
    (value) => onChange({ ...config, margemBorda: value }),
    'margemBorda'
  );

  const feedrateInput = useValidatedInput(
    config.feedrate,
    (value) => onChange({ ...config, feedrate: value }),
    'feedrate'
  );

  const plungeRateInput = useValidatedInput(
    config.plungeRate,
    (value) => onChange({ ...config, plungeRate: value }),
    'plungeRate'
  );

  const rapidsSpeedInput = useValidatedInput(
    config.rapidsSpeed,
    (value) => onChange({ ...config, rapidsSpeed: value }),
    'rapidsSpeed'
  );

  const spindleSpeedInput = useValidatedInput(
    config.spindleSpeed,
    (value) => onChange({ ...config, spindleSpeed: value }),
    'spindleSpeed'
  );

  const anguloRampaInput = useValidatedInput(
    config.anguloRampa,
    (value) => onChange({ ...config, anguloRampa: value }),
    'anguloRampa'
  );

  const zigZagDistanciaInput = useValidatedInput(
    config.zigZagDistancia ?? 5,
    (value) => onChange({ ...config, zigZagDistancia: value }),
    'zigZagDistancia'
  );

  const anguloRampaZigZagInput = useValidatedInput(
    config.anguloRampaZigZag ?? 20,
    (value) => onChange({ ...config, anguloRampaZigZag: value }),
    'anguloRampaZigZag'
  );

  // Validação matemática: numeroPassadas × profundidadePorPassada deve = profundidade
  useEffect(() => {
    const total = config.numeroPassadas * config.profundidadePorPassada;
    const diff = Math.abs(total - config.profundidade);

    // Tolerância de 0.01mm para erros de arredondamento
    if (diff > 0.01) {
      const errorMsg = `Valores inconsistentes: ${config.numeroPassadas} passada${config.numeroPassadas > 1 ? 's' : ''} × ${config.profundidadePorPassada}mm = ${total.toFixed(2)}mm, mas profundidade é ${config.profundidade}mm`;
      setMathValidationError(errorMsg);
      registerError('corte', 'math-validation');
    } else {
      setMathValidationError('');
      clearError('corte', 'math-validation');
    }
  }, [config.profundidade, config.numeroPassadas, config.profundidadePorPassada, registerError, clearError]);

  // Registra/limpa erros no contexto global
  useEffect(() => {
    if (profundidadeInput.hasError) {
      registerError('corte', 'profundidade');
    } else {
      clearError('corte', 'profundidade');
    }
  }, [profundidadeInput.hasError, registerError, clearError]);

  useEffect(() => {
    if (numeroPassadasInput.hasError) {
      registerError('corte', 'numeroPassadas');
    } else {
      clearError('corte', 'numeroPassadas');
    }
  }, [numeroPassadasInput.hasError, registerError, clearError]);

  useEffect(() => {
    if (profundidadePorPassadaInput.hasError) {
      registerError('corte', 'profundidadePorPassada');
    } else {
      clearError('corte', 'profundidadePorPassada');
    }
  }, [profundidadePorPassadaInput.hasError, registerError, clearError]);

  useEffect(() => {
    if (espacamentoInput.hasError) {
      registerError('corte', 'espacamento');
    } else {
      clearError('corte', 'espacamento');
    }
  }, [espacamentoInput.hasError, registerError, clearError]);

  useEffect(() => {
    if (margemBordaInput.hasError) {
      registerError('corte', 'margemBorda');
    } else {
      clearError('corte', 'margemBorda');
    }
  }, [margemBordaInput.hasError, registerError, clearError]);

  useEffect(() => {
    if (feedrateInput.hasError) {
      registerError('corte', 'feedrate');
    } else {
      clearError('corte', 'feedrate');
    }
  }, [feedrateInput.hasError, registerError, clearError]);

  useEffect(() => {
    if (plungeRateInput.hasError) {
      registerError('corte', 'plungeRate');
    } else {
      clearError('corte', 'plungeRate');
    }
  }, [plungeRateInput.hasError, registerError, clearError]);

  useEffect(() => {
    if (rapidsSpeedInput.hasError) {
      registerError('corte', 'rapidsSpeed');
    } else {
      clearError('corte', 'rapidsSpeed');
    }
  }, [rapidsSpeedInput.hasError, registerError, clearError]);

  useEffect(() => {
    if (spindleSpeedInput.hasError) {
      registerError('corte', 'spindleSpeed');
    } else {
      clearError('corte', 'spindleSpeed');
    }
  }, [spindleSpeedInput.hasError, registerError, clearError]);

  useEffect(() => {
    if (anguloRampaInput.hasError) {
      registerError('corte', 'anguloRampa');
    } else {
      clearError('corte', 'anguloRampa');
    }
  }, [anguloRampaInput.hasError, registerError, clearError]);

  useEffect(() => {
    if (zigZagDistanciaInput.hasError) {
      registerError('corte', 'zigZagDistancia');
    } else {
      clearError('corte', 'zigZagDistancia');
    }
  }, [zigZagDistanciaInput.hasError, registerError, clearError]);

  useEffect(() => {
    if (anguloRampaZigZagInput.hasError) {
      registerError('corte', 'anguloRampaZigZag');
    } else {
      clearError('corte', 'anguloRampaZigZag');
    }
  }, [anguloRampaZigZagInput.hasError, registerError, clearError]);

  // Inicializa tipoRampa quando usarRampa é ativado
  useEffect(() => {
    if (config.usarRampa && !config.tipoRampa) {
      setConfigCorte({ ...config, tipoRampa: 'linear' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.usarRampa, config.tipoRampa]);


  const handleCheckboxChange = (campo: keyof ConfiguracoesCorteType, valor: boolean) => {
    onChange({ ...config, [campo]: valor });
  };

  const handleSelectChange = (campo: keyof ConfiguracoesCorteType, valor: string) => {
    onChange({ ...config, [campo]: valor });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações do Corte</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <Label htmlFor="profundidade">Profundidade - mm</Label>
            <InfoTooltip
              title={parametrosInfo.profundidade.title}
              content={parametrosInfo.profundidade.content}
            />
          </div>
          <Input
            id="profundidade"
            type="number"
            value={profundidadeInput.inputValue}
            onChange={profundidadeInput.handleChange}
            onBlur={profundidadeInput.handleBlur}
            min="1"
            max={VALIDATION_RULES.profundidade.max}
            step="0.01"
            className={cn((profundidadeInput.hasError || mathValidationError) && "border-destructive focus-visible:ring-destructive")}
          />
          {profundidadeInput.hasError && profundidadeInput.errorMessage && (
            <p className="text-xs text-destructive mt-1">{profundidadeInput.errorMessage}</p>
          )}
          <SanitizationAlert
            alert={profundidadeInput.sanitizationAlert}
            onDismiss={profundidadeInput.dismissSanitizationAlert}
          />
        </div>

        {/* Alerta de validação matemática - aparece sobre os 3 campos */}
        {mathValidationError && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-md p-2.5">
            <p className="text-xs text-destructive font-medium">{mathValidationError}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Ajuste os valores para que a equação fique correta: Nº Passadas × Prof./Passada = Profundidade
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Label htmlFor="numeroPassadas">Nº Passadas</Label>
              <InfoTooltip
                title="Número de Passadas"
                content="Quantidade de vezes que a fresa descerá até atingir a profundidade total."
              />
            </div>
            <Input
              id="numeroPassadas"
              type="number"
              value={numeroPassadasInput.inputValue}
              onChange={numeroPassadasInput.handleChange}
              onBlur={numeroPassadasInput.handleBlur}
              min="1"
              max={VALIDATION_RULES.numeroPassadas.max}
              step="1"
              className={cn((numeroPassadasInput.hasError || mathValidationError) && "border-destructive focus-visible:ring-destructive")}
            />
            {numeroPassadasInput.hasError && numeroPassadasInput.errorMessage && (
              <p className="text-xs text-destructive mt-1">{numeroPassadasInput.errorMessage}</p>
            )}
            <SanitizationAlert
              alert={numeroPassadasInput.sanitizationAlert}
              onDismiss={numeroPassadasInput.dismissSanitizationAlert}
            />
            {/* Alerta de auto-ajuste de profundidade por passada */}
            {numeroPassadasAutoAdjustAlert.show && (
              <SanitizationAlert
                alert={{
                  show: true,
                  message: numeroPassadasAutoAdjustAlert.message,
                  originalValue: 0,
                  sanitizedValue: 0,
                }}
                onDismiss={dismissNumeroPassadasAutoAdjustAlert}
              />
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Label htmlFor="profundidadePorPassada">Prof./Passada - mm</Label>
              <InfoTooltip
                title={parametrosInfo.profundidadePorPassada.title}
                content={parametrosInfo.profundidadePorPassada.content}
              />
            </div>
            <Input
              id="profundidadePorPassada"
              type="number"
              value={profundidadePorPassadaInput.inputValue}
              onChange={profundidadePorPassadaInput.handleChange}
              onBlur={profundidadePorPassadaInput.handleBlur}
              min="0.01"
              max={VALIDATION_RULES.profundidadePorPassada.max}
              step="0.01"
              className={cn((profundidadePorPassadaInput.hasError || mathValidationError) && "border-destructive focus-visible:ring-destructive")}
            />
            {profundidadePorPassadaInput.hasError && profundidadePorPassadaInput.errorMessage && (
              <p className="text-xs text-destructive mt-1">{profundidadePorPassadaInput.errorMessage}</p>
            )}
            <SanitizationAlert
              alert={profundidadePorPassadaInput.sanitizationAlert}
              onDismiss={profundidadePorPassadaInput.dismissSanitizationAlert}
            />
            {/* Alerta de auto-ajuste de número de passadas */}
            {profundidadePorPassadaAutoAdjustAlert.show && (
              <SanitizationAlert
                alert={{
                  show: true,
                  message: profundidadePorPassadaAutoAdjustAlert.message,
                  originalValue: 0,
                  sanitizedValue: 0,
                }}
                onDismiss={dismissProfundidadePorPassadaAutoAdjustAlert}
              />
            )}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <Label htmlFor="espacamento">Espaçamento entre Peças - mm</Label>
            <InfoTooltip
              title={parametrosInfo.espacamento.title}
              content={parametrosInfo.espacamento.content}
            />
          </div>
          <Input
            id="espacamento"
            type="number"
            value={espacamentoInput.inputValue}
            onChange={espacamentoInput.handleChange}
            onBlur={espacamentoInput.handleBlur}
            min="0"
            max={VALIDATION_RULES.espacamento.max}
            step="1"
            className={cn(espacamentoInput.hasError && "border-destructive focus-visible:ring-destructive")}
          />
          {espacamentoInput.hasError && espacamentoInput.errorMessage && (
            <p className="text-xs text-destructive mt-1">{espacamentoInput.errorMessage}</p>
          )}
          <SanitizationAlert
            alert={espacamentoInput.sanitizationAlert}
            onDismiss={espacamentoInput.dismissSanitizationAlert}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="usarMesmoEspacamentoBorda"
              checked={config.usarMesmoEspacamentoBorda}
              onCheckedChange={(checked) => handleCheckboxChange("usarMesmoEspacamentoBorda", checked as boolean)}
            />
            <Label
              htmlFor="usarMesmoEspacamentoBorda"
              className="text-sm font-normal cursor-pointer"
            >
              Usar mesmo espaçamento para margem de borda
            </Label>
            <InfoTooltip
              title="Margem de Borda"
              content="Se marcado, utiliza o mesmo espaçamento entre peças para a distância das bordas da chapa. Se desmarcado, permite configurar margem de borda customizada."
            />
          </div>

          {!config.usarMesmoEspacamentoBorda && (
            <div className="space-y-1 ml-6">
              <div className="flex items-center gap-1">
                <Label htmlFor="margemBorda">Margem de Borda (mm)</Label>
                <InfoTooltip
                  title="Margem de Borda Customizada"
                  content="Distância mínima entre as peças e as bordas da chapa. Útil quando precisa de margem maior ou menor que o espaçamento entre peças."
                />
              </div>
              <Input
                id="margemBorda"
                type="number"
                value={margemBordaInput.inputValue}
                onChange={margemBordaInput.handleChange}
                onBlur={margemBordaInput.handleBlur}
                min="0"
                max={VALIDATION_RULES.espacamento.max}
                step="1"
                className={cn(margemBordaInput.hasError && "border-destructive focus-visible:ring-destructive")}
              />
              {margemBordaInput.hasError && margemBordaInput.errorMessage && (
                <p className="text-xs text-destructive mt-1">{margemBordaInput.errorMessage}</p>
              )}
              <SanitizationAlert
                alert={margemBordaInput.sanitizationAlert}
                onDismiss={margemBordaInput.dismissSanitizationAlert}
              />
            </div>
          )}
        </div>

        <div className="pt-2 border-t">
          <h3 className="text-xs font-semibold mb-2">Velocidades e Potência</h3>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Label htmlFor="feedrate">Vel. Avanço - mm/min</Label>
                <InfoTooltip
                  title={parametrosInfo.feedrate.title}
                  content={parametrosInfo.feedrate.content}
                />
              </div>
              <Input
                id="feedrate"
                type="number"
                value={feedrateInput.inputValue}
                onChange={feedrateInput.handleChange}
                onBlur={feedrateInput.handleBlur}
                min={VALIDATION_RULES.feedrate.min}
                max={VALIDATION_RULES.feedrate.max}
                step="100"
                className={cn(feedrateInput.hasError && "border-destructive focus-visible:ring-destructive")}
              />
              {feedrateInput.hasError && feedrateInput.errorMessage && (
                <p className="text-xs text-destructive mt-1">{feedrateInput.errorMessage}</p>
              )}
              <SanitizationAlert
                alert={feedrateInput.sanitizationAlert}
                onDismiss={feedrateInput.dismissSanitizationAlert}
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Label htmlFor="plungeRate">Vel. Mergulho - mm/min</Label>
                <InfoTooltip
                  title={parametrosInfo.plungeRate.title}
                  content={parametrosInfo.plungeRate.content}
                />
              </div>
              <Input
                id="plungeRate"
                type="number"
                value={plungeRateInput.inputValue}
                onChange={plungeRateInput.handleChange}
                onBlur={plungeRateInput.handleBlur}
                min={VALIDATION_RULES.plungeRate.min}
                max={VALIDATION_RULES.plungeRate.max}
                step="50"
                className={cn(plungeRateInput.hasError && "border-destructive focus-visible:ring-destructive")}
              />
              {plungeRateInput.hasError && plungeRateInput.errorMessage && (
                <p className="text-xs text-destructive mt-1">{plungeRateInput.errorMessage}</p>
              )}
              <SanitizationAlert
                alert={plungeRateInput.sanitizationAlert}
                onDismiss={plungeRateInput.dismissSanitizationAlert}
              />
            </div>
          </div>

          <div className="space-y-1 mt-2.5">
            <div className="flex items-center gap-1">
              <Label htmlFor="rapidsSpeed">Vel. Rápida - mm/min</Label>
              <InfoTooltip
                title={parametrosInfo.rapidsSpeed.title}
                content={parametrosInfo.rapidsSpeed.content}
              />
            </div>
            <Input
              id="rapidsSpeed"
              type="number"
              value={rapidsSpeedInput.inputValue}
              onChange={rapidsSpeedInput.handleChange}
              onBlur={rapidsSpeedInput.handleBlur}
              min={VALIDATION_RULES.rapidsSpeed.min}
              max={VALIDATION_RULES.rapidsSpeed.max}
              step="100"
              className={cn(rapidsSpeedInput.hasError && "border-destructive focus-visible:ring-destructive")}
            />
            {rapidsSpeedInput.hasError && rapidsSpeedInput.errorMessage && (
              <p className="text-xs text-destructive mt-1">{rapidsSpeedInput.errorMessage}</p>
            )}
            <SanitizationAlert
              alert={rapidsSpeedInput.sanitizationAlert}
              onDismiss={rapidsSpeedInput.dismissSanitizationAlert}
            />
          </div>

          <div className="space-y-1 mt-2">
            <div className="flex items-center gap-1">
              <Label htmlFor="spindleSpeed">Rotação - RPM</Label>
              <InfoTooltip
                title={parametrosInfo.spindleSpeed.title}
                content={parametrosInfo.spindleSpeed.content}
              />
            </div>
            <Input
              id="spindleSpeed"
              type="number"
              value={spindleSpeedInput.inputValue}
              onChange={spindleSpeedInput.handleChange}
              onBlur={spindleSpeedInput.handleBlur}
              min={VALIDATION_RULES.spindleSpeed.min}
              max={VALIDATION_RULES.spindleSpeed.max}
              step="1000"
              className={cn(spindleSpeedInput.hasError && "border-destructive focus-visible:ring-destructive")}
            />
            {spindleSpeedInput.hasError && spindleSpeedInput.errorMessage && (
              <p className="text-xs text-destructive mt-1">{spindleSpeedInput.errorMessage}</p>
            )}
            <SanitizationAlert
              alert={spindleSpeedInput.sanitizationAlert}
              onDismiss={spindleSpeedInput.dismissSanitizationAlert}
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
              <div className="space-y-3 ml-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="aplicarRampaEm">Aplicar Rampa</Label>
                    <InfoTooltip
                      title="Quando Aplicar Rampa"
                      content="Escolha se a rampa deve ser aplicada apenas na primeira passada ou em todas as passadas. Aplicar em todas as passadas protege mais a ferramenta, mas aumenta o tempo de usinagem."
                    />
                  </div>
                  <Select
                    value={config.aplicarRampaEm}
                    onValueChange={(value) => handleSelectChange("aplicarRampaEm", value as AplicarRampaEm)}
                  >
                    <SelectTrigger id="aplicarRampaEm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primeira-passada">Primeira passada</SelectItem>
                      <SelectItem value="todas-passadas">Todas as passadas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="tipoRampa">Tipo de Rampa</Label>
                    <InfoTooltip
                      title="Tipo de Rampa"
                      content="Escolha entre rampa linear (descida suave em linha reta) ou zig-zag (descida com oscilação lateral para melhor remoção de cavaco)."
                    />
                  </div>
                  <Select
                    value={config.tipoRampa ?? 'linear'}
                    onValueChange={(value) => handleSelectChange("tipoRampa", value as TipoRampa)}
                  >
                    <SelectTrigger id="tipoRampa">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linear">Linear</SelectItem>
                      <SelectItem value="zigzag">Zig-Zag</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(config.tipoRampa ?? 'linear') === 'linear' && (
                  <div className="space-y-1">
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
                      value={anguloRampaInput.inputValue}
                      onChange={anguloRampaInput.handleChange}
                      onBlur={anguloRampaInput.handleBlur}
                      min={VALIDATION_RULES.anguloRampa.min}
                      max={VALIDATION_RULES.anguloRampa.max}
                      step="0.5"
                      className={cn(anguloRampaInput.hasError && "border-destructive focus-visible:ring-destructive")}
                    />
                    {anguloRampaInput.hasError && anguloRampaInput.errorMessage && (
                      <p className="text-xs text-destructive mt-1">{anguloRampaInput.errorMessage}</p>
                    )}
                    <SanitizationAlert
                      alert={anguloRampaInput.sanitizationAlert}
                      onDismiss={anguloRampaInput.dismissSanitizationAlert}
                    />
                    <div className="text-xs text-muted-foreground mt-1 p-2 bg-muted rounded">
                      Recomendado: 3° (equilíbrio ideal). Mínimo: 2° (mais suave). Máximo: 5° (mais rápido)
                    </div>
                  </div>
                )}

                {(config.tipoRampa ?? 'linear') === 'zigzag' && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Label htmlFor="zigZagDistancia">Distância do Zigue (mm)</Label>
                        <InfoTooltip
                          title={parametrosInfo.zigZagDistancia?.title || "Distância do Zigue"}
                          content={parametrosInfo.zigZagDistancia?.content || "Comprimento de cada movimento de vai-e-vem do zig-zag."}
                        />
                      </div>
                      <Input
                        id="zigZagDistancia"
                        type="number"
                        value={zigZagDistanciaInput.inputValue}
                        onChange={zigZagDistanciaInput.handleChange}
                        onBlur={zigZagDistanciaInput.handleBlur}
                        min={VALIDATION_RULES.zigZagDistancia.min}
                        max={VALIDATION_RULES.zigZagDistancia.max}
                        step="0.5"
                        className={cn(zigZagDistanciaInput.hasError && "border-destructive focus-visible:ring-destructive")}
                      />
                      {zigZagDistanciaInput.hasError && zigZagDistanciaInput.errorMessage && (
                        <p className="text-xs text-destructive mt-1">{zigZagDistanciaInput.errorMessage}</p>
                      )}
                      <SanitizationAlert
                        alert={zigZagDistanciaInput.sanitizationAlert}
                        onDismiss={zigZagDistanciaInput.dismissSanitizationAlert}
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Label htmlFor="anguloRampaZigZag">Ângulo de Descida (°)</Label>
                        <InfoTooltip
                          title={parametrosInfo.anguloRampaZigZag?.title || "Ângulo de Descida"}
                          content={parametrosInfo.anguloRampaZigZag?.content || "Ângulo de inclinação da rampa zig-zag. Valores menores geram descida mais suave."}
                        />
                      </div>
                      <Input
                        id="anguloRampaZigZag"
                        type="number"
                        value={anguloRampaZigZagInput.inputValue}
                        onChange={anguloRampaZigZagInput.handleChange}
                        onBlur={anguloRampaZigZagInput.handleBlur}
                        min={VALIDATION_RULES.anguloRampaZigZag.min}
                        max={VALIDATION_RULES.anguloRampaZigZag.max}
                        step="1"
                        className={cn(anguloRampaZigZagInput.hasError && "border-destructive focus-visible:ring-destructive")}
                      />
                      {anguloRampaZigZagInput.hasError && anguloRampaZigZagInput.errorMessage && (
                        <p className="text-xs text-destructive mt-1">{anguloRampaZigZagInput.errorMessage}</p>
                      )}
                      <SanitizationAlert
                        alert={anguloRampaZigZagInput.sanitizationAlert}
                        onDismiss={anguloRampaZigZagInput.dismissSanitizationAlert}
                      />
                    </div>

                    {/* Distância Total Calculada (readonly, como no Aspire) */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Label>Distância Total Calculada</Label>
                        <InfoTooltip
                          title="Distância Total"
                          content="Distância total que a ferramenta percorrerá durante a rampa zig-zag, calculada automaticamente baseado na profundidade e ângulo."
                        />
                      </div>
                      <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-md border">
                        {(() => {
                          const angulo = config.anguloRampaZigZag ?? 20;
                          const prof = config.profundidadePorPassada ?? 3.75;
                          const anguloRad = (angulo * Math.PI) / 180;
                          const distTotal = prof / Math.tan(anguloRad);
                          return `${distTotal.toFixed(1)} mm`;
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
