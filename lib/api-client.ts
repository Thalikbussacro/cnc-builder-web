import type { Peca, ConfiguracoesChapa, ConfiguracoesCorte, ConfiguracoesFerramenta } from '@/types';
import type { MetodoNesting } from '@/lib/nesting-algorithm';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface GerarGCodeRequest {
  pecas: Peca[];
  configChapa?: Partial<ConfiguracoesChapa>;
  configCorte?: Partial<ConfiguracoesCorte>;
  configFerramenta?: Partial<ConfiguracoesFerramenta>;
  metodoNesting?: MetodoNesting;
  incluirComentarios?: boolean;
}

export interface GerarGCodeResponse {
  gcode: string;
  metadata: {
    linhas: number;
    tamanhoBytes: number;
    tempoEstimado: any;
    metricas: any;
    configuracoes: any;
  };
}

export class ApiClient {
  /**
   * Gera G-code via API
   */
  static async gerarGCode(request: GerarGCodeRequest): Promise<GerarGCodeResponse> {
    const response = await fetch(`${API_BASE_URL}/api/gcode/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao gerar G-code');
    }

    return response.json();
  }

  /**
   * Health check da API
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      return data.status === 'ok';
    } catch {
      return false;
    }
  }
}
