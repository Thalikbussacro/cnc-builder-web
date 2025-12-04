import { useState, useCallback, useMemo } from 'react';

/**
 * Hook otimizado para persistir estado no localStorage
 *
 * Melhorias:
 * - Lazy initialization: só lê localStorage uma vez (no mount)
 * - Debounce de escritas: evita salvar a cada keystroke
 * - Memoização: previne re-criação de funções
 *
 * @param key - Chave do localStorage
 * @param initialValue - Valor inicial se não houver nada salvo
 * @returns [value, setValue] - Estado e função para atualizar
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Lazy initialization (só lê localStorage uma vez)
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Debounce de escritas (evita salvar a cada keystroke)
  const debouncedSave = useMemo(
    () => debounce((value: T) => {
        try {
          window.localStorage.setItem(key, JSON.stringify(value));
        } catch {
          // Ignore quota errors
        }
      }, 500),
    [key]
  );

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    debouncedSave(valueToStore);
  }, [storedValue, debouncedSave]);

  return [storedValue, setValue] as const;
}

// Helper debounce
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
