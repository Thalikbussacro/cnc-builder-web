/**
 * Regras de validação frontend para parâmetros de corte CNC.
 * A validação definitiva é feita no backend.
 */

export const VALIDATION_RULES = {
  profundidade: {
    min: 1,
    max: 50,
    recomendadoMin: 1,
    recomendadoMax: 30,
  },

  profundidadePorPassada: {
    min: 1,
    max: 100,
    recomendadoMin: 1,
    recomendadoMax: 5,
    maxPercentualDiametro: 50,
  },

  espacamento: {
    min: 0,
    max: 500,
    recomendadoMin: 10,
    recomendadoMax: 100,
  },

  feedrate: {
    min: 50,
    max: 5000,
    recomendadoMin: 500,
    recomendadoMax: 3000,
  },

  plungeRate: {
    min: 50,
    max: 2000,
    recomendadoMin: 100,
    recomendadoMax: 1000,
    percentualFeedrateMin: 20,
    percentualFeedrateMax: 70,
  },

  rapidsSpeed: {
    min: 500,
    max: 15000,
    recomendadoMin: 2000,
    recomendadoMax: 10000,
  },

  spindleSpeed: {
    min: 1000,
    max: 30000,
    recomendadoMin: 10000,
    recomendadoMax: 24000,
  },

  anguloRampa: {
    min: 1,
    max: 10,
    recomendadoMin: 2,
    recomendadoMax: 5,
    avisoConservador: 2,
    avisoAgressivo: 5,
  },

  diametroFresa: {
    min: 1,
    max: 25,
    recomendadoMin: 3,
    recomendadoMax: 12,
  },

  numeroFerramenta: {
    min: 1,
    max: 99,
  },

  espessuraChapa: {
    min: 1,
    max: 50,
    recomendadoMin: 3,
    recomendadoMax: 30,
  },

  chapaLargura: {
    min: 10,
    max: 10000,
  },

  chapaAltura: {
    min: 10,
    max: 10000,
  },

  margemBorda: {
    min: 0,
    max: 500,
  },

  numeroPassadas: {
    min: 1,
    max: 100,
  },
} as const;

export type FieldValidationResult = {
  valid: boolean;
  error?: string;
};

export function validateField(
  fieldName: keyof typeof VALIDATION_RULES,
  value: number | string | null | undefined
): FieldValidationResult {
  const rules = VALIDATION_RULES[fieldName];

  if (value === null || value === undefined || value === '') {
    return {
      valid: false,
      error: 'Campo obrigatório'
    };
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return {
      valid: false,
      error: 'Valor inválido'
    };
  }

  if ('min' in rules && numValue < rules.min) {
    return {
      valid: false,
      error: `Valor mínimo: ${rules.min}`
    };
  }

  if ('max' in rules && numValue > rules.max) {
    return {
      valid: false,
      error: `Valor máximo: ${rules.max}`
    };
  }

  return { valid: true };
}

export function sanitizeValue(
  fieldName: keyof typeof VALIDATION_RULES,
  value: number
): number {
  const rules = VALIDATION_RULES[fieldName];

  if (isNaN(value) || !isFinite(value)) {
    return 'min' in rules ? rules.min : 0;
  }

  if ('min' in rules && value < rules.min) {
    return rules.min;
  }

  if ('max' in rules && value > rules.max) {
    return rules.max;
  }

  return value;
}
