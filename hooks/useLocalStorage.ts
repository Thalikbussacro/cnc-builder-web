import { useState, useCallback, useMemo, useEffect } from 'react';

/**
 * Hook otimizado para persistir estado no localStorage
 *
 * Melhorias:
 * - Lazy initialization: só lê localStorage uma vez (no mount)
 * - Debounce de escritas: evita salvar a cada keystroke
 * - Memoização: previne re-criação de funções
 * - Hydration-safe: usa initialValue no SSR, lê localStorage só no cliente
 *
 * @param key - Chave do localStorage
 * @param initialValue - Valor inicial se não houver nada salvo
 * @returns [value, setValue] - Estado e função para atualizar
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Always start with initialValue to avoid hydration mismatch
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Load from localStorage only after mount (client-side)
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch {
      // Ignore errors
    }
  }, [key]);

  // Debounce de escritas (evita salvar a cada keystroke)
  const debouncedSave = useMemo(
    () => debounce((value: T) => {
        if (typeof window === 'undefined') return;
        try {
          window.localStorage.setItem(key, JSON.stringify(value));
        } catch {
          // Ignore quota errors
        }
      }, 500),
    [key]
  );

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    setStoredValue((prev) => {
      const valueToStore = value instanceof Function ? value(prev) : value;
      debouncedSave(valueToStore);
      return valueToStore;
    });
  }, [debouncedSave]);

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
