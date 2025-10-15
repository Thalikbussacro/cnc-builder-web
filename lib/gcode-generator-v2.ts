import type { PecaPosicionada, ConfiguracoesChapa, ConfiguracoesCorte, ConfiguracoesFerramenta } from "@/types";

/**
 * Formata número para G-code com otimização (remove zeros desnecessários)
 * @param num - Número a ser formatado
 * @param decimals - Número máximo de casas decimais (padrão: 2)
 * @returns String formatada otimizada
 */
function formatarNumero(num: number, decimals: number = 2): string {
  // Remove zeros desnecessários à direita
  return parseFloat(num.toFixed(decimals)).toString().replace(',', '.');
}

/**
 * Calcula a distância horizontal necessária para uma rampa de entrada
 */
function calcularDistanciaRampa(profundidade: number, anguloGraus: number): number {
  const anguloRadianos = (anguloGraus * Math.PI) / 180;
  return profundidade / Math.tan(anguloRadianos);
}

/**
 * Determina a direção da rampa com base na posição da peça
 */
function determinarDirecaoRampa(
  peca: PecaPosicionada,
  chapaLargura: number,
  chapaAltura: number
): { deltaX: number; deltaY: number } {
  const temEspacoEsquerda = peca.x >= 10;
  if (temEspacoEsquerda) {
    return { deltaX: -1, deltaY: 0 };
  }

  const temEspacoAbaixo = peca.y >= 10;
  if (temEspacoAbaixo) {
    return { deltaX: 0, deltaY: -1 };
  }

  return { deltaX: 0, deltaY: 0 };
}

/**
 * Estado da máquina para controle modal
 */
type EstadoMaquina = {
  posX: number;
  posY: number;
  posZ: number;
  feedrate: number | null;
  compensacaoAtiva: boolean;
};

/**
 * GERADOR G-CODE V2 - OTIMIZADO
 *
 * Otimizações implementadas:
 * - Remove movimentos Z redundantes
 * - Remove parâmetro F de comandos G0
 * - Mantém G41/G42 ativo durante todas passadas da mesma peça
 * - Elimina reposicionamentos XY desnecessários
 * - Controle modal de feedrate (só declara quando muda)
 * - Comentários simplificados
 * - Formato numérico otimizado (sem zeros desnecessários)
 */
export function gerarGCodeV2(
  pecasPos: PecaPosicionada[],
  config: ConfiguracoesChapa,
  corte: ConfiguracoesCorte,
  ferramenta?: ConfiguracoesFerramenta
): string {
  const { largura: chapaL, altura: chapaA } = config;
  const { profundidade, profundidadePorPassada, feedrate, plungeRate, spindleSpeed, usarRampa, anguloRampa } = corte;

  let gcode = '';

  // Estado da máquina para otimizações
  const estado: EstadoMaquina = {
    posX: 0,
    posY: 0,
    posZ: 5,
    feedrate: null,
    compensacaoAtiva: false
  };

  // === CABEÇALHO SIMPLIFICADO ===
  gcode += `; === G-CODE V2 OTIMIZADO ===\n`;
  gcode += `; Chapa ${formatarNumero(chapaL, 0)}x${formatarNumero(chapaA, 0)}mm, Prof ${formatarNumero(profundidade, 0)}mm\n`;
  gcode += `; Spindle: ${spindleSpeed}RPM | Feed: ${feedrate}mm/min | Plunge: ${plungeRate}mm/min\n`;

  if (ferramenta) {
    gcode += `; Ferramenta: T${ferramenta.numeroFerramenta} (D${formatarNumero(ferramenta.diametro)}mm)\n`;
  }

  if (usarRampa) {
    const distEx = calcularDistanciaRampa(profundidadePorPassada, anguloRampa);
    gcode += `; Rampa: ${formatarNumero(anguloRampa, 1)}° (~${formatarNumero(distEx, 0)}mm)\n`;
  }

  const numPassadas = Math.ceil(profundidade / profundidadePorPassada);
  gcode += `; Passadas: ${numPassadas} x ${formatarNumero(profundidadePorPassada)}mm\n`;
  gcode += '\n';

  // === INICIALIZAÇÃO ===
  gcode += 'G21\n';
  gcode += 'G90\n';
  gcode += 'G0 Z5\n';

  if (ferramenta) {
    gcode += `T${ferramenta.numeroFerramenta} M6\n`;
  }

  gcode += `M3 S${spindleSpeed}\n\n`;

  let numPeca = 0;

  // === PROCESSAMENTO DE PEÇAS ===
  for (const peca of pecasPos) {
    numPeca++;

    // Cabeçalho da peça
    const nomePeca = peca.nome || `Peca ${numPeca}`;
    gcode += `; === ${nomePeca} (${formatarNumero(peca.largura, 0)}x${formatarNumero(peca.altura, 0)}mm) ===\n`;

    // Posiciona no início da peça (se necessário)
    if (estado.posX !== peca.x || estado.posY !== peca.y) {
      gcode += `G0 X${formatarNumero(peca.x)} Y${formatarNumero(peca.y)}\n`;
      estado.posX = peca.x;
      estado.posY = peca.y;
    }

    // Ativa compensação UMA VEZ para a peça inteira
    const aplicarOffset = ferramenta && peca.tipoCorte !== 'na-linha';
    if (aplicarOffset) {
      if (peca.tipoCorte === 'externo') {
        gcode += `G41 D${ferramenta!.numeroFerramenta}\n`;
      } else if (peca.tipoCorte === 'interno') {
        gcode += `G42 D${ferramenta!.numeroFerramenta}\n`;
      }
      estado.compensacaoAtiva = true;
    }

    // === PASSADAS ===
    for (let j = 1; j <= numPassadas; j++) {
      const z = -Math.min(j * profundidadePorPassada, profundidade);
      const profundidadePassada = Math.abs(z);

      gcode += `\n; Passada ${j}/${numPassadas}\n`;

      // === ENTRADA (RAMPA OU VERTICAL) ===
      if (usarRampa) {
        const distanciaRampa = calcularDistanciaRampa(profundidadePassada, anguloRampa);
        const direcao = determinarDirecaoRampa(peca, chapaL, chapaA);
        const temEspaco = direcao.deltaX !== 0 || direcao.deltaY !== 0;

        if (temEspaco) {
          const xInicio = peca.x + (direcao.deltaX * distanciaRampa);
          const yInicio = peca.y + (direcao.deltaY * distanciaRampa);

          // Move para início da rampa (se necessário)
          if (estado.posX !== xInicio || estado.posY !== yInicio) {
            // Sobe Z se não estiver em posição segura
            if (estado.posZ < 5) {
              gcode += 'G0 Z5\n';
              estado.posZ = 5;
            }
            gcode += `G0 X${formatarNumero(xInicio)} Y${formatarNumero(yInicio)}\n`;
            estado.posX = xInicio;
            estado.posY = yInicio;
          }

          // Desce até superfície
          if (estado.posZ !== 0) {
            const feedCmd = estado.feedrate !== plungeRate ? ` F${plungeRate}` : '';
            gcode += `G1 Z0${feedCmd}\n`;
            estado.posZ = 0;
            if (feedCmd) estado.feedrate = plungeRate;
          }

          // Rampa de entrada
          const feedCmd = estado.feedrate !== plungeRate ? ` F${plungeRate}` : '';
          gcode += `G1 X${formatarNumero(peca.x)} Y${formatarNumero(peca.y)} Z${formatarNumero(z)}${feedCmd}\n`;
          estado.posX = peca.x;
          estado.posY = peca.y;
          estado.posZ = z;
          if (feedCmd) estado.feedrate = plungeRate;
        } else {
          // Sem espaço para rampa
          gcode += `; AVISO: Sem espaco para rampa\n`;

          // Posiciona XY se necessário
          if (estado.posX !== peca.x || estado.posY !== peca.y) {
            if (estado.posZ < 5) {
              gcode += 'G0 Z5\n';
              estado.posZ = 5;
            }
            gcode += `G0 X${formatarNumero(peca.x)} Y${formatarNumero(peca.y)}\n`;
            estado.posX = peca.x;
            estado.posY = peca.y;
          }

          // Mergulho vertical
          const feedCmd = estado.feedrate !== plungeRate ? ` F${plungeRate}` : '';
          gcode += `G1 Z${formatarNumero(z)}${feedCmd}\n`;
          estado.posZ = z;
          if (feedCmd) estado.feedrate = plungeRate;
        }
      } else {
        // Mergulho vertical tradicional

        // Posiciona XY se necessário
        if (estado.posX !== peca.x || estado.posY !== peca.y) {
          if (estado.posZ < 5) {
            gcode += 'G0 Z5\n';
            estado.posZ = 5;
          }
          gcode += `G0 X${formatarNumero(peca.x)} Y${formatarNumero(peca.y)}\n`;
          estado.posX = peca.x;
          estado.posY = peca.y;
        }

        // Desce
        const feedCmd = estado.feedrate !== plungeRate ? ` F${plungeRate}` : '';
        gcode += `G1 Z${formatarNumero(z)}${feedCmd}\n`;
        estado.posZ = z;
        if (feedCmd) estado.feedrate = plungeRate;
      }

      // === CORTE DO RETÂNGULO ===
      const x1 = peca.x + peca.largura;
      const y1 = peca.y + peca.altura;

      // Lado inferior
      const feedCmd1 = estado.feedrate !== feedrate ? ` F${feedrate}` : '';
      gcode += `G1 X${formatarNumero(x1)} Y${formatarNumero(peca.y)}${feedCmd1}\n`;
      estado.posX = x1;
      if (feedCmd1) estado.feedrate = feedrate;

      // Lado direito
      gcode += `G1 X${formatarNumero(x1)} Y${formatarNumero(y1)}\n`;
      estado.posY = y1;

      // Lado superior
      gcode += `G1 X${formatarNumero(peca.x)} Y${formatarNumero(y1)}\n`;
      estado.posX = peca.x;

      // Lado esquerdo (fecha)
      gcode += `G1 X${formatarNumero(peca.x)} Y${formatarNumero(peca.y)}\n`;
      estado.posY = peca.y;
    }

    // Cancela compensação UMA VEZ após todas as passadas
    if (estado.compensacaoAtiva) {
      gcode += 'G40\n';
      estado.compensacaoAtiva = false;
    }

    // Sobe Z uma vez ao final da peça
    gcode += 'G0 Z5\n';
    estado.posZ = 5;
    gcode += '\n';
  }

  // === FINALIZAÇÃO ===
  gcode += '; === FIM ===\n';
  gcode += 'M5\n';
  gcode += 'G0 X0 Y0\n';
  gcode += 'M30\n';

  return gcode;
}
