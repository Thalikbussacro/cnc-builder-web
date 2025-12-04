import { useEffect } from 'react';

interface Shortcuts {
  onGenerate?: () => void;
  onClear?: () => void;
  onClose?: () => void;
}

/**
 * Hook para atalhos de teclado globais
 *
 * Atalhos disponíveis:
 * - Ctrl/Cmd + Enter: Gerar G-code
 * - Ctrl/Cmd + K: Limpar peças
 * - Escape: Fechar modals
 */
export function useKeyboardShortcuts(shortcuts: Shortcuts) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter = Gerar G-code
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        shortcuts.onGenerate?.();
      }

      // Ctrl/Cmd + K = Limpar peças
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        shortcuts.onClear?.();
      }

      // Escape = Fechar modals
      if (e.key === 'Escape') {
        shortcuts.onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}
