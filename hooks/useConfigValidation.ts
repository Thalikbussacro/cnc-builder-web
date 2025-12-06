import { useState, useCallback } from 'react';
import { ApiClient } from '@/lib/api-client';
import { useConfigStore } from '@/stores/useConfigStore';
import type { Peca, ConfiguracoesChapa, ConfiguracoesCorte, ConfiguracoesFerramenta, MetodoNesting } from '@/types';

type PendingChange = {
  type: 'chapa' | 'corte' | 'ferramenta' | 'nesting';
  previousValue: any;
  newValue: any;
  pecasQueNaoCabem: Peca[];
};

export function useConfigValidation() {
  const { pecas, configChapa, configCorte, configFerramenta, metodoNesting } = useConfigStore();
  const [pendingChange, setPendingChange] = useState<PendingChange | null>(null);

  // Valida se as peças atuais ainda cabem com as novas configurações
  const validateConfig = useCallback(async (
    newConfigChapa?: Partial<ConfiguracoesChapa>,
    newConfigCorte?: Partial<ConfiguracoesCorte>,
    newConfigFerramenta?: Partial<ConfiguracoesFerramenta>,
    newMetodoNesting?: MetodoNesting
  ): Promise<{ cabem: boolean; pecasNaoCouberam: Peca[] }> => {
    try {
      // Se não há peças, sempre cabe
      if (pecas.length === 0) {
        return { cabem: true, pecasNaoCouberam: [] };
      }

      const resultado = await ApiClient.validate({
        pecas: pecas.filter(p => !p.ignorada),
        configChapa: { ...configChapa, ...newConfigChapa },
        configCorte: { ...configCorte, ...newConfigCorte },
        configFerramenta: { ...configFerramenta, ...newConfigFerramenta },
        metodoNesting: newMetodoNesting || metodoNesting,
      });

      const pecasNaoCouberam = resultado.preview?.pecasNaoCouberam ?? [];
      return {
        cabem: pecasNaoCouberam.length === 0,
        pecasNaoCouberam,
      };
    } catch (error) {
      console.error('Erro ao validar configurações:', error);
      // Em caso de erro, permite a mudança (fail-safe)
      return { cabem: true, pecasNaoCouberam: [] };
    }
  }, [pecas, configChapa, configCorte, configFerramenta, metodoNesting]);

  // Valida mudança na chapa
  const validateChapaChange = useCallback(async (
    newConfig: Partial<ConfiguracoesChapa>
  ): Promise<boolean> => {
    const { cabem, pecasNaoCouberam } = await validateConfig(newConfig);

    if (!cabem) {
      setPendingChange({
        type: 'chapa',
        previousValue: configChapa,
        newValue: { ...configChapa, ...newConfig },
        pecasQueNaoCabem: pecasNaoCouberam,
      });
      return false; // Não aplica ainda
    }

    return true; // Pode aplicar diretamente
  }, [configChapa, validateConfig]);

  // Valida mudança no corte
  const validateCorteChange = useCallback(async (
    newConfig: Partial<ConfiguracoesCorte>
  ): Promise<boolean> => {
    const { cabem, pecasNaoCouberam } = await validateConfig(undefined, newConfig);

    if (!cabem) {
      setPendingChange({
        type: 'corte',
        previousValue: configCorte,
        newValue: { ...configCorte, ...newConfig },
        pecasQueNaoCabem: pecasNaoCouberam,
      });
      return false;
    }

    return true;
  }, [configCorte, validateConfig]);

  // Valida mudança na ferramenta
  const validateFerramentaChange = useCallback(async (
    newConfig: Partial<ConfiguracoesFerramenta>
  ): Promise<boolean> => {
    const { cabem, pecasNaoCouberam } = await validateConfig(undefined, undefined, newConfig);

    if (!cabem) {
      setPendingChange({
        type: 'ferramenta',
        previousValue: configFerramenta,
        newValue: { ...configFerramenta, ...newConfig },
        pecasQueNaoCabem: pecasNaoCouberam,
      });
      return false;
    }

    return true;
  }, [configFerramenta, validateConfig]);

  // Valida mudança no método de nesting
  const validateNestingChange = useCallback(async (
    newMetodo: MetodoNesting
  ): Promise<boolean> => {
    const { cabem, pecasNaoCouberam } = await validateConfig(undefined, undefined, undefined, newMetodo);

    if (!cabem) {
      setPendingChange({
        type: 'nesting',
        previousValue: metodoNesting,
        newValue: newMetodo,
        pecasQueNaoCabem: pecasNaoCouberam,
      });
      return false;
    }

    return true;
  }, [metodoNesting, validateConfig]);

  // Limpa mudança pendente (cancelar)
  const cancelPendingChange = useCallback(() => {
    setPendingChange(null);
  }, []);

  return {
    pendingChange,
    validateChapaChange,
    validateCorteChange,
    validateFerramentaChange,
    validateNestingChange,
    cancelPendingChange,
  };
}
