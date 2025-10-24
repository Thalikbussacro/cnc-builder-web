import type { ConfiguracoesChapa, ConfiguracoesCorte, ConfiguracoesFerramenta, PecaPosicionada } from "@/types";
import { VALIDATION_RULES, VALIDATION_MESSAGES } from "./validation-rules";

/**
 * Severidade do problema de validação
 */
export type ValidationSeverity = 'error' | 'warning';

/**
 * Campo que tem problema
 */
export type ValidationField =
  | 'profundidade'
  | 'profundidadePorPassada'
  | 'espacamento'
  | 'feedrate'
  | 'plungeRate'
  | 'rapidsSpeed'
  | 'spindleSpeed'
  | 'anguloRampa'
  | 'diametroFresa'
  | 'espessuraChapa'
  | 'pecas'
  | 'rampa';

/**
 * Problema de validação encontrado
 */
export type ValidationIssue = {
  severity: ValidationSeverity;
  field: ValidationField;
  message: string;
  suggestion: string; // Como corrigir
  currentValue?: number | string; // Valor atual problemático
  recommendedValue?: string; // Valor recomendado
};

/**
 * Resultado da validação
 */
export type ValidationResult = {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
};

/**
 * Valida todas as configurações antes de gerar G-code
 */
export function validateConfigurations(
  configChapa: ConfiguracoesChapa,
  configCorte: ConfiguracoesCorte,
  configFerramenta: ConfiguracoesFerramenta,
  pecasPosicionadas: PecaPosicionada[]
): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  // ========================================================================
  // VALIDAÇÕES CRÍTICAS (ERROS)
  // ========================================================================

  // Profundidade
  if (configCorte.profundidade <= 0) {
    errors.push({
      severity: 'error',
      field: 'profundidade',
      message: VALIDATION_MESSAGES.profundidadeZero,
      suggestion: `Ajuste para no mínimo ${VALIDATION_RULES.profundidade.min}mm`,
      currentValue: configCorte.profundidade,
      recommendedValue: '3mm ou mais',
    });
  }

  // Profundidade por passada
  if (configCorte.profundidadePorPassada <= 0) {
    errors.push({
      severity: 'error',
      field: 'profundidadePorPassada',
      message: VALIDATION_MESSAGES.profundidadePassadaZero,
      suggestion: `Ajuste para no mínimo ${VALIDATION_RULES.profundidadePorPassada.min}mm`,
      currentValue: configCorte.profundidadePorPassada,
      recommendedValue: '1-3mm',
    });
  }

  // Profundidade por passada > Profundidade total
  if (configCorte.profundidadePorPassada > configCorte.profundidade) {
    errors.push({
      severity: 'error',
      field: 'profundidadePorPassada',
      message: VALIDATION_MESSAGES.profundidadePassadaMaiorQueTotal,
      suggestion: `Reduza para no máximo ${configCorte.profundidade}mm (profundidade total)`,
      currentValue: configCorte.profundidadePorPassada,
      recommendedValue: `${configCorte.profundidade}mm ou menos`,
    });
  }

  // Feedrate
  if (configCorte.feedrate <= 0) {
    errors.push({
      severity: 'error',
      field: 'feedrate',
      message: VALIDATION_MESSAGES.feedrateZero,
      suggestion: `Ajuste para no mínimo ${VALIDATION_RULES.feedrate.min}mm/min`,
      currentValue: configCorte.feedrate,
      recommendedValue: '500-2000mm/min',
    });
  }

  // Plunge rate
  if (configCorte.plungeRate <= 0) {
    errors.push({
      severity: 'error',
      field: 'plungeRate',
      message: VALIDATION_MESSAGES.plungeRateZero,
      suggestion: `Ajuste para no mínimo ${VALIDATION_RULES.plungeRate.min}mm/min`,
      currentValue: configCorte.plungeRate,
      recommendedValue: '200-500mm/min',
    });
  }

  // Spindle speed
  if (configCorte.spindleSpeed <= 0) {
    errors.push({
      severity: 'error',
      field: 'spindleSpeed',
      message: VALIDATION_MESSAGES.spindleSpeedZero,
      suggestion: `Ajuste para no mínimo ${VALIDATION_RULES.spindleSpeed.min}RPM`,
      currentValue: configCorte.spindleSpeed,
      recommendedValue: '12000-18000RPM',
    });
  }

  // Diâmetro da fresa
  if (configFerramenta.diametro <= 0) {
    errors.push({
      severity: 'error',
      field: 'diametroFresa',
      message: VALIDATION_MESSAGES.diametroFresaZero,
      suggestion: `Ajuste para no mínimo ${VALIDATION_RULES.diametroFresa.min}mm`,
      currentValue: configFerramenta.diametro,
      recommendedValue: '6mm',
    });
  }

  // Peças
  if (pecasPosicionadas.length === 0) {
    errors.push({
      severity: 'error',
      field: 'pecas',
      message: VALIDATION_MESSAGES.nenhumaPecaPosicionada,
      suggestion: 'Adicione peças ou aumente o tamanho da chapa',
    });
  }

  // ========================================================================
  // VALIDAÇÕES DE RANGES (ERROS)
  // ========================================================================

  // Profundidade muito alta
  if (configCorte.profundidade > VALIDATION_RULES.profundidade.max) {
    errors.push({
      severity: 'error',
      field: 'profundidade',
      message: `Profundidade muito alta (máximo: ${VALIDATION_RULES.profundidade.max}mm)`,
      suggestion: `Reduza para no máximo ${VALIDATION_RULES.profundidade.max}mm`,
      currentValue: configCorte.profundidade,
      recommendedValue: `${VALIDATION_RULES.profundidade.max}mm ou menos`,
    });
  }

  // Feedrate muito alto
  if (configCorte.feedrate > VALIDATION_RULES.feedrate.max) {
    errors.push({
      severity: 'error',
      field: 'feedrate',
      message: `Velocidade de avanço muito alta (máximo: ${VALIDATION_RULES.feedrate.max}mm/min)`,
      suggestion: `Reduza para no máximo ${VALIDATION_RULES.feedrate.max}mm/min`,
      currentValue: configCorte.feedrate,
      recommendedValue: `${VALIDATION_RULES.feedrate.max}mm/min ou menos`,
    });
  }

  // Plunge rate muito alto
  if (configCorte.plungeRate > VALIDATION_RULES.plungeRate.max) {
    errors.push({
      severity: 'error',
      field: 'plungeRate',
      message: `Velocidade de mergulho muito alta (máximo: ${VALIDATION_RULES.plungeRate.max}mm/min)`,
      suggestion: `Reduza para no máximo ${VALIDATION_RULES.plungeRate.max}mm/min`,
      currentValue: configCorte.plungeRate,
      recommendedValue: `${VALIDATION_RULES.plungeRate.max}mm/min ou menos`,
    });
  }

  // Spindle speed muito alto
  if (configCorte.spindleSpeed > VALIDATION_RULES.spindleSpeed.max) {
    errors.push({
      severity: 'error',
      field: 'spindleSpeed',
      message: `Rotação muito alta (máximo: ${VALIDATION_RULES.spindleSpeed.max}RPM)`,
      suggestion: `Reduza para no máximo ${VALIDATION_RULES.spindleSpeed.max}RPM`,
      currentValue: configCorte.spindleSpeed,
      recommendedValue: `${VALIDATION_RULES.spindleSpeed.max}RPM ou menos`,
    });
  }

  // Ângulo da rampa fora do range
  if (configCorte.usarRampa) {
    if (configCorte.anguloRampa < VALIDATION_RULES.anguloRampa.min) {
      errors.push({
        severity: 'error',
        field: 'anguloRampa',
        message: `Ângulo da rampa muito baixo (mínimo: ${VALIDATION_RULES.anguloRampa.min}°)`,
        suggestion: `Aumente para no mínimo ${VALIDATION_RULES.anguloRampa.min}°`,
        currentValue: configCorte.anguloRampa,
        recommendedValue: `${VALIDATION_RULES.anguloRampa.recomendadoMin}° ou mais`,
      });
    }

    if (configCorte.anguloRampa > VALIDATION_RULES.anguloRampa.max) {
      errors.push({
        severity: 'error',
        field: 'anguloRampa',
        message: `Ângulo da rampa muito alto (máximo: ${VALIDATION_RULES.anguloRampa.max}°)`,
        suggestion: `Reduza para no máximo ${VALIDATION_RULES.anguloRampa.max}°`,
        currentValue: configCorte.anguloRampa,
        recommendedValue: `${VALIDATION_RULES.anguloRampa.recomendadoMax}° ou menos`,
      });
    }
  }

  // ========================================================================
  // VALIDAÇÕES DE AVISO (WARNINGS)
  // ========================================================================

  // Plunge rate maior que feedrate
  if (configCorte.plungeRate > configCorte.feedrate) {
    warnings.push({
      severity: 'warning',
      field: 'plungeRate',
      message: VALIDATION_MESSAGES.plungeRateMaiorQueFeedrate,
      suggestion: `Plunge rate geralmente deve ser 30-50% do feedrate`,
      currentValue: `Plunge: ${configCorte.plungeRate} | Feedrate: ${configCorte.feedrate}`,
      recommendedValue: `${Math.round(configCorte.feedrate * 0.4)}mm/min (40% do feedrate)`,
    });
  }

  // Profundidade maior que espessura
  if (configCorte.profundidade > configChapa.espessura * 1.1) {
    warnings.push({
      severity: 'warning',
      field: 'profundidade',
      message: VALIDATION_MESSAGES.profundidadeMaiorQueEspessura,
      suggestion: 'Você está cortando além da espessura da chapa. Isso está correto?',
      currentValue: `Profundidade: ${configCorte.profundidade}mm | Espessura: ${configChapa.espessura}mm`,
      recommendedValue: `${configChapa.espessura}mm (espessura da chapa)`,
    });
  }

  // Feedrate muito alto para materiais duros
  if (configCorte.feedrate > VALIDATION_RULES.feedrate.recomendadoMax) {
    warnings.push({
      severity: 'warning',
      field: 'feedrate',
      message: VALIDATION_MESSAGES.feedrateMuitoAlto,
      suggestion: `Valores acima de ${VALIDATION_RULES.feedrate.recomendadoMax}mm/min são agressivos`,
      currentValue: configCorte.feedrate,
      recommendedValue: `${VALIDATION_RULES.feedrate.recomendadoMax}mm/min ou menos`,
    });
  }

  // Spindle speed muito baixo
  if (configCorte.spindleSpeed < VALIDATION_RULES.spindleSpeed.recomendadoMin) {
    warnings.push({
      severity: 'warning',
      field: 'spindleSpeed',
      message: VALIDATION_MESSAGES.spindleSpeedMuitoBaixo,
      suggestion: `Rotações abaixo de ${VALIDATION_RULES.spindleSpeed.recomendadoMin}RPM podem causar acabamento ruim`,
      currentValue: configCorte.spindleSpeed,
      recommendedValue: `${VALIDATION_RULES.spindleSpeed.recomendadoMin}RPM ou mais`,
    });
  }

  // Ângulo da rampa muito conservador
  if (configCorte.usarRampa && configCorte.anguloRampa < VALIDATION_RULES.anguloRampa.avisoConservador) {
    warnings.push({
      severity: 'warning',
      field: 'anguloRampa',
      message: VALIDATION_MESSAGES.anguloRampaConservador,
      suggestion: `Ângulos abaixo de ${VALIDATION_RULES.anguloRampa.avisoConservador}° resultam em rampas muito longas`,
      currentValue: configCorte.anguloRampa,
      recommendedValue: `${VALIDATION_RULES.anguloRampa.recomendadoMin}° ou mais`,
    });
  }

  // Ângulo da rampa agressivo
  if (configCorte.usarRampa && configCorte.anguloRampa > VALIDATION_RULES.anguloRampa.avisoAgressivo) {
    warnings.push({
      severity: 'warning',
      field: 'anguloRampa',
      message: VALIDATION_MESSAGES.anguloRampaAgressivo,
      suggestion: `Ângulos acima de ${VALIDATION_RULES.anguloRampa.avisoAgressivo}° podem estressar a ferramenta`,
      currentValue: configCorte.anguloRampa,
      recommendedValue: `${VALIDATION_RULES.anguloRampa.recomendadoMax}° ou menos`,
    });
  }

  // Validação de rampa vs tamanho das peças
  if (configCorte.usarRampa && pecasPosicionadas.length > 0) {
    const anguloRadianos = (configCorte.anguloRampa * Math.PI) / 180;
    const distanciaRampaNecessaria = configCorte.profundidadePorPassada / Math.tan(anguloRadianos);

    let pecasPequenas = 0;
    pecasPosicionadas.forEach(peca => {
      const larguraSuficiente = peca.largura >= distanciaRampaNecessaria;
      const alturaSuficiente = peca.altura >= distanciaRampaNecessaria;
      if (!larguraSuficiente && !alturaSuficiente) {
        pecasPequenas++;
      }
    });

    if (pecasPequenas === pecasPosicionadas.length) {
      // Todas as peças são pequenas - ERRO
      errors.push({
        severity: 'error',
        field: 'rampa',
        message: VALIDATION_MESSAGES.todasPecasPequenasParaRampa,
        suggestion: `Aumente o tamanho das peças, reduza o ângulo da rampa, ou desative a rampa`,
        currentValue: `Rampa requer ${Math.round(distanciaRampaNecessaria)}mm mínimo`,
        recommendedValue: `Ângulo de 2° ou desative a rampa`,
      });
    } else if (pecasPequenas > 0) {
      // Algumas peças são pequenas
      // Se configurado para "todas passadas", isso é PROBLEMA sério
      if (configCorte.aplicarRampaEm === 'todas-passadas') {
        errors.push({
          severity: 'error',
          field: 'rampa',
          message: `Configurado "rampa em todas passadas" mas ${pecasPequenas} de ${pecasPosicionadas.length} peças não comportam rampa`,
          suggestion: `Você configurou para usar rampa em TODAS as passadas, mas ${pecasPequenas} peça(s) usarão mergulho vertical. Escolha uma opção:`,
          currentValue: `${pecasPequenas} peças menores que ${Math.round(distanciaRampaNecessaria)}mm`,
          recommendedValue: `1) Mudar para "Primeira passada" | 2) Aumentar peças | 3) Reduzir ângulo`,
        });
      } else {
        // Se configurado para "primeira passada", é apenas AVISO
        warnings.push({
          severity: 'warning',
          field: 'rampa',
          message: `${pecasPequenas} de ${pecasPosicionadas.length} peças usarão mergulho vertical na 1ª passada`,
          suggestion: `Peças menores que ${Math.round(distanciaRampaNecessaria)}mm (largura ou altura) não comportam rampa`,
          currentValue: `${pecasPequenas} peças pequenas`,
          recommendedValue: `Aumente tamanho das peças ou reduza ângulo da rampa`,
        });
      }
    }
  }

  // Validação de peças que ultrapassam limites da chapa com compensação
  if (pecasPosicionadas.length > 0 && configFerramenta.diametro > 0) {
    const raio = configFerramenta.diametro / 2;
    let pecasForaLimites = 0;
    const nomesProblematicas: string[] = [];

    pecasPosicionadas.forEach(peca => {
      // Apenas corte externo aumenta a área (compensação G42)
      if (peca.tipoCorte === 'externo') {
        const xMax = peca.x + peca.largura + raio;
        const yMax = peca.y + peca.altura + raio;
        const xMin = peca.x - raio;
        const yMin = peca.y - raio;

        if (xMax > configChapa.largura || yMax > configChapa.altura || xMin < 0 || yMin < 0) {
          pecasForaLimites++;
          nomesProblematicas.push(peca.nome || `Peça ${pecasPosicionadas.indexOf(peca) + 1}`);
        }
      }
    });

    if (pecasForaLimites > 0) {
      warnings.push({
        severity: 'warning',
        field: 'pecas',
        message: `${pecasForaLimites} peça(s) com compensação externa ultrapassam os limites da chapa`,
        suggestion: `Com compensação G42 (fresa D${configFerramenta.diametro}mm), as peças ocupam ${raio}mm a mais em cada lado. Peças problemáticas: ${nomesProblematicas.join(', ')}`,
        currentValue: `${pecasForaLimites} peças fora dos limites`,
        recommendedValue: `Reduza espaçamento, use peças menores, ou desative compensação`,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
