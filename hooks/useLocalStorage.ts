import { useState, useEffect, useRef } from 'react';

/**
 * Hook para persistir estado no localStorage com debounce
 * @param key - Chave do localStorage
 * @param initialValue - Valor inicial se não houver nada salvo
 * @param debounceMs - Delay do debounce em milissegundos (padrão: 500ms)
 * @returns [value, setValue] - Estado e função para atualizar
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  debounceMs: number = 500
): [T, (value: T) => void] {
  // Sempre começa com initialValue para evitar mismatch de hidratação
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);
  const saveTimerRef = useRef<NodeJS.Timeout>();

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

  // Limpa timer pendente quando componente desmontar
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  // Função para atualizar o valor com debounce
  const setValue = (value: T) => {
    try {
      // Atualiza estado imediatamente (não debounced)
      setStoredValue(value);

      // Salva no localStorage com debounce
      if (isHydrated) {
        // Cancela timer anterior se existir
        if (saveTimerRef.current) {
          clearTimeout(saveTimerRef.current);
        }

        // Agenda novo save
        saveTimerRef.current = setTimeout(() => {
          try {
            window.localStorage.setItem(key, JSON.stringify(value));
          } catch (error) {
            console.warn(`Erro ao salvar ${key} no localStorage:`, error);
          }
        }, debounceMs);
      }
    } catch (error) {
      console.warn(`Erro ao processar ${key}:`, error);
    }
  };

  return [storedValue, setValue];
}
