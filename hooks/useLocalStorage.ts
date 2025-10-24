import { useState, useEffect } from 'react';

/**
 * Hook para persistir estado no localStorage
 * @param key - Chave do localStorage
 * @param initialValue - Valor inicial se não houver nada salvo
 * @returns [value, setValue] - Estado e função para atualizar
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Sempre começa com initialValue para evitar mismatch de hidratação
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  // Carrega do localStorage apenas no cliente após hidratação
  useEffect(() => {
    setIsHydrated(true);

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        // Mescla valores salvos com valores padrão (para adicionar campos novos)
        // Isso garante compatibilidade quando novos campos são adicionados
        const merged = { ...initialValue, ...parsed };
        setStoredValue(merged as T);

        // Salva de volta para atualizar com novos campos
        window.localStorage.setItem(key, JSON.stringify(merged));
      }
    } catch (error) {
      console.warn(`Erro ao carregar ${key} do localStorage:`, error);
    }
  }, [key]);

  // Função para atualizar o valor
  const setValue = (value: T) => {
    try {
      // Salva no estado
      setStoredValue(value);

      // Salva no localStorage
      if (isHydrated) {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.warn(`Erro ao salvar ${key} no localStorage:`, error);
    }
  };

  return [storedValue, setValue];
}
