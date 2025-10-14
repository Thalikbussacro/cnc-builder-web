"use client";

import { useState, useEffect } from "react";
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
    <main className="min-h-screen">
      {/* Header */}
      <div className="border-b sticky top-0 z-50 bg-[#292318] shadow-lg">
        <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold truncate">Gerador de G-code CNC</h1>
              <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
                Configure, adicione peças e gere o código automaticamente
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <DicionarioGCode />
              <Button
                onClick={handleVisualizarGCode}
                variant="default"
                size="sm"
                disabled={pecas.length === 0}
                className="text-xs font-semibold !border-2 !border-primary/50 shadow-md hover:shadow-lg transition-all whitespace-nowrap"
              >
                📝 <span className="hidden sm:inline">Baixar/Copiar </span>G-code
              </Button>
              <Button
                onClick={handleLimpar}
                variant="destructive"
                size="sm"
                disabled={pecas.length === 0}
                className="text-xs font-semibold !border-2 !border-destructive/50 shadow-md hover:shadow-lg transition-all"
              >
                🗑️ <span className="hidden sm:inline">Limpar</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 xl:grid-cols-[420px,1fr] gap-4 lg:gap-6">
          {/* Coluna Esquerda - Configurações com Abas */}
          <div className="order-1 xl:order-1">
            <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-3">
                <TabsTrigger value="chapa" className="text-xs sm:text-sm">Chapa</TabsTrigger>
                <TabsTrigger value="corte" className="text-xs sm:text-sm">Corte</TabsTrigger>
                <TabsTrigger value="ferramenta" className="text-xs sm:text-sm">Fresa</TabsTrigger>
                <TabsTrigger value="nesting" className="text-xs sm:text-sm">Nesting</TabsTrigger>
              </TabsList>

              <div className="space-y-3">
                <TabsContent value="chapa" className="mt-0 space-y-3">
                  <ConfiguracoesChapa config={configChapa} onChange={setConfigChapa} />
                </TabsContent>

                <TabsContent value="corte" className="mt-0 space-y-3">
                  <ConfiguracoesCorte config={configCorte} onChange={setConfigCorte} />
                </TabsContent>

                <TabsContent value="ferramenta" className="mt-0 space-y-3">
                  <ConfiguracoesFerramenta config={configFerramenta} onChange={setConfigFerramenta} />
                </TabsContent>

                <TabsContent value="nesting" className="mt-0 space-y-3">
                  <SeletorNesting
                    metodo={metodoNesting}
                    onChange={setMetodoNesting}
                    metricas={metricas}
                  />
                </TabsContent>

                {/* Cadastro de Peças sempre visível */}
                <CadastroPeca
                  onAdicionar={handleAdicionarPeca}
                  configChapa={configChapa}
                  espacamento={configCorte.espacamento}
                  pecasExistentes={pecas}
                  metodoNesting={metodoNesting}
                />
              </div>
            </Tabs>
          </div>

          {/* Coluna Direita - Preview e Lista */}
          <div className="order-2 xl:order-2 space-y-3">
            <PreviewCanvas
              chapaLargura={configChapa.largura}
              chapaAltura={configChapa.altura}
              pecasPosicionadas={pecasPosicionadas}
            />
            <ListaPecas pecas={pecas} onRemover={handleRemoverPeca} />
          </div>
        </div>
      </div>

      {/* Visualizador G-Code (Painel Lateral) */}
      <VisualizadorGCode
        isOpen={visualizadorAberto}
        onClose={() => setVisualizadorAberto(false)}
        gcode={gcodeGerado}
        onDownload={handleBaixarGCode}
      />
    </main>
  );
}
