import type { Peca, ConfiguracoesChapa, ConfiguracoesCorte, ConfiguracoesFerramenta, TempoEstimado } from '@/types';
import type { MetodoNesting } from '@/lib/nesting-algorithm';
import type { ValidationResult } from '@/lib/validator';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
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
  /**
   * Cria um fetch com timeout
   */
  private static fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Timeout: A requisição demorou muito para responder'));
      }, timeout);

      fetch(url, options)
        .then(response => {
          clearTimeout(timer);
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
    return response as GerarGCodeResponse;
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
   * Valida configurações sem gerar G-code
   * Útil para feedback em tempo real no frontend
   */
  static async validate(request: ValidateRequest, timeout = 10000): Promise<ValidationResult> {
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
      return data as ValidationResult;
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
}
