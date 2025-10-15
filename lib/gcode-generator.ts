import type { PecaPosicionada, ConfiguracoesChapa, ConfiguracoesCorte, FormatoArquivo, ConfiguracoesFerramenta, VersaoGerador, InfoVersaoGerador } from "@/types";
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
  const { profundidade, profundidadePorPassada, feedrate, plungeRate, spindleSpeed, usarRampa, anguloRampa } = corte;

  // Bloco de legenda explicativa
  let gcode = '';
  gcode += '(--- LEGENDA DOS COMANDOS G-CODE ---)\n';
  gcode += '(G21 mm | G90 absoluto | G0 rapido | G1 corte | M3 ligar | M5 desligar | M30 fim)\n';
  gcode += '(------------------------------------)\n\n';

  // Cabeçalho com configurações de corte
  gcode += `(Chapa ${formatarNumero(chapaL, 0)}x${formatarNumero(chapaA, 0)} mm, Z ${formatarNumero(profundidade, 0)} mm)\n`;
  gcode += `(Configuracoes de Corte:)\n`;
  gcode += `(  Spindle Speed: ${spindleSpeed} RPM)\n`;
  gcode += `(  Feedrate: ${feedrate} mm/min)\n`;
  gcode += `(  Plunge Rate: ${plungeRate} mm/min)\n`;
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
 * @returns String com código G-code completo
 */
export function gerarGCode(
  pecasPos: PecaPosicionada[],
  config: ConfiguracoesChapa,
  corte: ConfiguracoesCorte,
  ferramenta?: ConfiguracoesFerramenta,
  versao: VersaoGerador = 'v2'
): string {
  switch (versao) {
    case 'v1':
      return gerarGCodeV1(pecasPos, config, corte, ferramenta);
    case 'v2':
      return gerarGCodeV2(pecasPos, config, corte, ferramenta);
    default:
      // Fallback para V2 se versão desconhecida
      return gerarGCodeV2(pecasPos, config, corte, ferramenta);
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
