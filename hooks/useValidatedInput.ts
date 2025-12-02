import { useState, useEffect, useCallback } from 'react';
import { validateField, sanitizeValue, type FieldValidationResult, VALIDATION_RULES } from '@/lib/validation-rules';

/**
 * Hook para inputs validados com comportamento CONSISTENTE
 *
 * Comportamento UNIFORME para TODOS os campos:
 * - onChange: Permite digitar livremente (inclusive apagar tudo)
 * - onBlur: Valida e mostra erro, SANITIZA e salva valor seguro
 * - Valores vazios são salvos como 0 e mostram erro
 * - Valores fora do range são SANITIZADOS (limitados ao min/max) mas mostram erro
 * - Valores absurdos NUNCA entram no estado (proteção contra travamentos)
 * - Usuário vê o erro mas o sistema fica protegido
 *
 * @param value - Valor atual do campo
 * @param onChange - Callback para propagar mudanças
 * @param fieldName - Nome do campo para validação
 * @returns Estado e handlers para o input
 */
export type SanitizationAlert = {
  show: boolean;
  message: string;
  originalValue: number;
  sanitizedValue: number;
};

export function useValidatedInput(
  value: number,
  onChange: (value: number) => void,
  fieldName: keyof typeof VALIDATION_RULES
) {
  // Valida valor inicial para determinar estado inicial
  const initialValidation = validateField(fieldName, value);
  const initialInputValue = value === 0 && !initialValidation.valid ? '' : value.toString();

  // Estado local para permitir edição livre
  const [inputValue, setInputValue] = useState<string>(initialInputValue);
  const [hasError, setHasError] = useState(!initialValidation.valid);
  const [errorMessage, setErrorMessage] = useState(initialValidation.error || '');
  const [isTouched, setIsTouched] = useState(false);

  // Estado para alerta de sanitização
  const [sanitizationAlert, setSanitizationAlert] = useState<SanitizationAlert>({
    show: false,
    message: '',
    originalValue: 0,
    sanitizedValue: 0,
  });

  // Sincroniza com valor externo (quando muda por outra fonte)
  useEffect(() => {
    // Só atualiza se não estiver com foco/editando
    if (!isTouched) {
      setInputValue(value.toString());
    }
  }, [value, isTouched]);

  // Handler para onChange: Permite digitar livremente
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsTouched(true);

    // Limpa erro enquanto digita (feedback visual melhor)
    if (hasError) {
      setHasError(false);
      setErrorMessage('');
    }
  }, [hasError]);

  // Handler para onBlur: Valida e mostra erro, SANITIZA e salva valor seguro
  const handleBlur = useCallback(() => {
    setIsTouched(false);

    // Converte para número (ou 0 se vazio/inválido)
    let numValue = 0;
    if (inputValue !== '' && inputValue !== null && inputValue !== undefined) {
      const parsed = parseFloat(inputValue);
      numValue = !isNaN(parsed) ? parsed : 0;
    }

    // SEMPRE SANITIZA antes de salvar (proteção contra valores absurdos)
    const sanitizedValue = sanitizeValue(fieldName, numValue);

    // Atualiza o campo visualmente com valor sanitizado
    setInputValue(sanitizedValue.toString());

    // Valida o VALOR SANITIZADO (não o original)
    const validation = validateField(fieldName, sanitizedValue);

    // Detecta se houve sanitização (campo estava vazio OU valor foi alterado)
    const wasSanitized = (inputValue === '' || inputValue === null || inputValue === undefined) || numValue !== sanitizedValue;

    if (wasSanitized) {
      // Busca os limites do campo para mensagem mais informativa
      const rules = VALIDATION_RULES[fieldName];
      let limitInfo = '';

      if ('min' in rules && sanitizedValue === rules.min) {
        limitInfo = `mínimo: ${rules.min}`;
      } else if ('max' in rules && sanitizedValue === rules.max) {
        limitInfo = `máximo: ${rules.max}`;
      }

      // Mostra alerta de sanitização
      setSanitizationAlert({
        show: true,
        message: `Valor ajustado automaticamente para ${sanitizedValue}${limitInfo ? ` (${limitInfo})` : ''}`,
        originalValue: numValue,
        sanitizedValue: sanitizedValue,
      });
    }

    if (!validation.valid) {
      // Campo inválido mesmo após sanitização (não deveria acontecer normalmente)
      setHasError(true);
      setErrorMessage(validation.error || 'Valor inválido');

      // Salva valor sanitizado (NUNCA salva valores absurdos)
      onChange(sanitizedValue);
      return;
    }

    // Campo válido após sanitização: limpa erro e salva valor
    setHasError(false);
    setErrorMessage('');
    onChange(sanitizedValue);
  }, [inputValue, fieldName, onChange]);

  // Handler para fechar o alerta de sanitização
  const dismissSanitizationAlert = useCallback(() => {
    setSanitizationAlert({
      show: false,
      message: '',
      originalValue: 0,
      sanitizedValue: 0,
    });
  }, []);

  return {
    inputValue,
    hasError,
    errorMessage,
    handleChange,
    handleBlur,
    sanitizationAlert,
    dismissSanitizationAlert,
  };
}
