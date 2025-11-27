"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

/**
 * Tipo para abas que podem ter erros
 */
export type TabId = 'chapa' | 'corte' | 'ferramenta' | 'nesting';

/**
 * Mapa de erros por aba
 * Chave: ID da aba
 * Valor: Set de campos com erro naquela aba
 */
type TabErrors = Record<TabId, Set<string>>;

/**
 * Contexto para rastrear erros de validação globalmente
 */
type ValidationContextType = {
  /**
   * Registra um erro em um campo de uma aba
   */
  registerError: (tab: TabId, field: string) => void;

  /**
   * Limpa o erro de um campo de uma aba
   */
  clearError: (tab: TabId, field: string) => void;

  /**
   * Verifica se existem erros em qualquer aba
   */
  hasErrors: () => boolean;

  /**
   * Retorna array com IDs das abas que têm erros
   */
  getTabsWithErrors: () => TabId[];

  /**
   * Verifica se uma aba específica tem erros
   */
  tabHasErrors: (tab: TabId) => boolean;
};

const ValidationContext = createContext<ValidationContextType | null>(null);

/**
 * Provider do contexto de validação
 */
export function ValidationProvider({ children }: { children: ReactNode }) {
  const [tabErrors, setTabErrors] = useState<TabErrors>({
    chapa: new Set(),
    corte: new Set(),
    ferramenta: new Set(),
    nesting: new Set(),
  });

  /**
   * Registra erro em um campo
   */
  const registerError = useCallback((tab: TabId, field: string) => {
    setTabErrors(prev => {
      const newErrors = { ...prev };
      newErrors[tab] = new Set(prev[tab]);
      newErrors[tab].add(field);
      return newErrors;
    });
  }, []);

  /**
   * Limpa erro de um campo
   */
  const clearError = useCallback((tab: TabId, field: string) => {
    setTabErrors(prev => {
      const newErrors = { ...prev };
      newErrors[tab] = new Set(prev[tab]);
      newErrors[tab].delete(field);
      return newErrors;
    });
  }, []);

  /**
   * Verifica se há erros em qualquer aba
   */
  const hasErrors = useCallback(() => {
    return Object.values(tabErrors).some(errors => errors.size > 0);
  }, [tabErrors]);

  /**
   * Retorna abas que têm erros
   */
  const getTabsWithErrors = useCallback((): TabId[] => {
    return (Object.keys(tabErrors) as TabId[]).filter(
      tab => tabErrors[tab].size > 0
    );
  }, [tabErrors]);

  /**
   * Verifica se aba específica tem erros
   */
  const tabHasErrors = useCallback((tab: TabId) => {
    return tabErrors[tab].size > 0;
  }, [tabErrors]);

  return (
    <ValidationContext.Provider
      value={{
        registerError,
        clearError,
        hasErrors,
        getTabsWithErrors,
        tabHasErrors,
      }}
    >
      {children}
    </ValidationContext.Provider>
  );
}

/**
 * Hook para usar o contexto de validação
 */
export function useValidationContext() {
  const context = useContext(ValidationContext);
  if (!context) {
    throw new Error('useValidationContext must be used within ValidationProvider');
  }
  return context;
}
