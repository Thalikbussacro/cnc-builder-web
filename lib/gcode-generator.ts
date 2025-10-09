import type { PecaPosicionada, ConfiguracoesChapa, ConfiguracoesCorte, FormatoArquivo, ConfiguracoesFerramenta } from "@/types";

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
 * Gera código G-code completo para cortar todas as peças posicionadas
 * Baseado na função GerarGCodePecas do código Delphi (linhas 329-448)
 *
 * @param pecasPos - Array de peças já posicionadas na chapa
 * @param config - Configurações da chapa
 * @param corte - Configurações do corte
 * @param ferramenta - Configurações da ferramenta (opcional)
 * @returns String com código G-code completo
 */
export function gerarGCode(
  pecasPos: PecaPosicionada[],
  config: ConfiguracoesChapa,
  corte: ConfiguracoesCorte,
  ferramenta?: ConfiguracoesFerramenta
): string {
  const { largura: chapaL, altura: chapaA } = config;
  const { profundidade, profundidadePorPassada, feedrate, plungeRate, spindleSpeed } = corte;

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
    gcode += `(  Tipo Corte: ${ferramenta.tipoCorte})\n`;
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

  // Calcula offset baseado na ferramenta e tipo de corte
  const offset = ferramenta ? ferramenta.diametro / 2 : 0;
  const aplicarOffset = ferramenta && ferramenta.tipoCorte !== 'na-linha';

  let cortadas = 0;

  // Para cada peça posicionada
  for (const peca of pecasPos) {
    cortadas++;

    // Para cada passada (profundidade)
    for (let j = 1; j <= numPassadas; j++) {
      const z = -Math.min(j * profundidadePorPassada, profundidade);

      gcode += '\n';
      gcode += `; Peca ${cortadas} (${formatarNumero(peca.largura, 0)}x${formatarNumero(peca.altura, 0)}) passada ${j}\n`;
      gcode += 'G0 Z5 ; Levanta fresa antes de posicionar\n';
      gcode += `G0 X${formatarNumero(peca.x)} Y${formatarNumero(peca.y)} ; Posiciona no início da peça\n`;
      gcode += `G1 Z${formatarNumero(z)} F${plungeRate} ; Desce a fresa com plunge rate\n`;

      // Ativa compensação de ferramenta se necessário
      if (aplicarOffset && j === 1) {
        if (ferramenta!.tipoCorte === 'externo') {
          gcode += `G41 D${ferramenta!.numeroFerramenta} ; Ativa compensação esquerda (externo)\n`;
        } else if (ferramenta!.tipoCorte === 'interno') {
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
