import { useState, useEffect, useCallback } from 'react';
import { validateField, type FieldValidationResult, VALIDATION_RULES } from '@/lib/validation-rules';

/**
 * Hook para inputs validados com comportamento CONSISTENTE
 *
 * Comportamento UNIFORME para TODOS os campos:
 * - onChange: Permite digitar livremente (inclusive apagar tudo)
 * - onBlur: Valida e mostra erro, mas SALVA o valor mesmo se inválido
 * - Valores vazios SÃO salvos e mostram erro
 * - Valores inválidos SÃO salvos e mostram erro
 * - NÃO sanitiza automaticamente
 * - Usuário deve corrigir manualmente
 *
 * @param value - Valor atual do campo
 * @param onChange - Callback para propagar TODAS as mudanças (válidas ou não)
 * @param fieldName - Nome do campo para validação
 * @returns Estado e handlers para o input
 */
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

  // Sincroniza com valor externo (quando muda por outra fonte)
  useEffect(() => {
    // Só atualiza se não estiver com foco/editando
    if (!isTouched) {
      // Se valor é 0 e tinha erro de campo vazio, mantém vazio visualmente
      if (value === 0 && hasError && inputValue === '') {
        setInputValue('');
      } else {
        setInputValue(value.toString());
      }
    }
  }, [value, isTouched, hasError, inputValue]);

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

  // Handler para onBlur: Valida e mostra erro, MAS SALVA MESMO ASSIM
  const handleBlur = useCallback(() => {
    setIsTouched(false);

    // Valida o campo
    const validation = validateField(fieldName, inputValue);

    if (!validation.valid) {
      // Campo inválido/vazio: MOSTRA ERRO mas SALVA o valor mesmo assim
      setHasError(true);
      setErrorMessage(validation.error || 'Valor inválido');

      // SALVA o valor inválido/vazio (SEM sanitizar)
      if (inputValue === '' || inputValue === null || inputValue === undefined) {
        // Salva 0 para campo vazio (mas mantém erro)
        onChange(0);
      } else {
        const numValue = parseFloat(inputValue);
        if (!isNaN(numValue)) {
          // Salva o número (mesmo que fora do range)
          onChange(numValue);
        } else {
          // Valor não numérico: salva 0 (mas mantém erro)
          onChange(0);
        }
      }
      return;
    }

    // Campo válido: limpa erro e salva
    setHasError(false);
    setErrorMessage('');

    // Converte para número e propaga
    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue)) {
      onChange(numValue);
    }
  }, [inputValue, fieldName, onChange]);

  return {
    inputValue,
    hasError,
    errorMessage,
    handleChange,
    handleBlur,
  };
}
