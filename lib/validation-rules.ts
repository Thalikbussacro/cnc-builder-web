/**
 * Regras de validação para parâmetros de corte CNC
 *
 * IMPORTANTE: Estes valores podem ser ajustados conforme necessário.
 * Cada regra define limites mínimos, máximos e valores recomendados.
 */

export const VALIDATION_RULES = {
  // ========================================================================
  // PROFUNDIDADE
  // ========================================================================
  profundidade: {
    min: 1,             // mm - Mínimo: 1mm
    max: 50,            // mm - Máximo razoável para CNC comum
    recomendadoMin: 1,  // mm - Mínimo recomendado
    recomendadoMax: 30, // mm - Máximo recomendado
  },

  // ========================================================================
  // PROFUNDIDADE POR PASSADA
  // ========================================================================
  profundidadePorPassada: {
    min: 1,             // mm - Mínimo: 1mm
    max: 10,            // mm - Máximo razoável
    recomendadoMin: 1,  // mm - Mínimo recomendado
    recomendadoMax: 5,  // mm - Máximo recomendado (depende do material)
    // Relação com diâmetro da fresa (profundidade < X% do diâmetro)
    maxPercentualDiametro: 50, // % - Avisar se > 50% do diâmetro
  },

  // ========================================================================
  // ESPAÇAMENTO ENTRE PEÇAS
  // ========================================================================
  espacamento: {
    min: 0,             // mm - Pode ser zero (peças coladas)
    max: 500,           // mm - Máximo razoável
    recomendadoMin: 10, // mm - Mínimo recomendado (margem de segurança)
    recomendadoMax: 100,// mm - Máximo recomendado
  },

  // ========================================================================
  // FEEDRATE (Velocidade de avanço)
  // ========================================================================
  feedrate: {
    min: 50,            // mm/min - Mínimo técnico
    max: 5000,          // mm/min - Máximo razoável
    recomendadoMin: 500,  // mm/min - Mínimo recomendado
    recomendadoMax: 3000, // mm/min - Máximo recomendado (materiais duros)
  },

  // ========================================================================
  // PLUNGE RATE (Velocidade de mergulho)
  // ========================================================================
  plungeRate: {
    min: 50,            // mm/min - Mínimo técnico
    max: 2000,          // mm/min - Máximo razoável
    recomendadoMin: 100,  // mm/min - Mínimo recomendado
    recomendadoMax: 1000, // mm/min - Máximo recomendado
    // Relação com feedrate (plunge = X% a Y% do feedrate)
    percentualFeedrateMin: 20, // % - Mínimo recomendado
    percentualFeedrateMax: 70, // % - Máximo recomendado
  },

  // ========================================================================
  // RAPIDS SPEED (Velocidade de movimento rápido)
  // ========================================================================
  rapidsSpeed: {
    min: 500,           // mm/min - Mínimo técnico
    max: 15000,         // mm/min - Máximo razoável
    recomendadoMin: 2000,  // mm/min - Mínimo recomendado
    recomendadoMax: 10000, // mm/min - Máximo recomendado
  },

  // ========================================================================
  // SPINDLE SPEED (Rotação do spindle)
  // ========================================================================
  spindleSpeed: {
    min: 1000,          // RPM - Mínimo técnico
    max: 30000,         // RPM - Máximo razoável
    recomendadoMin: 10000,  // RPM - Mínimo recomendado
    recomendadoMax: 24000,  // RPM - Máximo recomendado
  },

  // ========================================================================
  // ÂNGULO DA RAMPA
  // ========================================================================
  anguloRampa: {
    min: 1,             // graus - Mínimo: 1 grau
    max: 10,            // graus - Máximo razoável
    recomendadoMin: 2,  // graus - Mínimo recomendado (conservador)
    recomendadoMax: 5,  // graus - Máximo recomendado (equilibrado)
    avisoConservador: 2, // graus - Avisar se < 2° (rampa muito longa)
    avisoAgressivo: 5,   // graus - Avisar se > 5° (rampa agressiva)
  },

  // ========================================================================
  // DIÂMETRO DA FRESA
  // ========================================================================
  diametroFresa: {
    min: 1,             // mm - Mínimo: 1mm
    max: 25,            // mm - Máximo razoável
    recomendadoMin: 3,  // mm - Mínimo recomendado
    recomendadoMax: 12, // mm - Máximo recomendado
  },

  // ========================================================================
  // NÚMERO DA FERRAMENTA
  // ========================================================================
  numeroFerramenta: {
    min: 1,             // Número mínimo
    max: 99,            // Número máximo (padrão CNC)
  },

  // ========================================================================
  // ESPESSURA DA CHAPA
  // ========================================================================
  espessuraChapa: {
    min: 1,             // mm - Mínimo: 1mm
    max: 50,            // mm - Máximo razoável
    recomendadoMin: 3,  // mm - Mínimo recomendado
    recomendadoMax: 30, // mm - Máximo recomendado
  },

  // ========================================================================
  // DIMENSÕES DA CHAPA
  // ========================================================================
  chapaLargura: {
    min: 10,            // mm - Mínimo técnico
    max: 10000,         // mm - Máximo razoável (10 metros)
  },

  chapaAltura: {
    min: 10,            // mm - Mínimo técnico
    max: 10000,         // mm - Máximo razoável (10 metros)
  },

  // ========================================================================
  // MARGEM DE BORDA
  // ========================================================================
  margemBorda: {
    min: 0,             // mm - Pode ser zero
    max: 500,           // mm - Máximo razoável
  },

  // ========================================================================
  // NÚMERO DE PASSADAS
  // ========================================================================
  numeroPassadas: {
    min: 1,             // Mínimo: 1 passada
    max: 100,           // Máximo razoável: 100 passadas
  },
} as const;

/**
 * Mensagens de erro/aviso padronizadas
 */
export const VALIDATION_MESSAGES = {
  // Erros críticos
  profundidadeZero: 'Profundidade não pode ser zero ou negativa',
  profundidadePassadaZero: 'Profundidade por passada não pode ser zero ou negativa',
  profundidadePassadaMaiorQueTotal: 'Profundidade por passada não pode ser maior que profundidade total',
  feedrateZero: 'Velocidade de avanço não pode ser zero',
  plungeRateZero: 'Velocidade de mergulho não pode ser zero',
  spindleSpeedZero: 'Rotação do spindle não pode ser zero',
  diametroFresaZero: 'Diâmetro da fresa não pode ser zero',
  nenhumaPecaAdicionada: 'Nenhuma peça foi adicionada',
  nenhumaPecaPosicionada: 'Nenhuma peça coube na chapa',
  todasPecasPequenasParaRampa: 'Todas as peças são pequenas demais para rampa',

  // Avisos
  plungeRateMaiorQueFeedrate: 'Velocidade de mergulho está maior que velocidade de avanço',
  profundidadeMaiorQueEspessura: 'Profundidade de corte é maior que espessura da chapa',
  feedrateMuitoAlto: 'Velocidade de avanço muito alta para materiais duros',
  spindleSpeedMuitoBaixo: 'Rotação do spindle está muito baixa',
  anguloRampaConservador: 'Ângulo da rampa muito baixo (rampa será muito longa)',
  anguloRampaAgressivo: 'Ângulo da rampa agressivo (pode estressar a ferramenta)',
  algumasPecasPequenasParaRampa: 'Algumas peças usarão mergulho vertical (tamanho insuficiente para rampa)',
} as const;

/**
 * Tipo para resultado de validação de campo individual
 */
export type FieldValidationResult = {
  valid: boolean;
  error?: string;
};

/**
 * Valida um campo individual contra suas regras
 * @param fieldName - Nome do campo (chave em VALIDATION_RULES)
 * @param value - Valor a ser validado
 * @returns Resultado da validação com mensagem de erro se inválido
 */
export function validateField(
  fieldName: keyof typeof VALIDATION_RULES,
  value: number | string | null | undefined
): FieldValidationResult {
  const rules = VALIDATION_RULES[fieldName];

  // Valores vazios SEMPRE são inválidos
  if (value === null || value === undefined || value === '') {
    return {
      valid: false,
      error: 'Campo obrigatório'
    };
  }

  // Converte para número se necessário
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  // Verifica se é um número válido
  if (isNaN(numValue)) {
    return {
      valid: false,
      error: 'Valor inválido'
    };
  }

  // Valida mínimo
  if ('min' in rules && numValue < rules.min) {
    return {
      valid: false,
      error: `Valor mínimo: ${rules.min}`
    };
  }

  // Valida máximo
  if ('max' in rules && numValue > rules.max) {
    return {
      valid: false,
      error: `Valor máximo: ${rules.max}`
    };
  }

  return { valid: true };
}

/**
 * Sanitiza um valor numérico para ficar dentro dos limites permitidos
 * IMPORTANTE: Use isso antes de enviar dados para API para evitar travamentos
 * @param fieldName - Nome do campo (chave em VALIDATION_RULES)
 * @param value - Valor a ser sanitizado
 * @returns Valor sanitizado (limitado ao range permitido)
 */
export function sanitizeValue(
  fieldName: keyof typeof VALIDATION_RULES,
  value: number
): number {
  const rules = VALIDATION_RULES[fieldName];

  // Trata NaN ou valores inválidos usando o mínimo do campo
  if (isNaN(value) || !isFinite(value)) {
    return 'min' in rules ? rules.min : 0;
  }

  // Limita ao mínimo
  if ('min' in rules && value < rules.min) {
    return rules.min;
  }

  // Limita ao máximo
  if ('max' in rules && value > rules.max) {
    return rules.max;
  }

  return value;
}
