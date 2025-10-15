"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/MainLayout";
import { ConfiguracoesChapa } from "@/components/ConfiguracoesChapa";
import { ConfiguracoesCorte } from "@/components/ConfiguracoesCorte";
import { ConfiguracoesFerramenta } from "@/components/ConfiguracoesFerramenta";
import { CadastroPeca } from "@/components/CadastroPeca";
import { ListaPecas } from "@/components/ListaPecas";
import { PreviewCanvas } from "@/components/PreviewCanvas";
import { VisualizadorGCode } from "@/components/VisualizadorGCode";
import { SeletorNesting } from "@/components/SeletorNesting";
import { DicionarioGCode } from "@/components/DicionarioGCode";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Peca, PecaPosicionada, ConfiguracoesChapa as TConfigChapa, ConfiguracoesCorte as TConfigCorte, ConfiguracoesFerramenta as TConfigFerramenta, FormatoArquivo } from "@/types";
import { posicionarPecas, type MetodoNesting } from "@/lib/nesting-algorithm";
import { gerarGCode, downloadGCode } from "@/lib/gcode-generator";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export default function Home() {
  // Estados com localStorage
  const [configChapa, setConfigChapa] = useLocalStorage<TConfigChapa>('cnc-config-chapa', {
    largura: 2850,
    altura: 1500,
    espessura: 15,
  });

  const [configCorte, setConfigCorte] = useLocalStorage<TConfigCorte>('cnc-config-corte', {
    profundidade: 15,
    espacamento: 50,
    profundidadePorPassada: 4,
    feedrate: 1500,
    plungeRate: 500,
    spindleSpeed: 18000,
  });

  const [configFerramenta, setConfigFerramenta] = useLocalStorage<TConfigFerramenta>('cnc-config-ferramenta', {
    diametro: 6,
    numeroFerramenta: 1,
  });

  const [metodoNesting, setMetodoNesting] = useLocalStorage<MetodoNesting>('cnc-metodo-nesting', 'greedy');

  // Estados sem localStorage (temporários)
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [pecasPosicionadas, setPecasPosicionadas] = useState<PecaPosicionada[]>([]);
  const [visualizadorAberto, setVisualizadorAberto] = useState(false);
  const [gcodeGerado, setGcodeGerado] = useState("");
  const [metricas, setMetricas] = useState<{ areaUtilizada: number; eficiencia: number; tempo: number } | undefined>();
  const [abaAtiva, setAbaAtiva] = useLocalStorage<string>('cnc-aba-ativa', 'chapa');

  // Atualiza posicionamento sempre que algo mudar
  useEffect(() => {
    const resultado = posicionarPecas(
      pecas,
      configChapa.largura,
      configChapa.altura,
      configCorte.espacamento,
      metodoNesting
    );
    setPecasPosicionadas(resultado.posicionadas);
    setMetricas(resultado.metricas);
  }, [pecas, configChapa.largura, configChapa.altura, configCorte.espacamento, metodoNesting]);

  // Handler para adicionar peça
  const handleAdicionarPeca = (peca: Peca) => {
    setPecas([...pecas, peca]);
  };

  // Handler para remover peça individual
  const handleRemoverPeca = (id: string) => {
    setPecas(pecas.filter(p => p.id !== id));
  };

  // Handler para limpar tudo
  const handleLimpar = () => {
    if (pecas.length > 0 && !confirm("Deseja limpar todas as peças?")) {
      return;
    }
    setPecas([]);
  };

  // Handler para visualizar G-code
  const handleVisualizarGCode = () => {
    if (pecas.length === 0) {
      alert("Adicione ao menos uma peça antes de visualizar o G-code.");
      return;
    }

    const gcode = gerarGCode(pecasPosicionadas, configChapa, configCorte, configFerramenta);
    setGcodeGerado(gcode);
    setVisualizadorAberto(true);
  };

  // Handler para baixar G-code
  const handleBaixarGCode = (formato: FormatoArquivo) => {
    if (gcodeGerado) {
      downloadGCode(gcodeGerado, formato);
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-3 h-full">
        {/* Top Actions Bar */}
        <div className="flex items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <DicionarioGCode />
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleVisualizarGCode}
              variant="default"
              size="sm"
              disabled={pecas.length === 0}
            >
              <span className="hidden sm:inline">Baixar/Copiar </span>G-code
            </Button>
            <Button
              onClick={handleLimpar}
              variant="destructive"
              size="sm"
              disabled={pecas.length === 0}
            >
              <span className="hidden sm:inline">Limpar</span>
            </Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 flex-1 overflow-hidden">
          {/* Left Column - Configurations */}
          <div className="flex flex-col gap-3 overflow-auto">
            <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="chapa">Chapa</TabsTrigger>
                <TabsTrigger value="corte">Corte</TabsTrigger>
                <TabsTrigger value="ferramenta">Fresa</TabsTrigger>
                <TabsTrigger value="nesting">Nesting</TabsTrigger>
              </TabsList>

              <div className="space-y-3 mt-3">
                <TabsContent value="chapa" className="mt-0">
                  <ConfiguracoesChapa config={configChapa} onChange={setConfigChapa} />
                </TabsContent>

                <TabsContent value="corte" className="mt-0">
                  <ConfiguracoesCorte config={configCorte} onChange={setConfigCorte} />
                </TabsContent>

                <TabsContent value="ferramenta" className="mt-0">
                  <ConfiguracoesFerramenta config={configFerramenta} onChange={setConfigFerramenta} />
                </TabsContent>

                <TabsContent value="nesting" className="mt-0">
                  <SeletorNesting
                    metodo={metodoNesting}
                    onChange={setMetodoNesting}
                    metricas={metricas}
                  />
                </TabsContent>
              </div>
            </Tabs>

            <CadastroPeca
              onAdicionar={handleAdicionarPeca}
              configChapa={configChapa}
              espacamento={configCorte.espacamento}
              pecasExistentes={pecas}
              metodoNesting={metodoNesting}
            />
          </div>

          {/* Right Column - Preview and List */}
          <div className="flex flex-col gap-3 overflow-auto">
            <PreviewCanvas
              chapaLargura={configChapa.largura}
              chapaAltura={configChapa.altura}
              pecasPosicionadas={pecasPosicionadas}
            />
            <ListaPecas pecas={pecas} onRemover={handleRemoverPeca} />
          </div>
        </div>
      </div>

      {/* G-Code Viewer */}
      <VisualizadorGCode
        isOpen={visualizadorAberto}
        onClose={() => setVisualizadorAberto(false)}
        gcode={gcodeGerado}
        onDownload={handleBaixarGCode}
      />
    </MainLayout>
  );
}
