"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Peca, ConfiguracoesChapa } from "@/types";
import { posicionarPecas } from "@/lib/nesting-algorithm";

type CadastroPecaProps = {
  onAdicionar: (peca: Peca) => void;
  configChapa: ConfiguracoesChapa;
  espacamento: number;
  pecasExistentes: Peca[];
};

export function CadastroPeca({
  onAdicionar,
  configChapa,
  espacamento,
  pecasExistentes,
}: CadastroPecaProps) {
  const [largura, setLargura] = useState<string>("500");
  const [altura, setAltura] = useState<string>("500");
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
      id: crypto.randomUUID(),
    };

    // Simula nesting com todas as peças (existentes + nova) para validar
    const pecasTemp = [...pecasExistentes, novaPeca];
    const resultado = posicionarPecas(
      pecasTemp,
      configChapa.largura,
      configChapa.altura,
      espacamento
    );

    // Verifica se a nova peça coube
    const novaPecaCoube = resultado.posicionadas.some((p) => p.id === novaPeca.id);

    if (!novaPecaCoube) {
      setErro("Não há espaço na chapa para esta peça.");
      return;
    }

    // Adiciona a peça
    onAdicionar(novaPeca);

    // Limpa os campos
    setLargura("500");
    setAltura("500");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAdicionar();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastro de Peças</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pecaLargura">Largura (mm)</Label>
            <Input
              id="pecaLargura"
              type="number"
              value={largura}
              onChange={(e) => setLargura(e.target.value)}
              onKeyPress={handleKeyPress}
              min="0"
              step="10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pecaAltura">Altura (mm)</Label>
            <Input
              id="pecaAltura"
              type="number"
              value={altura}
              onChange={(e) => setAltura(e.target.value)}
              onKeyPress={handleKeyPress}
              min="0"
              step="10"
            />
          </div>
        </div>

        {erro && (
          <p className="text-sm text-red-600 font-medium">{erro}</p>
        )}

        <Button onClick={handleAdicionar} className="w-full">
          Adicionar Peça
        </Button>
      </CardContent>
    </Card>
  );
}
