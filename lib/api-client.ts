import type { Peca, PecaPosicionada, ConfiguracoesChapa, ConfiguracoesCorte, ConfiguracoesFerramenta, TempoEstimado, MetodoNesting, ValidationResult } from '@/types';

export interface ValidationResponse extends ValidationResult {
  preview?: {
    tempoEstimado: TempoEstimado;
    metricas: {
      areaUtilizada: number;
      eficiencia: number;
      tempo: number;
    };
    pecasPosicionadas: PecaPosicionada[];
    pecasNaoCouberam: Peca[];
  };
}

// Validação da API URL com fallback seguro
const API_BASE_URL = (() => {
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  try {
    new URL(url);
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      throw new Error('URL deve começar com http:// ou https://');
    }
    // Remove trailing slash para evitar double slashes
    return url.replace(/\/+$/, '');
  } catch (error) {
    console.error('NEXT_PUBLIC_API_URL inválida, usando fallback:', error);
    return 'http://localhost:3001';
  }
})();

const DEFAULT_TIMEOUT = 30000; // 30 segundos

export interface GerarGCodeRequest {
  pecas: Peca[];
  configChapa?: Partial<ConfiguracoesChapa>;
  configCorte?: Partial<ConfiguracoesCorte>;
  configFerramenta?: Partial<ConfiguracoesFerramenta>;
  metodoNesting?: MetodoNesting;
  incluirComentarios?: boolean;
}

export interface ValidateRequest {
  pecas: Peca[];
  configChapa?: Partial<ConfiguracoesChapa>;
  configCorte?: Partial<ConfiguracoesCorte>;
  configFerramenta?: Partial<ConfiguracoesFerramenta>;
  metodoNesting?: MetodoNesting;
}

export interface Metricas {
  totalPecas: number;
  pecasPosicionadas: number;
  pecasNaoCouberam: number;
  areaUtilizada: number;
  areaTotal: number;
  percentualAproveitamento: number;
  numeroPassadas: number;
}

export interface ConfiguracoesUsadas {
  chapa: ConfiguracoesChapa;
  corte: ConfiguracoesCorte;
  ferramenta: ConfiguracoesFerramenta;
  metodoNesting: MetodoNesting;
}

export interface GerarGCodeResponse {
  gcode: string;
  metadata: {
    linhas: number;
    tamanhoBytes: number;
    tempoEstimado: TempoEstimado;
    metricas: Metricas;
    configuracoes: ConfiguracoesUsadas;
  };
}

export class ApiClient {
  // Rate limiting client-side (previne sobrecarga do backend)
  private static lastRequestTime = 0;
  private static readonly MIN_REQUEST_INTERVAL = 100; // ms entre requests

  /**
   * Get the stored auth token from localStorage
   */
  private static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth-token');
  }

  /**
   * Store auth token in localStorage
   */
  private static setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth-token', token);
  }

  /**
   * Remove auth token from localStorage
   */
  private static clearToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth-token');
  }

  /**
   * Throttle interno para prevenir sobrecarga do backend
   * Garante intervalo mínimo entre requests
   */
  private static async throttle(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Cria um fetch com timeout e throttling
   */
  private static async fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
    // Aplica throttling antes de fazer o request
    await this.throttle();

    // Inject auth token if available
    const token = this.getToken();
    if (token && options.headers) {
      const headers = new Headers(options.headers);
      if (!headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      options.headers = headers;
    } else if (token) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Timeout: A requisição demorou muito para responder'));
      }, timeout);

      fetch(url, options)
        .then(response => {
          clearTimeout(timer);

          // Handle 401 Unauthorized - clear token and redirect to login
          if (response.status === 401) {
            this.clearToken();
            if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }

          resolve(response);
        })
        .catch(err => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  /**
   * Valida resposta da API
   */
  private static validateGCodeResponse(data: unknown): GerarGCodeResponse {
    // Validação básica da estrutura
    if (!data || typeof data !== 'object') {
      throw new Error('Resposta da API inválida: formato incorreto');
    }

    const response = data as Record<string, unknown>;

    // Valida campos obrigatórios
    if (typeof response.gcode !== 'string') {
      throw new Error('Resposta da API inválida: G-code ausente ou inválido');
    }

    if (!response.metadata || typeof response.metadata !== 'object') {
      throw new Error('Resposta da API inválida: metadata ausente');
    }

    const metadata = response.metadata as Record<string, unknown>;

    if (typeof metadata.linhas !== 'number' || typeof metadata.tamanhoBytes !== 'number') {
      throw new Error('Resposta da API inválida: metadata incompleta');
    }

    // Retorna com tipo seguro
    return response as unknown as GerarGCodeResponse;
  }

  /**
   * Gera G-code via API
   */
  static async gerarGCode(request: GerarGCodeRequest, timeout = DEFAULT_TIMEOUT): Promise<GerarGCodeResponse> {
    try {
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/api/gcode/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        },
        timeout
      );

      if (!response.ok) {
        let errorMessage = 'Erro ao gerar G-code';

        try {
          const error = await response.json();
          // Sanitiza mensagem de erro (remove detalhes técnicos)
          errorMessage = error.error || error.message || errorMessage;
        } catch {
          // Se não conseguir parsear o erro, usa mensagem genérica baseada no status
          if (response.status === 500) {
            errorMessage = 'Erro interno do servidor';
          } else if (response.status === 400) {
            errorMessage = 'Requisição inválida';
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      return this.validateGCodeResponse(data);
    } catch (error) {
      // Re-throw erros conhecidos
      if (error instanceof Error) {
        throw error;
      }

      // Erro desconhecido
      throw new Error('Erro ao se comunicar com a API');
    }
  }

  /**
   * Valida configurações e retorna dados de preview
   * Útil para feedback em tempo real no frontend
   */
  static async validate(request: ValidateRequest, timeout = 10000): Promise<ValidationResponse> {
    try {
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/api/gcode/validate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        },
        timeout
      );

      if (!response.ok) {
        throw new Error('Erro ao validar configurações');
      }

      const data = await response.json();
      return data as ValidationResponse;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao se comunicar com a API');
    }
  }

  /**
   * Health check da API
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/health`,
        {},
        5000 // 5 segundos para health check
      );

      if (!response.ok) return false;

      const data = await response.json();
      return data.status === 'ok';
    } catch {
      return false;
    }
  }

  // ============================================
  // Authentication Endpoints
  // ============================================

  /**
   * Sign up a new user with email and password
   */
  static async signup(email: string, name: string, password: string): Promise<{ message: string }> {
    const response = await this.fetchWithTimeout(
      `${API_BASE_URL}/api/auth/signup`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password, confirmPassword: password }),
      },
      DEFAULT_TIMEOUT
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao criar conta');
    }

    return response.json();
  }

  /**
   * Login with email and password
   */
  static async login(email: string, password: string): Promise<{
    token: string;
    user: {
      id: string;
      email: string;
      name: string;
      image?: string | null;
      emailVerified?: string | null;
    };
  }> {
    const response = await this.fetchWithTimeout(
      `${API_BASE_URL}/api/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      },
      DEFAULT_TIMEOUT
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao fazer login');
    }

    const data = await response.json();
    this.setToken(data.token);
    return data;
  }

  /**
   * Verify email with verification token
   */
  static async verifyEmail(token: string): Promise<{
    token: string;
    user: {
      id: string;
      email: string;
      name: string;
      image?: string | null;
    };
  }> {
    const response = await this.fetchWithTimeout(
      `${API_BASE_URL}/api/auth/verify-email`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      },
      DEFAULT_TIMEOUT
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao verificar email');
    }

    const data = await response.json();
    this.setToken(data.token);
    return data;
  }

  /**
   * Request password reset email
   */
  static async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await this.fetchWithTimeout(
      `${API_BASE_URL}/api/auth/forgot-password`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      },
      DEFAULT_TIMEOUT
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao solicitar reset de senha');
    }

    return response.json();
  }

  /**
   * Reset password with reset token
   */
  static async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const response = await this.fetchWithTimeout(
      `${API_BASE_URL}/api/auth/reset-password`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword: password }),
      },
      DEFAULT_TIMEOUT
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao redefinir senha');
    }

    return response.json();
  }

  /**
   * Authenticate with Google OAuth
   */
  static async googleLogin(googleIdToken: string): Promise<{
    token: string;
    user: {
      id: string;
      email: string;
      name: string;
      image?: string | null;
    };
  }> {
    const response = await this.fetchWithTimeout(
      `${API_BASE_URL}/api/auth/google`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: googleIdToken }),
      },
      DEFAULT_TIMEOUT
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao fazer login com Google');
    }

    const data = await response.json();
    this.setToken(data.token);
    return data;
  }

  /**
   * Get current authenticated user
   */
  static async getMe(): Promise<{
    user: {
      id: string;
      email: string;
      name: string;
      image?: string | null;
      emailVerified?: string | null;
    };
  }> {
    const response = await this.fetchWithTimeout(
      `${API_BASE_URL}/api/auth/me`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      },
      DEFAULT_TIMEOUT
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao buscar usuário');
    }

    return response.json();
  }

  /**
   * Logout user (clear token)
   */
  static logout(): void {
    this.clearToken();
  }

  // ============================================
  // Projects Endpoints
  // ============================================

  /**
   * Get all projects for the authenticated user
   */
  static async getProjects(params?: {
    limit?: number;
    offset?: number;
    favorites?: boolean;
  }): Promise<{ projects: any[] }> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    if (params?.favorites) searchParams.set('favorites', 'true');

    const query = searchParams.toString();
    const endpoint = query ? `/api/projects?${query}` : '/api/projects';

    const response = await this.fetchWithTimeout(
      `${API_BASE_URL}${endpoint}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      },
      DEFAULT_TIMEOUT
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao buscar projetos');
    }

    return response.json();
  }

  /**
   * Get a specific project by ID
   */
  static async getProject(id: string): Promise<{ project: any }> {
    const response = await this.fetchWithTimeout(
      `${API_BASE_URL}/api/projects/${id}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      },
      DEFAULT_TIMEOUT
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao buscar projeto');
    }

    return response.json();
  }

  /**
   * Create a new project
   */
  static async createProject(data: {
    name: string;
    description?: string;
    config_chapa: any;
    config_corte: any;
    config_ferramenta: any;
    metodo_nesting: 'greedy' | 'shelf' | 'guillotine';
    pecas: any[];
    tags?: string[];
  }): Promise<{ project: any }> {
    const response = await this.fetchWithTimeout(
      `${API_BASE_URL}/api/projects`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      DEFAULT_TIMEOUT
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao criar projeto');
    }

    return response.json();
  }

  /**
   * Update an existing project
   */
  static async updateProject(id: string, data: Partial<{
    name: string;
    description: string;
    config_chapa: any;
    config_corte: any;
    config_ferramenta: any;
    metodo_nesting: 'greedy' | 'shelf' | 'guillotine';
    pecas: any[];
    tags: string[];
    is_favorite: boolean;
  }>): Promise<{ project: any }> {
    const response = await this.fetchWithTimeout(
      `${API_BASE_URL}/api/projects/${id}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      DEFAULT_TIMEOUT
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao atualizar projeto');
    }

    return response.json();
  }

  /**
   * Delete a project
   */
  static async deleteProject(id: string): Promise<{ success: boolean }> {
    const response = await this.fetchWithTimeout(
      `${API_BASE_URL}/api/projects/${id}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      },
      DEFAULT_TIMEOUT
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao deletar projeto');
    }

    return response.json();
  }

  // ============================================
  // Presets Endpoints
  // ============================================

  /**
   * Get all presets for the authenticated user
   */
  static async getPresets(params?: { favorites?: boolean }): Promise<{ presets: any[] }> {
    const searchParams = new URLSearchParams();
    if (params?.favorites) searchParams.set('favorites', 'true');

    const query = searchParams.toString();
    const endpoint = query ? `/api/presets?${query}` : '/api/presets';

    const response = await this.fetchWithTimeout(
      `${API_BASE_URL}${endpoint}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      },
      DEFAULT_TIMEOUT
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao buscar presets');
    }

    return response.json();
  }

  /**
   * Get a specific preset by ID
   */
  static async getPreset(id: string): Promise<{ preset: any }> {
    const response = await this.fetchWithTimeout(
      `${API_BASE_URL}/api/presets/${id}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      },
      DEFAULT_TIMEOUT
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao buscar preset');
    }

    return response.json();
  }

  /**
   * Create a new preset
   */
  static async createPreset(data: {
    name: string;
    description?: string;
    config_chapa: any;
    config_corte: any;
    config_ferramenta: any;
  }): Promise<{ preset: any }> {
    const response = await this.fetchWithTimeout(
      `${API_BASE_URL}/api/presets`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      DEFAULT_TIMEOUT
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao criar preset');
    }

    return response.json();
  }

  /**
   * Update an existing preset
   */
  static async updatePreset(id: string, data: Partial<{
    name: string;
    description: string;
    config_chapa: any;
    config_corte: any;
    config_ferramenta: any;
    is_favorite: boolean;
  }>): Promise<{ preset: any }> {
    const response = await this.fetchWithTimeout(
      `${API_BASE_URL}/api/presets/${id}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      DEFAULT_TIMEOUT
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao atualizar preset');
    }

    return response.json();
  }

  /**
   * Delete a preset
   */
  static async deletePreset(id: string): Promise<{ success: boolean }> {
    const response = await this.fetchWithTimeout(
      `${API_BASE_URL}/api/presets/${id}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      },
      DEFAULT_TIMEOUT
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao deletar preset');
    }

    return response.json();
  }

  // ============================================
  // Preferences Endpoints
  // ============================================

  /**
   * Get user preferences
   */
  static async getPreferences(): Promise<{ preferences: any | null }> {
    const response = await this.fetchWithTimeout(
      `${API_BASE_URL}/api/preferences`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      },
      DEFAULT_TIMEOUT
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao buscar preferências');
    }

    return response.json();
  }

  /**
   * Update user preferences (upsert)
   */
  static async updatePreferences(data: {
    default_versao_gerador?: 'v1' | 'v2';
    default_incluir_comentarios?: boolean;
    default_metodo_nesting?: 'greedy' | 'shelf' | 'guillotine';
    default_config_chapa?: any;
    default_config_corte?: any;
    default_config_ferramenta?: any;
    theme?: 'light' | 'dark' | 'system';
  }): Promise<{ preferences: any }> {
    const response = await this.fetchWithTimeout(
      `${API_BASE_URL}/api/preferences`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      },
      DEFAULT_TIMEOUT
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao atualizar preferências');
    }

    return response.json();
  }
}
