import type { PecaPosicionada, ConfiguracoesChapa, ConfiguracoesCorte, FormatoArquivo, ConfiguracoesFerramenta, VersaoGerador, InfoVersaoGerador, TempoEstimado } from "@/types";
import { gerarGCodeV2 } from "./gcode-generator-v2";

/**
 * Informações sobre as versões disponíveis do gerador
 */
export const VERSOES_GERADOR: InfoVersaoGerador[] = [
  {
    versao: 'v1',
    nome: 'V1 - Clássico',
    descricao: 'Versão original com comentários detalhados',
    recursos: [
      'Comentários explicativos completos',
      'Estrutura tradicional clara',
      'Compatível com qualquer controlador'
    ]
  },
  {
    versao: 'v2',
    nome: 'V2 - Otimizado',
    descricao: 'Versão otimizada com melhorias de performance',
    recursos: [
      'Remove movimentos Z redundantes',
      'Sem parâmetro F em comandos G0',
      'G41/G42 mantido durante todas passadas',
      'Elimina reposicionamentos XY desnecessários',
      'Controle modal de feedrate',
      'Comentários simplificados',
      'Código ~30% menor e mais rápido'
    ],
    recomendado: true
  }
];

/**
 * Formata número para G-code garantindo ponto como separador decimal
 * @param num - Número a ser formatado
 * @param decimals - Número de casas decimais (padrão: 2)
 * @returns String formatada com ponto decimal
 */
function formatarNumero(num: number, decimals: number = 2): string {
  return num.toFixed(decimals).replace(',', '.');
}

/**
 * Calcula a distância horizontal necessária para uma rampa de entrada
 * @param profundidade - Profundidade a descer (mm)
 * @param anguloGraus - Ângulo da rampa em graus
 * @returns Distância horizontal em mm
 */
function calcularDistanciaRampa(profundidade: number, anguloGraus: number): number {
  const anguloRadianos = (anguloGraus * Math.PI) / 180;
  return profundidade / Math.tan(anguloRadianos);
}

/**
 * Determina a direção da rampa com base na posição da peça e tipo de corte
 * @param peca - Peça posicionada
 * @param chapaLargura - Largura da chapa
 * @param chapaAltura - Altura da chapa
 * @returns Objeto com deltaX e deltaY para a direção da rampa
 */
function determinarDirecaoRampa(
  peca: PecaPosicionada,
  chapaLargura: number,
  chapaAltura: number
): { deltaX: number; deltaY: number } {
  // A direção da rampa depende do tipo de corte e da posição inicial
  // Para cortes que vão da esquerda para direita (padrão), a rampa vai para -X
  // Isso permite que a fresa entre no material na direção do corte

  // Verificamos se há espaço suficiente à esquerda
  const temEspacoEsquerda = peca.x >= 10; // Margem de 10mm

  if (temEspacoEsquerda) {
    return { deltaX: -1, deltaY: 0 }; // Rampa vai para esquerda
  }

  // Se não há espaço à esquerda, tenta para baixo
  const temEspacoAbaixo = peca.y >= 10;
  if (temEspacoAbaixo) {
    return { deltaX: 0, deltaY: -1 }; // Rampa vai para baixo
  }

  // Fallback: sem direção específica (não usar rampa)
  return { deltaX: 0, deltaY: 0 };
}

/**
 * Remove comentários de um código G-code
 * @param gcode - String com código G-code
 * @returns String com G-code sem comentários
 */
export function removerComentarios(gcode: string): string {
  return gcode
    .split('\n')
    .map(linha => {
      // Remove comentários entre parênteses: (comentário)
      linha = linha.replace(/\([^)]*\)/g, '');
      // Remove comentários após ponto e vírgula: ; comentário
      linha = linha.replace(/;.*$/, '');
      // Remove espaços extras
      return linha.trim();
    })
    .filter(linha => linha.length > 0) // Remove linhas vazias
    .join('\n');
}

/**
 * Formata tempo em segundos para string legível (HH:MM:SS ou MM:SS)
 */
export function formatarTempo(segundos: number): string {
  // Validação: retorna "N/A" se o tempo for inválido
  if (!isFinite(segundos) || isNaN(segundos) || segundos < 0) {
    return 'N/A';
  }

  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const segs = Math.floor(segundos % 60);

  if (horas > 0) {
    return `${horas}h ${minutos.toString().padStart(2, '0')}min ${segs.toString().padStart(2, '0')}s`;
  } else if (minutos > 0) {
    return `${minutos}min ${segs.toString().padStart(2, '0')}s`;
  } else {
    return `${segs}s`;
  }
}

/**
 * Calcula o tempo estimado de execução do G-code
 *
 * @param pecasPos - Array de peças posicionadas
 * @param config - Configurações da chapa
 * @param corte - Configurações do corte
 * @returns Objeto com tempo estimado detalhado em segundos
 */
export function calcularTempoEstimado(
  pecasPos: PecaPosicionada[],
  config: ConfiguracoesChapa,
  corte: ConfiguracoesCorte
): TempoEstimado {
  const { profundidade, profundidadePorPassada, feedrate, plungeRate, rapidsSpeed, usarRampa, anguloRampa } = corte;
  const { largura: chapaL, altura: chapaA } = config;

  // Validação: rapidsSpeed pode ser undefined em localStorage antigo
  const rapidsSpeedSafe = rapidsSpeed || 4000; // Valor padrão se não existir

  const numPassadas = Math.ceil(profundidade / profundidadePorPassada);

  let distanciaCorte = 0;        // mm - movimentos G1 laterais (XY)
  let distanciaMergulho = 0;     // mm - movimentos G1 verticais (Z)
  let distanciaPosicionamento = 0; // mm - movimentos G0

  // Posição atual simulada
  let posX = 0;
  let posY = 0;
  let posZ = 5;

  // Para cada peça
  for (const peca of pecasPos) {
    // Para cada passada
    for (let j = 1; j <= numPassadas; j++) {
      const z = -Math.min(j * profundidadePorPassada, profundidade);
      const profundidadePassada = Math.abs(z);

      // 1. Movimento G0 para posição inicial (se necessário)
      if (posX !== peca.x || posY !== peca.y) {
        // Se não está em Z seguro, sobe primeiro
        if (posZ < 5) {
          distanciaPosicionamento += Math.abs(5 - posZ); // Sobe Z
          posZ = 5;
        }
        // Move XY
        const dx = peca.x - posX;
        const dy = peca.y - posY;
        distanciaPosicionamento += Math.sqrt(dx * dx + dy * dy);
        posX = peca.x;
        posY = peca.y;
      }

      // 2. Entrada (rampa ou mergulho vertical)
      if (usarRampa) {
        const distanciaRampa = calcularDistanciaRampa(profundidadePassada, anguloRampa);
        const direcao = determinarDirecaoRampa(peca, chapaL, chapaA);
        const temEspaco = direcao.deltaX !== 0 || direcao.deltaY !== 0;

        if (temEspaco) {
          const xInicio = peca.x + (direcao.deltaX * distanciaRampa);
          const yInicio = peca.y + (direcao.deltaY * distanciaRampa);

          // Move para início da rampa se necessário
          if (posX !== xInicio || posY !== yInicio) {
            if (posZ < 5) {
              distanciaPosicionamento += Math.abs(5 - posZ);
              posZ = 5;
            }
            const dx = xInicio - posX;
            const dy = yInicio - posY;
            distanciaPosicionamento += Math.sqrt(dx * dx + dy * dy);
            posX = xInicio;
            posY = yInicio;
          }

          // Desce até superfície (Z=0)
          if (posZ !== 0) {
            distanciaMergulho += Math.abs(posZ);
            posZ = 0;
          }

          // Rampa de entrada (movimento 3D)
          const dx = peca.x - xInicio;
          const dy = peca.y - yInicio;
          const dz = z - posZ;
          distanciaMergulho += Math.sqrt(dx * dx + dy * dy + dz * dz);
          posX = peca.x;
          posY = peca.y;
          posZ = z;
        } else {
          // Sem espaço: mergulho vertical
          if (posZ !== z) {
            distanciaMergulho += Math.abs(z - posZ);
            posZ = z;
          }
        }
      } else {
        // Mergulho vertical tradicional
        if (posZ !== z) {
          distanciaMergulho += Math.abs(z - posZ);
          posZ = z;
        }
      }

      // 3. Corte do retângulo (4 lados)
      const perimetro = 2 * (peca.largura + peca.altura);
      distanciaCorte += perimetro;
      // Posição final = posição inicial (retângulo fechado)

      // 4. Levanta Z ao final da última passada (dentro do loop de peças, após todas passadas)
      if (j === numPassadas) {
        if (posZ < 5) {
          distanciaPosicionamento += Math.abs(5 - posZ);
          posZ = 5;
        }
      }
    }
  }

  // 5. Retorno ao ponto inicial (G0 X0 Y0)
  if (posX !== 0 || posY !== 0) {
    distanciaPosicionamento += Math.sqrt(posX * posX + posY * posY);
    posX = 0;
    posY = 0;
  }

  // Calcula tempos em segundos (velocidades em mm/min)
  const tempoCorte = (distanciaCorte / feedrate) * 60;
  const tempoMergulho = (distanciaMergulho / plungeRate) * 60;
  const tempoPosicionamento = (distanciaPosicionamento / rapidsSpeedSafe) * 60;
  const tempoTotal = tempoCorte + tempoMergulho + tempoPosicionamento;
  const distanciaTotal = distanciaCorte + distanciaMergulho + distanciaPosicionamento;

  return {
    tempoCorte,
    tempoMergulho,
    tempoPosicionamento,
    tempoTotal,
    distanciaCorte,
    distanciaMergulho,
    distanciaPosicionamento,
    distanciaTotal
  };
}

/**
 * Gera código G-code V1 (versão clássica)
 * Baseado na função GerarGCodePecas do código Delphi (linhas 329-448)
 *
 * @param pecasPos - Array de peças já posicionadas na chapa
 * @param config - Configurações da chapa
 * @param corte - Configurações do corte
 * @param ferramenta - Configurações da ferramenta (opcional)
 * @returns String com código G-code completo
 */
export function gerarGCodeV1(
  pecasPos: PecaPosicionada[],
  config: ConfiguracoesChapa,
  corte: ConfiguracoesCorte,
  ferramenta?: ConfiguracoesFerramenta
): string {
  const { largura: chapaL, altura: chapaA } = config;
  const { profundidade, profundidadePorPassada, feedrate, plungeRate, rapidsSpeed, spindleSpeed, usarRampa, anguloRampa } = corte;

  // Calcula tempo estimado
  const tempo = calcularTempoEstimado(pecasPos, config, corte);

  // Bloco de legenda explicativa
  let gcode = '';
  gcode += '(--- LEGENDA DOS COMANDOS G-CODE ---)\n';
  gcode += '(G21 mm | G90 absoluto | G0 rapido | G1 corte | M3 ligar | M5 desligar | M30 fim)\n';
  gcode += '(------------------------------------)\n\n';

  // Cabeçalho com configurações de corte
  gcode += `(Chapa ${formatarNumero(chapaL, 0)}x${formatarNumero(chapaA, 0)} mm, Z ${formatarNumero(profundidade, 0)} mm)\n`;
  gcode += `(Tempo Estimado: ${formatarTempo(tempo.tempoTotal)})\n`;
  gcode += `(Configuracoes de Corte:)\n`;
  gcode += `(  Spindle Speed: ${spindleSpeed} RPM)\n`;
  gcode += `(  Feedrate: ${feedrate} mm/min)\n`;
  gcode += `(  Plunge Rate: ${plungeRate} mm/min)\n`;
  gcode += `(  Rapids Speed: ${rapidsSpeed} mm/min)\n`;
  gcode += `(  Prof. por Passada: ${formatarNumero(profundidadePorPassada)} mm)\n`;
  gcode += `(  Num. Passadas: ${Math.ceil(profundidade / profundidadePorPassada)})\n`;

  if (ferramenta) {
    gcode += `(Ferramenta:)\n`;
    gcode += `(  Numero: T${ferramenta.numeroFerramenta})\n`;
    gcode += `(  Diametro: ${formatarNumero(ferramenta.diametro)} mm)\n`;
  }

  if (usarRampa) {
    gcode += `(Rampa de Entrada:)\n`;
    gcode += `(  Ativada: Sim)\n`;
    gcode += `(  Angulo: ${formatarNumero(anguloRampa, 1)} graus)\n`;
    const distanciaExemplo = calcularDistanciaRampa(profundidadePorPassada, anguloRampa);
    gcode += `(  Distancia por passada: ~${formatarNumero(distanciaExemplo, 0)} mm)\n`;
  } else {
    gcode += `(Rampa de Entrada: Desativada - usando mergulho vertical)\n`;
  }

  gcode += '\n';

  gcode += 'G21 ; Define unidades em milímetros\n';
  gcode += 'G90 ; Usa coordenadas absolutas\n';
  gcode += 'G0 Z5 ; Levanta a fresa para posição segura\n';

  if (ferramenta) {
    gcode += `T${ferramenta.numeroFerramenta} M6 ; Troca para ferramenta T${ferramenta.numeroFerramenta}\n`;
  }

  gcode += `M3 S${spindleSpeed} ; Liga o spindle\n`;

  const numPassadas = Math.ceil(profundidade / profundidadePorPassada);

  let cortadas = 0;

  // Para cada peça posicionada
  for (const peca of pecasPos) {
    cortadas++;

    // Verifica se deve aplicar compensação baseado no tipo de corte da peça
    const aplicarOffset = ferramenta && peca.tipoCorte !== 'na-linha';

    // Para cada passada (profundidade)
    for (let j = 1; j <= numPassadas; j++) {
      const z = -Math.min(j * profundidadePorPassada, profundidade);
      const profundidadePassada = Math.abs(z);

      gcode += '\n';
      // Adiciona nome customizado da peça se disponível
      if (peca.nome) {
        gcode += `; ${peca.nome} - Peca ${cortadas} (${formatarNumero(peca.largura, 0)}x${formatarNumero(peca.altura, 0)}) - Tipo: ${peca.tipoCorte} - passada ${j}\n`;
      } else {
        gcode += `; Peca ${cortadas} (${formatarNumero(peca.largura, 0)}x${formatarNumero(peca.altura, 0)}) - Tipo: ${peca.tipoCorte} - passada ${j}\n`;
      }
      gcode += 'G0 Z5 ; Levanta fresa antes de posicionar\n';

      // Verifica se deve usar rampa de entrada
      if (usarRampa) {
        const distanciaRampa = calcularDistanciaRampa(profundidadePassada, anguloRampa);
        const direcao = determinarDirecaoRampa(peca, chapaL, chapaA);

        // Verifica se há espaço para a rampa
        const temEspaco = direcao.deltaX !== 0 || direcao.deltaY !== 0;

        if (temEspaco) {
          // Calcula ponto de início da rampa
          const xInicio = peca.x + (direcao.deltaX * distanciaRampa);
          const yInicio = peca.y + (direcao.deltaY * distanciaRampa);

          // Posiciona no início da rampa
          gcode += `G0 X${formatarNumero(xInicio)} Y${formatarNumero(yInicio)} ; Posiciona no início da rampa\n`;
          gcode += `G1 Z0 F${plungeRate} ; Desce até a superfície\n`;

          // Executa rampa de entrada
          gcode += `G1 X${formatarNumero(peca.x)} Y${formatarNumero(peca.y)} Z${formatarNumero(z)} F${plungeRate} ; Rampa de entrada (${formatarNumero(anguloRampa, 1)} graus)\n`;
        } else {
          // Não há espaço para rampa, faz mergulho vertical com aviso
          gcode += `; AVISO: Espaco insuficiente para rampa - usando mergulho vertical\n`;
          gcode += `G0 X${formatarNumero(peca.x)} Y${formatarNumero(peca.y)} ; Posiciona no início da peça\n`;
          gcode += `G1 Z${formatarNumero(z)} F${plungeRate} ; Desce a fresa com plunge rate (mergulho vertical)\n`;
        }
      } else {
        // Mergulho vertical tradicional
        gcode += `G0 X${formatarNumero(peca.x)} Y${formatarNumero(peca.y)} ; Posiciona no início da peça\n`;
        gcode += `G1 Z${formatarNumero(z)} F${plungeRate} ; Desce a fresa com plunge rate\n`;
      }

      // Ativa compensação de ferramenta se necessário
      if (aplicarOffset && j === 1) {
        if (peca.tipoCorte === 'externo') {
          gcode += `G41 D${ferramenta!.numeroFerramenta} ; Ativa compensação esquerda (externo)\n`;
        } else if (peca.tipoCorte === 'interno') {
          gcode += `G42 D${ferramenta!.numeroFerramenta} ; Ativa compensação direita (interno)\n`;
        }
      }

      // Corta retângulo (4 lados)
      // Lado inferior (esquerda -> direita)
      gcode += `G1 X${formatarNumero(peca.x + peca.largura)} Y${formatarNumero(peca.y)} F${feedrate} ; Corta lado inferior\n`;

      // Lado direito (baixo -> cima)
      gcode += `G1 X${formatarNumero(peca.x + peca.largura)} Y${formatarNumero(peca.y + peca.altura)} ; Corta lado direito\n`;

      // Lado superior (direita -> esquerda)
      gcode += `G1 X${formatarNumero(peca.x)} Y${formatarNumero(peca.y + peca.altura)} ; Corta lado superior\n`;

      // Lado esquerdo (cima -> baixo) - fecha o retângulo
      gcode += `G1 X${formatarNumero(peca.x)} Y${formatarNumero(peca.y)} ; Corta lado esquerdo (fecha o retângulo)\n`;

      // Desativa compensação após última passada da peça
      if (aplicarOffset && j === numPassadas) {
        gcode += 'G40 ; Cancela compensação de ferramenta\n';
      }

      gcode += `G0 Z5 F${plungeRate} ; Levanta fresa com plunge rate\n`;
    }
  }

  // Comandos finais
  gcode += '\n';
  gcode += 'G0 Z5 ; Levanta a fresa\n';
  gcode += 'M5 ; Desliga o spindle\n';
  gcode += 'G0 X0 Y0 ; Volta para o ponto inicial\n';
  gcode += 'M30 ; Fim do programa\n';

  return gcode;
}

/**
 * Gera código G-code na versão especificada
 *
 * @param pecasPos - Array de peças já posicionadas na chapa
 * @param config - Configurações da chapa
 * @param corte - Configurações do corte
 * @param ferramenta - Configurações da ferramenta (opcional)
 * @param versao - Versão do gerador a usar (padrão: 'v2')
 * @param incluirComentarios - Se true, inclui comentários detalhados em cada linha (padrão: true)
 * @returns String com código G-code completo
 */
export function gerarGCode(
  pecasPos: PecaPosicionada[],
  config: ConfiguracoesChapa,
  corte: ConfiguracoesCorte,
  ferramenta?: ConfiguracoesFerramenta,
  versao: VersaoGerador = 'v2',
  incluirComentarios: boolean = true
): string {
  switch (versao) {
    case 'v1':
      return gerarGCodeV1(pecasPos, config, corte, ferramenta);
    case 'v2':
      return gerarGCodeV2(pecasPos, config, corte, ferramenta, incluirComentarios);
    default:
      // Fallback para V2 se versão desconhecida
      return gerarGCodeV2(pecasPos, config, corte, ferramenta, incluirComentarios);
  }
}

/**
 * Faz download de arquivo G-code
 * @param conteudo - String com código G-code
 * @param formato - Formato do arquivo (.nc, .tap, .gcode, .cnc)
 */
export function downloadGCode(conteudo: string, formato: FormatoArquivo = 'nc'): void {
  // Gera nome do arquivo com timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const nomeArquivo = `corte_${timestamp}.${formato}`;

  // Cria Blob com codificação UTF-8
  const blob = new Blob([conteudo], { type: 'text/plain;charset=utf-8' });

  // Cria URL temporária
  const url = URL.createObjectURL(blob);

  // Cria elemento <a> invisível para download
  const a = document.createElement('a');
  a.href = url;
  a.download = nomeArquivo;
  a.style.display = 'none';

  // Adiciona ao DOM, clica e remove
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Limpa URL temporária
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
