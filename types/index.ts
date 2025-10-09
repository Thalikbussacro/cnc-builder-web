/**
 * Representa uma peça retangular a ser cortada
 */
export type Peca = {
  largura: number;
  altura: number;
  id: string; // UUID para React keys
};

/**
 * Representa uma peça já posicionada na chapa
 */
export type PecaPosicionada = {
  x: number;
  y: number;
  largura: number;
  altura: number;
  id: string;
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
};

/**
 * Formatos disponíveis para exportação de G-code
 */
export type FormatoArquivo = 'nc' | 'tap' | 'gcode' | 'cnc';

/**
 * Tipo de corte: como a fresa deve cortar em relação à marcação
 */
export type TipoCorte = 'externo' | 'interno' | 'na-linha';

/**
 * Configurações da ferramenta (fresa)
 * Apenas os parâmetros que realmente afetam o G-code gerado
 */
export type ConfiguracoesFerramenta = {
  diametro: number;           // mm - Diâmetro da fresa (usado para compensação G41/G42)
  numeroFerramenta: number;   // T1, T2, etc. - Usado no comando de troca de ferramenta
  tipoCorte: TipoCorte;       // Corte interno/externo/na-linha (G41/G42/G40)
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
