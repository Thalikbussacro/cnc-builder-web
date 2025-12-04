import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { FormatoArquivo, InfoVersaoGerador } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Informações sobre as versões disponíveis do gerador de G-code
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
 * Faz download de string como arquivo
 * Útil para baixar G-code gerado
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
