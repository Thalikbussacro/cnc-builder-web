// types/database.ts
// Database types for CNC Builder persistence system

import type {
  ConfiguracoesChapa,
  ConfiguracoesCorte,
  ConfiguracoesFerramenta,
  MetodoNesting,
  Peca,
} from './index';

// ============================================
// PROJETOS
// ============================================
export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  config_chapa: ConfiguracoesChapa;
  config_corte: ConfiguracoesCorte;
  config_ferramenta: ConfiguracoesFerramenta;
  metodo_nesting: MetodoNesting;
  pecas: Peca[];
  created_at: string;
  updated_at: string;
  last_opened_at: string | null;
  is_favorite: boolean;
  tags: string[];
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  config_chapa: ConfiguracoesChapa;
  config_corte: ConfiguracoesCorte;
  config_ferramenta: ConfiguracoesFerramenta;
  metodo_nesting: MetodoNesting;
  pecas: Peca[];
  tags?: string[];
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  config_chapa?: ConfiguracoesChapa;
  config_corte?: ConfiguracoesCorte;
  config_ferramenta?: ConfiguracoesFerramenta;
  metodo_nesting?: MetodoNesting;
  pecas?: Peca[];
  is_favorite?: boolean;
  tags?: string[];
}

// ============================================
// PRESETS (SEMPRE COMPLETOS)
// ============================================
export interface ConfigPreset {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  config_chapa: ConfiguracoesChapa;
  config_corte: ConfiguracoesCorte;
  config_ferramenta: ConfiguracoesFerramenta;
  created_at: string;
  updated_at: string;
  is_favorite: boolean;
}

export interface CreatePresetInput {
  name: string;
  description?: string;
  config_chapa: ConfiguracoesChapa;
  config_corte: ConfiguracoesCorte;
  config_ferramenta: ConfiguracoesFerramenta;
}

export interface UpdatePresetInput {
  name?: string;
  description?: string;
  config_chapa?: ConfiguracoesChapa;
  config_corte?: ConfiguracoesCorte;
  config_ferramenta?: ConfiguracoesFerramenta;
  is_favorite?: boolean;
}

// ============================================
// PREFERÊNCIAS
// ============================================
export interface UserPreferences {
  user_id: string;
  default_versao_gerador: 'v1' | 'v2' | null;
  default_incluir_comentarios: boolean;
  default_metodo_nesting: MetodoNesting | null;
  default_config_chapa: ConfiguracoesChapa | null;
  default_config_corte: ConfiguracoesCorte | null;
  default_config_ferramenta: ConfiguracoesFerramenta | null;
  theme: 'light' | 'dark' | 'system' | null;
  updated_at: string;
}

export interface UpdateUserPreferencesInput {
  default_versao_gerador?: 'v1' | 'v2';
  default_incluir_comentarios?: boolean;
  default_metodo_nesting?: MetodoNesting;
  default_config_chapa?: ConfiguracoesChapa;
  default_config_corte?: ConfiguracoesCorte;
  default_config_ferramenta?: ConfiguracoesFerramenta;
  theme?: 'light' | 'dark' | 'system';
}
