import { useRef, useCallback } from 'react';

/**
 * Hook para throttle (limitação de frequência) de funções
 *
 * Throttle garante que a função seja executada no máximo uma vez
 * a cada intervalo de tempo especificado.
 *
 * Útil para prevenir sobrecarga de requests ao backend.
 *
 * @param callback - Função a ser throttled
 * @param delay - Intervalo mínimo entre execuções (ms)
 * @returns Função throttled que respeita o intervalo mínimo
 *
 * @example
 * const throttledSearch = useThrottle(searchFunction, 1000);
 * // searchFunction será executada no máximo 1 vez por segundo
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const lastRun = useRef(Date.now());

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = now;
      }
    },
    [callback, delay]
  );
}
