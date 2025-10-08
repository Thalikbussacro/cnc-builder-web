"use client";

import { useState, useEffect } from "react";
import { ConfiguracoesChapa } from "@/components/ConfiguracoesChapa";
import { ConfiguracoesCorte } from "@/components/ConfiguracoesCorte";
import { CadastroPeca } from "@/components/CadastroPeca";
import { ListaPecas } from "@/components/ListaPecas";
import { PreviewCanvas } from "@/components/PreviewCanvas";
import { Button } from "@/components/ui/button";
import type { Peca, PecaPosicionada, ConfiguracoesChapa as TConfigChapa, ConfiguracoesCorte as TConfigCorte } from "@/types";
import { posicionarPecas } from "@/lib/nesting-algorithm";
import { gerarGCode, downloadGCode } from "@/lib/gcode-generator";

export default function Home() {
  // Estados
  const [configChapa, setConfigChapa] = useState<TConfigChapa>({
    largura: 2850,
    altura: 1500,
    espessura: 15,
  });

  const [configCorte, setConfigCorte] = useState<TConfigCorte>({
    profundidade: 15,
    espacamento: 50,
  });

  const [pecas, setPecas] = useState<Peca[]>([]);
  const [pecasPosicionadas, setPecasPosicionadas] = useState<PecaPosicionada[]>([]);

  // Atualiza posicionamento sempre que algo mudar
  useEffect(() => {
    const resultado = posicionarPecas(
      pecas,
      configChapa.largura,
      configChapa.altura,
      configCorte.espacamento
    );
    setPecasPosicionadas(resultado.posicionadas);
  }, [pecas, configChapa.largura, configChapa.altura, configCorte.espacamento]);

  // Handler para adicionar peça
  const handleAdicionarPeca = (peca: Peca) => {
    setPecas([...pecas, peca]);
  };

  // Handler para limpar tudo
  const handleLimpar = () => {
    if (pecas.length > 0 && !confirm("Deseja limpar todas as peças?")) {
      return;
    }
    setPecas([]);
  };

  // Handler para gerar G-code
  const handleGerarGCode = () => {
    if (pecas.length === 0) {
      alert("Adicione ao menos uma peça antes de gerar o G-code.");
      return;
    }

    const gcode = gerarGCode(pecasPosicionadas, configChapa, configCorte);
    downloadGCode(gcode, "corte.nc");
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className="border-b sticky top-0 z-10 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Gerador de G-code CNC</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Configure, adicione peças e gere o código automaticamente
              </p>
            </div>
            <Button
              onClick={handleLimpar}
              variant="outline"
              size="sm"
              disabled={pecas.length === 0}
              className="text-xs sm:text-sm"
            >
              Limpar Tudo
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 xl:grid-cols-[420px,1fr] gap-4 lg:gap-6">
          {/* Coluna Esquerda - Configurações */}
          <div className="space-y-3 sm:space-y-4 order-2 xl:order-1">
            <ConfiguracoesChapa config={configChapa} onChange={setConfigChapa} />
            <ConfiguracoesCorte config={configCorte} onChange={setConfigCorte} />
            <CadastroPeca
              onAdicionar={handleAdicionarPeca}
              configChapa={configChapa}
              espacamento={configCorte.espacamento}
              pecasExistentes={pecas}
            />
            <ListaPecas pecas={pecas} />

            {/* Botão Gerar G-code */}
            <Button
              onClick={handleGerarGCode}
              className="w-full h-10 sm:h-11 text-sm sm:text-base"
              variant="default"
              size="lg"
              disabled={pecas.length === 0}
            >
              Gerar G-code
            </Button>
          </div>

          {/* Coluna Direita - Preview */}
          <div className="order-1 xl:order-2">
            <PreviewCanvas
              chapaLargura={configChapa.largura}
              chapaAltura={configChapa.altura}
              pecasPosicionadas={pecasPosicionadas}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
