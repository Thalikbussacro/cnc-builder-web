import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Peca, ConfiguracoesChapa, ConfiguracoesCorte, ConfiguracoesFerramenta, MetodoNesting } from '@/types';

interface ConfigStore {
  // Estado
  configChapa: ConfiguracoesChapa;
  configCorte: ConfiguracoesCorte;
  configFerramenta: ConfiguracoesFerramenta;
  metodoNesting: MetodoNesting;
  pecas: Peca[];

  // Actions
  setConfigChapa: (config: Partial<ConfiguracoesChapa>) => void;
  setConfigCorte: (config: Partial<ConfiguracoesCorte>) => void;
  setConfigFerramenta: (config: Partial<ConfiguracoesFerramenta>) => void;
  setMetodoNesting: (metodo: MetodoNesting) => void;
  addPeca: (peca: Peca | Peca[]) => void;
  removePeca: (id: string) => void;
  updatePeca: (id: string, updates: Partial<Peca>) => void;
  setPecas: (pecas: Peca[]) => void;
  reset: () => void;
}

const defaultChapa: ConfiguracoesChapa = {
  largura: 2850,
  altura: 1500,
  espessura: 15,
};

const defaultCorte: ConfiguracoesCorte = {
  profundidade: 15,
  espacamento: 50,
  numeroPassadas: 4,
  profundidadePorPassada: 3.75,
  feedrate: 1500,
  plungeRate: 500,
  rapidsSpeed: 4000,
  spindleSpeed: 18000,
  usarRampa: false,
  tipoRampa: 'linear',
  anguloRampa: 3,
  aplicarRampaEm: 'primeira-passada',
  zigZagDistancia: 5,        // mm - Distância de cada zigue
  anguloRampaZigZag: 20,     // graus - Ângulo de descida do zig-zag
  usarMesmoEspacamentoBorda: true,
  margemBorda: 50,
};

const defaultFerramenta: ConfiguracoesFerramenta = {
  diametro: 6,
  numeroFerramenta: 1,
};

const defaultMetodoNesting: MetodoNesting = 'shelf';

export const useConfigStore = create<ConfigStore>()(
  persist(
    (set) => ({
      // Estado inicial
      configChapa: defaultChapa,
      configCorte: defaultCorte,
      configFerramenta: defaultFerramenta,
      metodoNesting: defaultMetodoNesting,
      pecas: [],

      // Actions
      setConfigChapa: (config) =>
        set((state) => ({
          configChapa: { ...state.configChapa, ...config },
        })),

      setConfigCorte: (config) =>
        set((state) => ({
          configCorte: { ...state.configCorte, ...config },
        })),

      setConfigFerramenta: (config) =>
        set((state) => ({
          configFerramenta: { ...state.configFerramenta, ...config },
        })),

      setMetodoNesting: (metodo) => set({ metodoNesting: metodo }),

      addPeca: (peca) =>
        set((state) => ({
          pecas: Array.isArray(peca) ? [...state.pecas, ...peca] : [...state.pecas, peca],
        })),

      removePeca: (id) =>
        set((state) => ({ pecas: state.pecas.filter((p) => p.id !== id) })),

      updatePeca: (id, updates) =>
        set((state) => ({
          pecas: state.pecas.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),

      setPecas: (pecas) => set({ pecas }),

      reset: () =>
        set({
          configChapa: defaultChapa,
          configCorte: defaultCorte,
          configFerramenta: defaultFerramenta,
          metodoNesting: defaultMetodoNesting,
          pecas: [],
        }),
    }),
    {
      name: 'cnc-config-storage',
      version: 3,
      partialize: (state) => ({
        configChapa: state.configChapa,
        configCorte: state.configCorte,
        configFerramenta: state.configFerramenta,
        metodoNesting: state.metodoNesting,
        pecas: state.pecas,
      }),
      migrate: (persistedState: any, version: number) => {
        // Garante que persistedState existe
        if (!persistedState) {
          return persistedState;
        }
        
        // Migração versão 0 → 1: adiciona numeroPassadas
        if (version === 0) {
          if (persistedState?.configCorte && !persistedState.configCorte.numeroPassadas) {
            // Calcula numeroPassadas baseado nos valores existentes
            const prof = persistedState.configCorte.profundidade || 15;
            const profPorPassada = persistedState.configCorte.profundidadePorPassada || 3.75;
            persistedState.configCorte.numeroPassadas = Math.max(1, Math.round(prof / profPorPassada));
          }
          // Atualiza versão para continuar migração
          version = 1;
        }
        
        // Migração versão 1 → 2: adiciona campos zig-zag antigos (amplitude/pitch/maxStepZ)
        if (version === 1) {
          // Garante que configCorte existe
          if (!persistedState.configCorte) {
            persistedState.configCorte = {};
          }
          
          // Inicializa tipoRampa se não existir ou for null/undefined
          if (persistedState.configCorte.tipoRampa === undefined || persistedState.configCorte.tipoRampa === null) {
            persistedState.configCorte.tipoRampa = 'linear';
          }
          
          // Atualiza versão para continuar migração
          version = 2;
        }
        
        // Migração versão 2 → 3: substitui amplitude/pitch/maxStepZ por distancia/angulo
        if (version === 2) {
          // Garante que configCorte existe
          if (!persistedState.configCorte) {
            persistedState.configCorte = {};
          }
          
          // Remove campos antigos se existirem
          delete persistedState.configCorte.zigZagAmplitude;
          delete persistedState.configCorte.zigZagPitch;
          delete persistedState.configCorte.maxRampStepZ;
          
          // Inicializa novos parâmetros zig-zag
          if (persistedState.configCorte.zigZagDistancia === undefined || persistedState.configCorte.zigZagDistancia === null) {
            persistedState.configCorte.zigZagDistancia = 5;
          }
          
          if (persistedState.configCorte.anguloRampaZigZag === undefined || persistedState.configCorte.anguloRampaZigZag === null) {
            persistedState.configCorte.anguloRampaZigZag = 20;
          }
        }
        
        return persistedState;
      },
    }
  )
);
