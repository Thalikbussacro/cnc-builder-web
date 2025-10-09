import { useState, useEffect } from 'react';

/**
 * Hook para persistir estado no localStorage
 * @param key - Chave do localStorage
 * @param initialValue - Valor inicial se não houver nada salvo
 * @returns [value, setValue] - Estado e função para atualizar
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Estado para armazenar nosso valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      // Tenta buscar do localStorage
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Erro ao carregar ${key} do localStorage:`, error);
      return initialValue;
    }
  });

  // Função para atualizar o valor
  const setValue = (value: T) => {
    try {
      // Salva no estado
      setStoredValue(value);

      // Salva no localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.warn(`Erro ao salvar ${key} no localStorage:`, error);
    }
  };

  return [storedValue, setValue];
}
