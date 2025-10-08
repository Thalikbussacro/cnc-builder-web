import type { Peca, PecaPosicionada, Candidato, ResultadoNesting } from "@/types";

/**
 * Verifica se uma peça cabe em determinada posição sem colidir com outras peças
 * Baseado na função CabeNoEspaco do código Delphi (linhas 63-85)
 *
 * @param nova - Peça a ser posicionada com coordenadas x, y
 * @param lista - Lista de peças já posicionadas
 * @param chapaLargura - Largura da chapa
 * @param chapaAltura - Altura da chapa
 * @param espacamento - Espaçamento mínimo entre peças
 * @returns true se a peça cabe, false caso contrário
 */
export function cabeNoEspaco(
  nova: PecaPosicionada,
  lista: PecaPosicionada[],
  chapaLargura: number,
  chapaAltura: number,
  espacamento: number
): boolean {
  // Verifica se excede os limites da chapa
  if (nova.x + nova.largura > chapaLargura || nova.y + nova.altura > chapaAltura) {
    return false;
  }

  // Verifica colisão com cada peça já posicionada
  for (const p of lista) {
    // Se houver qualquer sobreposição dentro do espaçamento mínimo, não cabe
    // A peça NÃO cabe se todas estas condições forem FALSAS:
    // - nova está à esquerda de p (com espaçamento)
    // - nova está à direita de p (com espaçamento)
    // - nova está acima de p (com espaçamento)
    // - nova está abaixo de p (com espaçamento)
    const aEsquerda = nova.x + nova.largura + espacamento <= p.x;
    const aDireita = nova.x >= p.x + p.largura + espacamento;
    const acima = nova.y + nova.altura + espacamento <= p.y;
    const abaixo = nova.y >= p.y + p.altura + espacamento;

    if (!aEsquerda && !aDireita && !acima && !abaixo) {
      return false; // Há colisão
    }
  }

  // Passou nos testes: cabe no espaço
  return true;
}

/**
 * Posiciona peças na chapa usando algoritmo de nesting greedy
 * Baseado na função AtualizarPreview do código Delphi (linhas 250-327)
 *
 * @param pecas - Array de peças a serem posicionadas
 * @param chapaLargura - Largura da chapa
 * @param chapaAltura - Altura da chapa
 * @param espacamento - Espaçamento mínimo entre peças
 * @returns Objeto com peças posicionadas e peças que não couberam
 */
export function posicionarPecas(
  pecas: Peca[],
  chapaLargura: number,
  chapaAltura: number,
  espacamento: number
): ResultadoNesting {
  // Ordena peças por área (maiores primeiro) - estratégia greedy
  const pecasOrdenadas = [...pecas].sort((a, b) => {
    return b.largura * b.altura - a.largura * a.altura;
  });

  const posicionadas: PecaPosicionada[] = [];
  const naoCouberam: Peca[] = [];
  const candidatos: Candidato[] = [];

  // Primeiro ponto candidato (0, 0)
  candidatos.push({ x: 0, y: 0 });

  for (const peca of pecasOrdenadas) {
    let colocado = false;

    // Percorre candidatos para encontrar posição válida
    for (const cand of candidatos) {
      const novaPos: PecaPosicionada = {
        x: cand.x,
        y: cand.y,
        largura: peca.largura,
        altura: peca.altura,
        id: peca.id,
      };

      if (cabeNoEspaco(novaPos, posicionadas, chapaLargura, chapaAltura, espacamento)) {
        colocado = true;

        // Adiciona à lista de posicionadas
        posicionadas.push(novaPos);

        // Gera novos pontos candidatos (direita e abaixo da peça posicionada)
        candidatos.push({
          x: novaPos.x + novaPos.largura + espacamento,
          y: novaPos.y,
        });

        candidatos.push({
          x: novaPos.x,
          y: novaPos.y + novaPos.altura + espacamento,
        });

        break;
      }
    }

    if (!colocado) {
      naoCouberam.push(peca);
    }
  }

  return { posicionadas, naoCouberam };
}
