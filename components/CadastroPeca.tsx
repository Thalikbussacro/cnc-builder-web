"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InfoTooltip } from "@/components/InfoTooltip";
import { parametrosInfo } from "@/lib/parametros-info";
import { sanitizeString } from "@/lib/sanitize";
import { toast } from "sonner";
import { FileDown } from "lucide-react";
import { useConfigStore } from "@/stores/useConfigStore";
import type { Peca, TipoCorte } from "@/types";

export function CadastroPeca() {
  const { addPeca, configChapa, pecas } = useConfigStore();
  const pecasExistentes = pecas;
  const onAdicionar = addPeca;
  const [largura, setLargura] = useState<string>("");
  const [altura, setAltura] = useState<string>("");
  const [tipoCorte, setTipoCorte] = useState<TipoCorte>("externo");
  const [nome, setNome] = useState<string>("");
  const [quantidade, setQuantidade] = useState<string>("1");
  const [erro, setErro] = useState<string>("");

  const handleAdicionar = () => {
    setErro("");

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

    // Adiciona todas as peças de uma vez
    // Nota: Validação de espaço é feita pela API no preview
    onAdicionar(quantidadeNum === 1 ? novasPecas[0] : novasPecas);

    // Reseta nome e quantidade após adicionar
    setNome("");
    setQuantidade("1");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAdicionar();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split('\n');

        // Pula header (primeira linha)
        const pecasNovas: Peca[] = lines.slice(1)
          .filter(line => line.trim())
          .map((line, i) => {
            const [largura, altura, tipoCorte, nome] = line.split(',');
            const nomeRaw = nome?.trim() || `Peça ${pecasExistentes.length + i + 1}`;
            return {
              id: crypto.randomUUID(),
              largura: parseFloat(largura),
              altura: parseFloat(altura),
              tipoCorte: tipoCorte?.trim() as TipoCorte || "externo",
              nome: sanitizeString(nomeRaw),
            };
          });

        // Validar peças
        const validas = pecasNovas.filter(p =>
          !isNaN(p.largura) &&
          !isNaN(p.altura) &&
          p.largura > 0 &&
          p.altura > 0 &&
          ['externo', 'interno', 'na-linha'].includes(p.tipoCorte)
        );

        if (validas.length > 0) {
          onAdicionar(validas);
          toast.success(`${validas.length} peça(s) importada(s) do CSV`);

          // Limpa o input file para permitir upload do mesmo arquivo novamente
          e.target.value = '';
        } else {
          toast.error('Nenhuma peça válida encontrada no CSV');
        }
      } catch (error) {
        toast.error('Erro ao ler arquivo CSV');
        console.error('Erro CSV:', error);
      }
    };

    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const csv = `largura,altura,tipoCorte,nome
100,200,externo,Peça A
150,150,interno,Peça B
200,100,externo,Peça C
300,250,na-linha,Peça D`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-pecas.csv';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Template CSV baixado com sucesso');
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

        {/* Separador */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              ou importar múltiplas
            </span>
          </div>
        </div>

        {/* Upload CSV */}
        <div className="space-y-2">
          <Label htmlFor="csvUpload" className="text-xs sm:text-sm">
            Importar Peças via CSV
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="csvUpload"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="h-9 sm:h-10 cursor-pointer file:mr-2 file:px-3 file:py-1.5 file:rounded file:border-0 file:text-xs file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
              className="h-9 sm:h-10 whitespace-nowrap"
              title="Baixar template CSV com formato correto"
            >
              <FileDown className="h-4 w-4 mr-1.5" />
              Template
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Formato: largura, altura, tipoCorte, nome
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
