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
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gerador de G-code CNC</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Configure a chapa, adicione peças e gere o código G-code automaticamente
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-[450px,1fr] gap-6 lg:gap-8">
          {/* Coluna Esquerda - Configurações */}
          <div className="space-y-4 sm:space-y-6 order-2 xl:order-1">
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
              className="w-full h-12 text-base sm:text-lg"
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
