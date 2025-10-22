import type { PecaPosicionada, ConfiguracoesChapa, ConfiguracoesCorte, ConfiguracoesFerramenta } from "@/types";
import { calcularTempoEstimado, formatarTempo } from "./gcode-generator";

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
 * Remove acentuação de uma string para compatibilidade com controladores CNC
 * @param texto - Texto com possível acentuação
 * @returns Texto sem acentuação
 */
function removerAcentos(texto: string): string {
  return texto
    .replace(/[áàâãä]/g, 'a')
    .replace(/[ÁÀÂÃÄ]/g, 'A')
    .replace(/[éèêë]/g, 'e')
    .replace(/[ÉÈÊË]/g, 'E')
    .replace(/[íìîï]/g, 'i')
    .replace(/[ÍÌÎÏ]/g, 'I')
    .replace(/[óòôõö]/g, 'o')
    .replace(/[ÓÒÔÕÖ]/g, 'O')
    .replace(/[úùûü]/g, 'u')
    .replace(/[ÚÙÛÜ]/g, 'U')
    .replace(/[ç]/g, 'c')
    .replace(/[Ç]/g, 'C');
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
  ferramenta?: ConfiguracoesFerramenta,
  incluirComentarios: boolean = true
): string {
  const { largura: chapaL, altura: chapaA } = config;
  const { profundidade, profundidadePorPassada, feedrate, plungeRate, rapidsSpeed, spindleSpeed, usarRampa, anguloRampa } = corte;

  // Validação: rapidsSpeed pode ser undefined em localStorage antigo
  const rapidsSpeedSafe = rapidsSpeed || 4000;

  // Calcula tempo estimado
  const tempo = calcularTempoEstimado(pecasPos, config, corte);

  let gcode = '';

  // Estado da máquina para otimizações
  const estado: EstadoMaquina = {
    posX: 0,
    posY: 0,
    posZ: 5,
    feedrate: null,
    compensacaoAtiva: false
  };

  // === CABEÇALHO SIMPLIFICADO (SOMENTE SE incluirComentarios === true) ===
  if (incluirComentarios) {
    const dataHora = new Date().toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    gcode += `; === G-CODE V2 OTIMIZADO ===\n`;
    gcode += `; Gerado em: ${dataHora}\n`;
    gcode += `; Versao do Gerador: V2.0 (Otimizado)\n`;
    gcode += `; Chapa ${formatarNumero(chapaL, 0)}x${formatarNumero(chapaA, 0)}mm, Prof ${formatarNumero(profundidade, 0)}mm\n`;
    gcode += `; \n`;
    gcode += `; TEMPO ESTIMADO: ${formatarTempo(tempo.tempoTotal)}\n`;
    gcode += `; Detalhamento: Corte ${formatarTempo(tempo.tempoCorte)} | Mergulho ${formatarTempo(tempo.tempoMergulho)} | Rapids ${formatarTempo(tempo.tempoPosicionamento)}\n`;
    gcode += `; \n`;
    gcode += `; DISTANCIAS PERCORRIDAS:\n`;
    gcode += `; Total: ${formatarNumero(tempo.distanciaTotal || 0, 0)}mm\n`;
    gcode += `; Corte: ${formatarNumero(tempo.distanciaCorte || 0, 0)}mm | Mergulho: ${formatarNumero(tempo.distanciaMergulho || 0, 0)}mm | Rapids: ${formatarNumero(tempo.distanciaPosicionamento || 0, 0)}mm\n`;
    gcode += `; \n`;
    gcode += `; Spindle: ${spindleSpeed}RPM | Feed: ${feedrate}mm/min | Plunge: ${plungeRate}mm/min | Rapids: ${rapidsSpeedSafe}mm/min\n`;

    // SEGURANÇA: Verificar velocidades fora de ranges seguros
    const alertasVelocidade: string[] = [];

    // Spindle Speed: 8000-24000 RPM é um range típico para CNCs hobby/semi-profissionais
    if (spindleSpeed < 8000) {
      alertasVelocidade.push(`Spindle ${spindleSpeed}RPM muito baixo (recomendado: 8000-24000 RPM)`);
    } else if (spindleSpeed > 30000) {
      alertasVelocidade.push(`Spindle ${spindleSpeed}RPM muito alto (recomendado: 8000-24000 RPM)`);
    }

    // Feedrate: depende do material, mas 500-3000 mm/min é típico para madeira/MDF
    if (feedrate < 300) {
      alertasVelocidade.push(`Feedrate ${feedrate}mm/min muito baixo (pode queimar material)`);
    } else if (feedrate > 5000) {
      alertasVelocidade.push(`Feedrate ${feedrate}mm/min muito alto (risco de quebra de fresa)`);
    }

    // PlungeRate: geralmente 1/3 a 1/2 do feedrate
    if (plungeRate > feedrate) {
      alertasVelocidade.push(`PlungeRate ${plungeRate}mm/min > Feedrate (risco de quebra)`);
    } else if (plungeRate < 100) {
      alertasVelocidade.push(`PlungeRate ${plungeRate}mm/min muito baixo (processo lento)`);
    }

    // Rapids Speed: 2000-6000 mm/min é típico
    if (rapidsSpeedSafe < 1000) {
      alertasVelocidade.push(`Rapids ${rapidsSpeedSafe}mm/min muito baixo (processo lento)`);
    } else if (rapidsSpeedSafe > 10000) {
      alertasVelocidade.push(`Rapids ${rapidsSpeedSafe}mm/min muito alto (verifique limites da maquina)`);
    }

    if (alertasVelocidade.length > 0) {
      gcode += `; \n`;
      gcode += `; ALERTAS DE VELOCIDADE:\n`;
      for (const alerta of alertasVelocidade) {
        gcode += `; - ${alerta}\n`;
      }
    }

    if (ferramenta) {
      gcode += `; Ferramenta: T${ferramenta.numeroFerramenta} (D${formatarNumero(ferramenta.diametro)}mm)\n`;
    }

    if (usarRampa) {
      const distEx = calcularDistanciaRampa(profundidadePorPassada, anguloRampa);
      gcode += `; Rampa: ${formatarNumero(anguloRampa, 1)}° (~${formatarNumero(distEx, 0)}mm)\n`;
    }

    const numPassadas = Math.ceil(profundidade / profundidadePorPassada);
    gcode += `; Passadas: ${numPassadas} x ${formatarNumero(profundidadePorPassada)}mm\n`;

    // SEGURANÇA: Verificar profundidade vs espessura da chapa
    if (profundidade > config.espessura) {
      gcode += `; \n`;
      gcode += `; AVISO SEGURANCA: Profundidade ${formatarNumero(profundidade)}mm > Espessura chapa ${formatarNumero(config.espessura)}mm!\n`;
      gcode += `; RISCO: Ferramenta pode mergulhar na mesa de trabalho!\n`;
      gcode += `; SOLUCAO: Ajuste profundidade para <= ${formatarNumero(config.espessura)}mm\n`;
    } else if (profundidade < config.espessura) {
      gcode += `; \n`;
      gcode += `; AVISO: Profundidade ${formatarNumero(profundidade)}mm < Espessura chapa ${formatarNumero(config.espessura)}mm\n`;
      gcode += `; Corte nao atravessara completamente a chapa\n`;
    }

    // AVISO: Verificar espaçamento com compensação de ferramenta
    if (ferramenta) {
      const espacamentoConfig = corte.espacamento || 0;
      const diametroFerramenta = ferramenta.diametro;
      const espacamentoReal = espacamentoConfig - diametroFerramenta;
      const raio = diametroFerramenta / 2;

      gcode += `; \n`;
      gcode += `; IMPORTANTE: Espacamento configurado ${espacamentoConfig}mm\n`;
      gcode += `; Com compensacao G41/G42 (fresa D${formatarNumero(diametroFerramenta)}mm):\n`;
      gcode += `; Espaco real entre pecas: ~${formatarNumero(espacamentoReal)}mm\n`;

      if (espacamentoReal < diametroFerramenta) {
        gcode += `; AVISO: Espaco real menor que diametro da fresa!\n`;
        gcode += `; Recomendado: espacamento >= ${formatarNumero(diametroFerramenta * 2)}mm\n`;
      }

      // Verificar se peças com compensação ultrapassam limites da chapa
      let areaExcedida = false;
      for (const peca of pecasPos) {
        if (peca.tipoCorte !== 'na-linha') {
          // Para corte externo, a compensação aumenta a área
          // Para corte interno, a compensação diminui a área (não afeta limites da chapa)
          if (peca.tipoCorte === 'externo') {
            const xMax = peca.x + peca.largura + raio;
            const yMax = peca.y + peca.altura + raio;
            const xMin = peca.x - raio;
            const yMin = peca.y - raio;

            if (xMax > chapaL || yMax > chapaA || xMin < 0 || yMin < 0) {
              areaExcedida = true;
              gcode += `; AVISO: Peca "${peca.nome || 'sem nome'}" com compensacao ultrapassa limites da chapa!\n`;
            }
          }
        }
      }

      if (areaExcedida) {
        gcode += `; SOLUCAO: Reduza espacamento ou reposicione pecas\n`;
      }

      // Verificar colisões entre peças considerando compensação
      gcode += `; \n`;
      let colisaoDetectada = false;
      for (let i = 0; i < pecasPos.length; i++) {
        const p1 = pecasPos[i];
        const offset1 = p1.tipoCorte === 'externo' ? raio : 0;

        for (let j = i + 1; j < pecasPos.length; j++) {
          const p2 = pecasPos[j];
          const offset2 = p2.tipoCorte === 'externo' ? raio : 0;

          // Expande os limites de cada peça com a compensação
          const p1MinX = p1.x - offset1;
          const p1MaxX = p1.x + p1.largura + offset1;
          const p1MinY = p1.y - offset1;
          const p1MaxY = p1.y + p1.altura + offset1;

          const p2MinX = p2.x - offset2;
          const p2MaxX = p2.x + p2.largura + offset2;
          const p2MinY = p2.y - offset2;
          const p2MaxY = p2.y + p2.altura + offset2;

          // Verifica sobreposição (AABB collision detection)
          const colisao = !(p1MaxX <= p2MinX || p1MinX >= p2MaxX || p1MaxY <= p2MinY || p1MinY >= p2MaxY);

          if (colisao) {
            colisaoDetectada = true;
            const nome1 = p1.nome || `Peca ${i + 1}`;
            const nome2 = p2.nome || `Peca ${j + 1}`;
            gcode += `; AVISO COLISAO: "${nome1}" e "${nome2}" podem colidir com compensacao!\n`;
          }
        }
      }

      if (colisaoDetectada) {
        gcode += `; SOLUCAO: Aumente espacamento entre pecas\n`;
      }
    }

    gcode += '\n';
  }

  const numPassadas = Math.ceil(profundidade / profundidadePorPassada);

  // === INICIALIZAÇÃO ===
  gcode += incluirComentarios ? 'G21 ; Define unidades em milímetros\n' : 'G21\n';
  gcode += incluirComentarios ? 'G90 ; Usa coordenadas absolutas\n' : 'G90\n';
  gcode += incluirComentarios ? 'G0 Z5 ; Levanta a fresa para posição segura\n' : 'G0 Z5\n';

  if (ferramenta) {
    gcode += incluirComentarios
      ? `T${ferramenta.numeroFerramenta} M6 ; Troca para ferramenta T${ferramenta.numeroFerramenta}\n`
      : `T${ferramenta.numeroFerramenta} M6\n`;
  }

  gcode += incluirComentarios ? `M3 S${spindleSpeed} ; Liga o spindle\n` : `M3 S${spindleSpeed}\n`;
  gcode += incluirComentarios ? 'G0 X0 Y0 ; Posiciona em origem antes de iniciar corte\n\n' : 'G0 X0 Y0\n\n';

  let numPeca = 0;

  // === PROCESSAMENTO DE PEÇAS ===
  for (const peca of pecasPos) {
    numPeca++;

    // Cabeçalho da peça
    if (incluirComentarios) {
      const nomePeca = peca.nome || `Peca ${numPeca}`;
      gcode += `; === ${nomePeca} (${formatarNumero(peca.largura, 0)}x${formatarNumero(peca.altura, 0)}mm) ===\n`;
    }

    // Posiciona no início da peça (se necessário)
    if (estado.posX !== peca.x || estado.posY !== peca.y) {
      // SEGURANÇA: Garante Z em posição segura antes de movimento XY
      if (estado.posZ < 5) {
        gcode += incluirComentarios ? 'G0 Z5 ; Levanta fresa para posição segura\n' : 'G0 Z5\n';
        estado.posZ = 5;
      }
      gcode += incluirComentarios
        ? `G0 X${formatarNumero(peca.x)} Y${formatarNumero(peca.y)} ; Posiciona no início da peça\n`
        : `G0 X${formatarNumero(peca.x)} Y${formatarNumero(peca.y)}\n`;
      estado.posX = peca.x;
      estado.posY = peca.y;
    }

    // Ativa compensação UMA VEZ para a peça inteira
    const aplicarOffset = ferramenta && peca.tipoCorte !== 'na-linha';
    if (aplicarOffset) {
      if (peca.tipoCorte === 'externo') {
        gcode += incluirComentarios
          ? `G41 D${ferramenta!.numeroFerramenta} ; Ativa compensação esquerda (externo)\n`
          : `G41 D${ferramenta!.numeroFerramenta}\n`;
      } else if (peca.tipoCorte === 'interno') {
        gcode += incluirComentarios
          ? `G42 D${ferramenta!.numeroFerramenta} ; Ativa compensação direita (interno)\n`
          : `G42 D${ferramenta!.numeroFerramenta}\n`;
      }
      estado.compensacaoAtiva = true;
    }

    // === PASSADAS ===
    for (let j = 1; j <= numPassadas; j++) {
      const z = -Math.min(j * profundidadePorPassada, profundidade);
      const profundidadePassada = Math.abs(z);

      if (incluirComentarios) {
        gcode += `\n; Passada ${j}/${numPassadas}\n`;
      }

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
              gcode += incluirComentarios ? 'G0 Z5 ; Levanta fresa para posição segura\n' : 'G0 Z5\n';
              estado.posZ = 5;
            }
            gcode += incluirComentarios
              ? `G0 X${formatarNumero(xInicio)} Y${formatarNumero(yInicio)} ; Posiciona no início da rampa\n`
              : `G0 X${formatarNumero(xInicio)} Y${formatarNumero(yInicio)}\n`;
            estado.posX = xInicio;
            estado.posY = yInicio;
          }

          // Desce até superfície
          if (estado.posZ !== 0) {
            const feedCmd = estado.feedrate !== plungeRate ? ` F${plungeRate}` : '';
            gcode += incluirComentarios
              ? `G1 Z0${feedCmd} ; Desce até a superfície\n`
              : `G1 Z0${feedCmd}\n`;
            estado.posZ = 0;
            if (feedCmd) estado.feedrate = plungeRate;
          }

          // Rampa de entrada
          const feedCmd = estado.feedrate !== plungeRate ? ` F${plungeRate}` : '';
          gcode += incluirComentarios
            ? `G1 X${formatarNumero(peca.x)} Y${formatarNumero(peca.y)} Z${formatarNumero(z)}${feedCmd} ; Rampa de entrada\n`
            : `G1 X${formatarNumero(peca.x)} Y${formatarNumero(peca.y)} Z${formatarNumero(z)}${feedCmd}\n`;
          estado.posX = peca.x;
          estado.posY = peca.y;
          estado.posZ = z;
          if (feedCmd) estado.feedrate = plungeRate;
        } else {
          // Sem espaço para rampa
          if (incluirComentarios) {
            gcode += `; AVISO: Sem espaco para rampa\n`;
          }

          // Posiciona XY se necessário
          if (estado.posX !== peca.x || estado.posY !== peca.y) {
            if (estado.posZ < 5) {
              gcode += incluirComentarios ? 'G0 Z5 ; Levanta fresa para posição segura\n' : 'G0 Z5\n';
              estado.posZ = 5;
            }
            gcode += incluirComentarios
              ? `G0 X${formatarNumero(peca.x)} Y${formatarNumero(peca.y)} ; Posiciona no início da peça\n`
              : `G0 X${formatarNumero(peca.x)} Y${formatarNumero(peca.y)}\n`;
            estado.posX = peca.x;
            estado.posY = peca.y;
          }

          // Mergulho vertical
          const feedCmd = estado.feedrate !== plungeRate ? ` F${plungeRate}` : '';
          gcode += incluirComentarios
            ? `G1 Z${formatarNumero(z)}${feedCmd} ; Mergulho vertical\n`
            : `G1 Z${formatarNumero(z)}${feedCmd}\n`;
          estado.posZ = z;
          if (feedCmd) estado.feedrate = plungeRate;
        }
      } else {
        // Mergulho vertical tradicional

        // Posiciona XY se necessário
        if (estado.posX !== peca.x || estado.posY !== peca.y) {
          if (estado.posZ < 5) {
            gcode += incluirComentarios ? 'G0 Z5 ; Levanta fresa para posição segura\n' : 'G0 Z5\n';
            estado.posZ = 5;
          }
          gcode += incluirComentarios
            ? `G0 X${formatarNumero(peca.x)} Y${formatarNumero(peca.y)} ; Posiciona no início da peça\n`
            : `G0 X${formatarNumero(peca.x)} Y${formatarNumero(peca.y)}\n`;
          estado.posX = peca.x;
          estado.posY = peca.y;
        }

        // Desce
        const feedCmd = estado.feedrate !== plungeRate ? ` F${plungeRate}` : '';
        gcode += incluirComentarios
          ? `G1 Z${formatarNumero(z)}${feedCmd} ; Mergulho vertical\n`
          : `G1 Z${formatarNumero(z)}${feedCmd}\n`;
        estado.posZ = z;
        if (feedCmd) estado.feedrate = plungeRate;
      }

      // === CORTE DO RETÂNGULO ===
      const x1 = peca.x + peca.largura;
      const y1 = peca.y + peca.altura;

      // Lado inferior
      const feedCmd1 = estado.feedrate !== feedrate ? ` F${feedrate}` : '';
      gcode += incluirComentarios
        ? `G1 X${formatarNumero(x1)} Y${formatarNumero(peca.y)}${feedCmd1} ; Corta lado inferior\n`
        : `G1 X${formatarNumero(x1)} Y${formatarNumero(peca.y)}${feedCmd1}\n`;
      estado.posX = x1;
      if (feedCmd1) estado.feedrate = feedrate;

      // Lado direito
      gcode += incluirComentarios
        ? `G1 X${formatarNumero(x1)} Y${formatarNumero(y1)} ; Corta lado direito\n`
        : `G1 X${formatarNumero(x1)} Y${formatarNumero(y1)}\n`;
      estado.posY = y1;

      // Lado superior
      gcode += incluirComentarios
        ? `G1 X${formatarNumero(peca.x)} Y${formatarNumero(y1)} ; Corta lado superior\n`
        : `G1 X${formatarNumero(peca.x)} Y${formatarNumero(y1)}\n`;
      estado.posX = peca.x;

      // Lado esquerdo (fecha)
      gcode += incluirComentarios
        ? `G1 X${formatarNumero(peca.x)} Y${formatarNumero(peca.y)} ; Corta lado esquerdo (fecha o retângulo)\n`
        : `G1 X${formatarNumero(peca.x)} Y${formatarNumero(peca.y)}\n`;
      estado.posY = peca.y;
    }

    // Cancela compensação UMA VEZ após todas as passadas
    if (estado.compensacaoAtiva) {
      gcode += incluirComentarios ? 'G40 ; Cancela compensação de raio\n' : 'G40\n';
      estado.compensacaoAtiva = false;
    }

    // Sobe Z uma vez ao final da peça
    gcode += incluirComentarios ? 'G0 Z5 ; Levanta fresa após completar peça\n' : 'G0 Z5\n';
    estado.posZ = 5;
    gcode += '\n';
  }

  // === FINALIZAÇÃO ===
  if (incluirComentarios) {
    gcode += '; === FIM ===\n';
  }
  gcode += incluirComentarios ? 'M5 ; Desliga o spindle\n' : 'M5\n';
  gcode += incluirComentarios ? 'G0 X0 Y0 ; Retorna para origem\n' : 'G0 X0 Y0\n';
  gcode += incluirComentarios ? 'M30 ; Fim do programa\n' : 'M30\n';

  // Remove acentuação de todos os comentários para compatibilidade
  gcode = removerAcentos(gcode);

  return gcode;
}
