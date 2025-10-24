"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InfoTooltip } from "@/components/InfoTooltip";
import { parametrosInfo } from "@/lib/parametros-info";
import type { Peca, ConfiguracoesChapa, TipoCorte } from "@/types";
import { posicionarPecas, type MetodoNesting } from "@/lib/nesting-algorithm";

type CadastroPecaProps = {
  onAdicionar: (peca: Peca) => void;
  configChapa: ConfiguracoesChapa;
  espacamento: number;
  pecasExistentes: Peca[];
  metodoNesting?: MetodoNesting;
};

export function CadastroPeca({
  onAdicionar,
  configChapa,
  espacamento,
  pecasExistentes,
  metodoNesting = 'greedy',
}: CadastroPecaProps) {
  const [largura, setLargura] = useState<string>("500");
  const [altura, setAltura] = useState<string>("500");
  const [tipoCorte, setTipoCorte] = useState<TipoCorte>("externo");
  const [nome, setNome] = useState<string>("");
  const [erro, setErro] = useState<string>("");

  const handleAdicionar = () => {
    setErro("");

    const larguraNum = parseFloat(largura);
    const alturaNum = parseFloat(altura);

    // Validações básicas
    if (isNaN(larguraNum) || larguraNum <= 0) {
      setErro("Informe uma largura válida.");
      return;
    }

    if (isNaN(alturaNum) || alturaNum <= 0) {
      setErro("Informe uma altura válida.");
      return;
    }

    // Verifica se a peça é maior que a chapa
    if (larguraNum > configChapa.largura || alturaNum > configChapa.altura) {
      setErro("Peça maior que a chapa.");
      return;
    }

    // Cria nova peça
    const novaPeca: Peca = {
      largura: larguraNum,
      altura: alturaNum,
      tipoCorte: tipoCorte,
      id: crypto.randomUUID(),
      nome: nome.trim() || undefined, // Só adiciona nome se não estiver vazio
      numeroOriginal: pecasExistentes.length + 1, // Número sequencial baseado na quantidade de peças
    };

    // Simula nesting com todas as peças (existentes + nova) para validar
    const pecasTemp = [...pecasExistentes, novaPeca];
    const resultado = posicionarPecas(
      pecasTemp,
      configChapa.largura,
      configChapa.altura,
      espacamento,
      metodoNesting
    );

    // Verifica se a nova peça coube
    const novaPecaCoube = resultado.posicionadas.some((p) => p.id === novaPeca.id);

    if (!novaPecaCoube) {
      setErro("Não há espaço na chapa para esta peça.");
      return;
    }

    // Adiciona a peça
    onAdicionar(novaPeca);

    // Reseta apenas o nome após adicionar
    setNome("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAdicionar();
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg">Cadastro de Peças</CardTitle>
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
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="pecaLargura" className="text-xs sm:text-sm">
              Largura (mm)
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pecaAltura" className="text-xs sm:text-sm">
              Altura (mm)
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
            <SelectTrigger id="tipoCorte" className="h-9 sm:h-10">
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
          <p className="text-xs sm:text-sm text-red-600 font-medium">{erro}</p>
        )}

        <Button
          onClick={handleAdicionar}
          className="w-full h-10 sm:h-11 font-semibold border-2 border-primary/50 shadow-md hover:shadow-lg transition-all"
          size="lg"
        >
          ✚ Adicionar Peça
        </Button>
      </CardContent>
    </Card>
  );
}
