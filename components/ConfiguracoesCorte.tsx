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
import type { ConfiguracoesCorte, AplicarRampaEm } from "@/types";
import type { ValidationField } from "@/lib/validator";
import { cn } from "@/lib/utils";
import { useValidatedInput } from "@/hooks/useValidatedInput";
import { useValidationContext } from "@/contexts/ValidationContext";

type ConfiguracoesCorteProps = {
  config: ConfiguracoesCorte;
  onChange: (config: ConfiguracoesCorte) => void;
  errorFields?: ValidationField[];
};

export function ConfiguracoesCorte({ config, onChange, errorFields = [] }: ConfiguracoesCorteProps) {
  const { registerError, clearError } = useValidationContext();

  // Constante para tolerância de ponto flutuante
  const FLOATING_POINT_TOLERANCE = 0.01;

  // Calcula número de passadas baseado na profundidade total e profundidade por passada
  // Usa Math.round com tolerância para evitar erros de arredondamento
  // Ex: 16/5.33 = 3.0018... deve mostrar 3, não 4
  const numeroPassadas = React.useMemo(() => {
    // Se algum valor for inválido (0, negativo, NaN, Infinity), retorna 1
    if (!config.profundidade || !config.profundidadePorPassada ||
        config.profundidade <= 0 || config.profundidadePorPassada <= 0 ||
        !isFinite(config.profundidade) || !isFinite(config.profundidadePorPassada)) {
      return 1;
    }
    const resultado = Math.round(config.profundidade / config.profundidadePorPassada + FLOATING_POINT_TOLERANCE);
    // Garante que seja no mínimo 1 e finito
    return (resultado > 0 && isFinite(resultado)) ? resultado : 1;
  }, [config.profundidade, config.profundidadePorPassada]);

  // Estado local para permitir edição do campo de passadas
  const [numeroPassadasTemp, setNumeroPassadasTemp] = React.useState<string>(numeroPassadas.toString());

  // Atualiza o valor temporário quando o cálculo mudar (usuário mudou prof. ou prof./passada)
  React.useEffect(() => {
    setNumeroPassadasTemp(numeroPassadas.toString());
  }, [numeroPassadas]);

  // Validação de campos
  const profundidadeInput = useValidatedInput(
    config.profundidade,
    (value) => onChange({ ...config, profundidade: value }),
    'profundidade'
  );

  const profundidadePorPassadaInput = useValidatedInput(
    config.profundidadePorPassada,
    (value) => onChange({ ...config, profundidadePorPassada: value }),
    'profundidadePorPassada'
  );

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

  // Registra/limpa erros no contexto global
  useEffect(() => {
    if (profundidadeInput.hasError) {
      registerError('corte', 'profundidade');
    } else {
      clearError('corte', 'profundidade');
    }
  }, [profundidadeInput.hasError, registerError, clearError]);

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

  const handleNumeroPassadasChange = (valor: string) => {
    // Atualiza estado temporário (permite digitar livremente)
    setNumeroPassadasTemp(valor);

    // Permite string vazia temporariamente (enquanto usuário digita)
    if (valor === '') {
      return;
    }

    const numero = parseInt(valor);

    // Só valida se for um número válido e maior que zero
    if (isNaN(numero) || numero <= 0) {
      return; // Ignora valores inválidos mas mantém no campo
    }

    // Ao mudar número de passadas, recalcula profundidade por passada
    const novaProfundidadePorPassada = Math.round((config.profundidade / numero) * 100) / 100;
    onChange({ ...config, profundidadePorPassada: novaProfundidadePorPassada });
  };

  const handleCheckboxChange = (campo: keyof ConfiguracoesCorte, valor: boolean) => {
    onChange({ ...config, [campo]: valor });
  };

  const handleSelectChange = (campo: keyof ConfiguracoesCorte, valor: string) => {
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
            <Label htmlFor="profundidade">Profundidade</Label>
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
            min={VALIDATION_RULES.profundidade.min}
            max={VALIDATION_RULES.profundidade.max}
            step="1"
            className={cn(profundidadeInput.hasError && "border-destructive focus-visible:ring-destructive")}
          />
          {profundidadeInput.hasError && profundidadeInput.errorMessage && (
            <p className="text-xs text-destructive mt-1">{profundidadeInput.errorMessage}</p>
          )}
          <SanitizationAlert
            alert={profundidadeInput.sanitizationAlert}
            onDismiss={profundidadeInput.dismissSanitizationAlert}
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Label htmlFor="numeroPassadas">Nº Passadas</Label>
              <InfoTooltip
                title="Número de Passadas"
                content="Quantidade de vezes que a fresa descerá até atingir a profundidade total. Alterar este valor recalcula automaticamente a profundidade por passada."
              />
            </div>
            <Input
              id="numeroPassadas"
              type="number"
              value={numeroPassadasTemp}
              onChange={(e) => handleNumeroPassadasChange(e.target.value)}
              min="1"
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
              value={profundidadePorPassadaInput.inputValue}
              onChange={profundidadePorPassadaInput.handleChange}
              onBlur={profundidadePorPassadaInput.handleBlur}
              min={VALIDATION_RULES.profundidadePorPassada.min}
              max={VALIDATION_RULES.profundidadePorPassada.max}
              step="0.5"
              className={cn(profundidadePorPassadaInput.hasError && "border-destructive focus-visible:ring-destructive")}
            />
            {profundidadePorPassadaInput.hasError && profundidadePorPassadaInput.errorMessage && (
              <p className="text-xs text-destructive mt-1">{profundidadePorPassadaInput.errorMessage}</p>
            )}
            <SanitizationAlert
              alert={profundidadePorPassadaInput.sanitizationAlert}
              onDismiss={profundidadePorPassadaInput.dismissSanitizationAlert}
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <Label htmlFor="espacamento">Espaçamento entre Peças</Label>
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
            min={VALIDATION_RULES.espacamento.min}
            max={VALIDATION_RULES.espacamento.max}
            step="5"
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
                step="5"
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
                <Label htmlFor="feedrate">Vel. Avanço</Label>
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
                <Label htmlFor="plungeRate">Vel. Mergulho</Label>
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
              <Label htmlFor="rapidsSpeed">Vel. Rápida</Label>
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
              <Label htmlFor="spindleSpeed">Rotação</Label>
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
                checked={false}
                disabled={true}
                onCheckedChange={(checked) => handleCheckboxChange("usarRampa", checked as boolean)}
              />
              <Label
                htmlFor="usarRampa"
                className="text-sm font-normal cursor-not-allowed opacity-60"
              >
                Usar rampa de entrada
              </Label>
              <InfoTooltip
                title={parametrosInfo.usarRampa.title}
                content={parametrosInfo.usarRampa.content}
              />
            </div>

            <div className="ml-6 text-xs text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-2 rounded flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>
                <strong>Recurso em desenvolvimento:</strong> A rampa de entrada está temporariamente desabilitada enquanto implementamos melhorias na funcionalidade.
              </span>
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
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
