"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InfoTooltip } from "@/components/InfoTooltip";
import { parametrosInfo } from "@/lib/parametros-info";
import { sanitizeString } from "@/lib/sanitize";
import { toast } from "sonner";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useConfigStore } from "@/stores/useConfigStore";
import type { Peca, TipoCorte } from "@/types";

type CadastroPecaProps = {
  pecasNaoCouberam?: Peca[];
  onValidarAntes?: (novasPecas: Peca[]) => Promise<boolean>;
};

export function CadastroPeca({ pecasNaoCouberam = [], onValidarAntes }: CadastroPecaProps) {
  const { addPeca, configChapa, pecas } = useConfigStore();
  const pecasExistentes = pecas;
  const onAdicionar = addPeca;
  const [largura, setLargura] = useState<string>("");
  const [altura, setAltura] = useState<string>("");
  const [tipoCorte, setTipoCorte] = useState<TipoCorte>("externo");
  const [nome, setNome] = useState<string>("");
  const [quantidade, setQuantidade] = useState<string>("1");
  const [erro, setErro] = useState<string>("");
  const [validando, setValidando] = useState<boolean>(false);

  // Alerta quando há peças que não couberam
  useEffect(() => {
    if (pecasNaoCouberam.length > 0) {
      const pecasStr = pecasNaoCouberam.length === 1
        ? `Peça #${pecasNaoCouberam[0].numeroOriginal}`
        : `${pecasNaoCouberam.length} peças`;

      toast.warning('Chapa cheia!', {
        description: `${pecasStr} não couberam. Remova peças ou aumente a chapa.`,
        icon: <AlertTriangle className="h-4 w-4" />,
        duration: 5000,
      });
    }
  }, [pecasNaoCouberam.length]);

  const handleAdicionar = async () => {
    setErro("");
    setValidando(true);

    try {
      const larguraNum = parseFloat(largura);
      const alturaNum = parseFloat(altura);
      const quantidadeNum = parseInt(quantidade);

      // Validações básicas
      if (isNaN(larguraNum) || larguraNum <= 0) {
        setErro("Informe uma largura válida.");
        return;
      }

      if (isNaN(alturaNum) || alturaNum <= 0) {
        setErro("Informe uma altura válida.");
        return;
      }

      if (isNaN(quantidadeNum) || quantidadeNum <= 0) {
        setErro("Informe uma quantidade válida.");
        return;
      }

      // Verifica se a peça é maior que a chapa
      if (larguraNum > configChapa.largura || alturaNum > configChapa.altura) {
        setErro("Peça maior que a chapa.");
        return;
      }

      // Cria N peças idênticas
      const novasPecas: Peca[] = [];
      const nomeSanitizado = nome.trim() ? sanitizeString(nome.trim()) : undefined;
      for (let i = 0; i < quantidadeNum; i++) {
        novasPecas.push({
          largura: larguraNum,
          altura: alturaNum,
          tipoCorte: tipoCorte,
          id: crypto.randomUUID(),
          nome: nomeSanitizado,
          numeroOriginal: pecasExistentes.length + i + 1,
        });
      }

      // Valida se as peças cabem ANTES de adicionar
      if (onValidarAntes) {
        const cabem = await onValidarAntes(novasPecas);
        if (!cabem) {
          setErro("Não há espaço na chapa para estas peças.");
          return;
        }
      }

      // Adiciona todas as peças de uma vez
      onAdicionar(quantidadeNum === 1 ? novasPecas[0] : novasPecas);

      // Reseta nome e quantidade após adicionar
      setNome("");
      setQuantidade("1");
    } finally {
      setValidando(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAdicionar();
    }
  };


  const chapaCheia = pecasNaoCouberam.length > 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg">Cadastro de Peças</CardTitle>
          {chapaCheia && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-500" />
              <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                {pecasNaoCouberam.length} peça{pecasNaoCouberam.length > 1 ? 's' : ''} não coube{pecasNaoCouberam.length > 1 ? 'ram' : 'u'}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="pecaNome" className="text-xs sm:text-sm">
            Nome da Peça (opcional)
          </Label>
          <Input
            id="pecaNome"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ex: Tampa lateral, Base, etc."
            className="h-9 sm:h-10"
            aria-label="Nome da peça (opcional)"
          />
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="pecaLargura" className="text-xs sm:text-sm">
              Comprimento (Eixo X)
            </Label>
            <Input
              id="pecaLargura"
              type="number"
              value={largura}
              onChange={(e) => setLargura(e.target.value)}
              onKeyPress={handleKeyPress}
              min="0"
              step="10"
              className="h-9 sm:h-10"
              placeholder="mm"
              aria-label="Comprimento da peça em milímetros (Eixo X)"
              aria-required="true"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pecaAltura" className="text-xs sm:text-sm">
              Largura (Eixo Y)
            </Label>
            <Input
              id="pecaAltura"
              type="number"
              value={altura}
              onChange={(e) => setAltura(e.target.value)}
              onKeyPress={handleKeyPress}
              min="0"
              step="10"
              className="h-9 sm:h-10"
              placeholder="mm"
              aria-label="Largura da peça em milímetros (Eixo Y)"
              aria-required="true"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pecaQuantidade" className="text-xs sm:text-sm">
              Qtd
            </Label>
            <Input
              id="pecaQuantidade"
              type="number"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              onKeyPress={handleKeyPress}
              min="1"
              step="1"
              className="h-9 sm:h-10"
              aria-label="Quantidade de peças a adicionar"
              aria-required="true"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1">
            <Label htmlFor="tipoCorte" className="text-xs sm:text-sm">
              Tipo de Corte (Cut Type)
            </Label>
            <InfoTooltip
              title={parametrosInfo.tipoCorte.title}
              content={parametrosInfo.tipoCorte.content}
            />
          </div>
          <Select value={tipoCorte} onValueChange={(value: TipoCorte) => setTipoCorte(value)}>
            <SelectTrigger id="tipoCorte" className="h-9 sm:h-10" aria-label="Tipo de corte da peça">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="externo">🔵 Externo (G41)</SelectItem>
              <SelectItem value="interno">🔴 Interno (G42)</SelectItem>
              <SelectItem value="na-linha">⚪ Na Linha (G40)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {erro && (
          <p className="text-xs sm:text-sm text-red-600 font-medium" data-testid="erro-cadastro">{erro}</p>
        )}

        <Button
          onClick={handleAdicionar}
          className="w-full h-10 sm:h-11 font-semibold border-2 border-primary/50 shadow-md hover:shadow-lg transition-all"
          size="lg"
          disabled={validando}
          data-testid="btn-adicionar-peca"
        >
          {validando ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Validando...
            </>
          ) : (
            "Adicionar Peça"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
