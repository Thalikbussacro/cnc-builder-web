/**
 * Tipo de corte: como a fresa deve cortar em relação à marcação
 */
export type TipoCorte = 'externo' | 'interno' | 'na-linha';

/**
 * Representa uma peça retangular a ser cortada
 */
export type Peca = {
  largura: number;
  altura: number;
  tipoCorte: TipoCorte;
  id: string; // UUID para React keys
  nome?: string; // Nome customizável da peça
};

/**
 * Representa uma peça já posicionada na chapa
 */
export type PecaPosicionada = {
  x: number;
  y: number;
  largura: number;
  altura: number;
  tipoCorte: TipoCorte;
  id: string;
  nome?: string; // Nome customizável da peça
};

/**
 * Configurações da chapa de metal
 */
export type ConfiguracoesChapa = {
  largura: number;
  altura: number;
  espessura: number;
};

/**
 * Configurações do processo de corte
 */
export type ConfiguracoesCorte = {
  profundidade: number;
  espacamento: number;
  profundidadePorPassada: number;  // mm - Quanto desce em cada passada
  feedrate: number;                 // mm/min - Velocidade de avanço durante corte
  plungeRate: number;               // mm/min - Velocidade de descida (mergulho) no eixo Z
  spindleSpeed: number;             // RPM - Rotação da fresa
  usarRampa: boolean;               // Ativar rampa de entrada ao invés de mergulho vertical
  anguloRampa: number;              // graus - Ângulo da rampa de entrada (2° a 5°)
};

/**
 * Formatos disponíveis para exportação de G-code
 */
export type FormatoArquivo = 'nc' | 'tap' | 'gcode' | 'cnc';

/**
 * Versões do gerador de G-code
 */
export type VersaoGerador = 'v1' | 'v2';

/**
 * Informações sobre cada versão do gerador
 */
export type InfoVersaoGerador = {
  versao: VersaoGerador;
  nome: string;
  descricao: string;
  recursos: string[];
  recomendado?: boolean;
};

/**
 * Configurações da ferramenta (fresa)
 * Apenas os parâmetros que realmente afetam o G-code gerado
 */
export type ConfiguracoesFerramenta = {
  diametro: number;           // mm - Diâmetro da fresa (usado para compensação G41/G42)
  numeroFerramenta: number;   // T1, T2, etc. - Usado no comando de troca de ferramenta
};

/**
 * Ponto candidato para posicionar próxima peça
 * Usado pelo algoritmo de nesting
 */
export type Candidato = {
  x: number;
  y: number;
};

/**
 * Resultado do algoritmo de nesting
 */
export type ResultadoNesting = {
  posicionadas: PecaPosicionada[];
  naoCouberam: Peca[];
};
