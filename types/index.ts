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
