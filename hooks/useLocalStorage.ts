import { useState, useCallback, useMemo, useEffect } from 'react';

/**
 * Hook para persistir estado no localStorage com debounce.
 * Evita problemas de hydration iniciando sempre com initialValue.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsedValue = JSON.parse(item);
        // Valida se o tipo corresponde ao initialValue
        if (typeof parsedValue === typeof initialValue) {
          setStoredValue(parsedValue);
        } else {
          // Tipo inválido - remove do localStorage e usa initialValue
          window.localStorage.removeItem(key);
        }
      }
    } catch {
      // Erro de parse - remove do localStorage
      window.localStorage.removeItem(key);
    }
  }, [key, initialValue]);

  const debouncedSave = useMemo(
    () => debounce((value: T) => {
        if (typeof window === 'undefined') return;
        try {
          window.localStorage.setItem(key, JSON.stringify(value));
        } catch {
          // Ignora erros de quota
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
