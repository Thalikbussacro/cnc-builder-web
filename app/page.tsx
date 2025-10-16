"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Sidebar, type SecaoSidebar } from "@/components/Sidebar";
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
import type { Peca, PecaPosicionada, ConfiguracoesChapa as TConfigChapa, ConfiguracoesCorte as TConfigCorte, ConfiguracoesFerramenta as TConfigFerramenta, FormatoArquivo, VersaoGerador, TempoEstimado } from "@/types";
import { posicionarPecas, type MetodoNesting } from "@/lib/nesting-algorithm";
import { gerarGCode, downloadGCode, calcularTempoEstimado } from "@/lib/gcode-generator";
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
    rapidsSpeed: 4000,
    spindleSpeed: 18000,
    usarRampa: false,
    anguloRampa: 3,
  });

  const [configFerramenta, setConfigFerramenta] = useLocalStorage<TConfigFerramenta>('cnc-config-ferramenta', {
    diametro: 6,
    numeroFerramenta: 1,
  });

  const [metodoNesting, setMetodoNesting] = useLocalStorage<MetodoNesting>('cnc-metodo-nesting', 'greedy');

  const [versaoGerador, setVersaoGerador] = useLocalStorage<VersaoGerador>('cnc-versao-gerador', 'v2');

  const [incluirComentarios, setIncluirComentarios] = useLocalStorage<boolean>('cnc-incluir-comentarios', true);

  // Estados sem localStorage (temporários)
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [pecasPosicionadas, setPecasPosicionadas] = useState<PecaPosicionada[]>([]);
  const [visualizadorAberto, setVisualizadorAberto] = useState(false);
  const [gcodeGerado, setGcodeGerado] = useState("");
  const [metricas, setMetricas] = useState<{ areaUtilizada: number; eficiencia: number; tempo: number } | undefined>();
  const [tempoEstimado, setTempoEstimado] = useState<TempoEstimado | undefined>();
  const [secaoAtiva, setSecaoAtiva] = useLocalStorage<SecaoSidebar>('cnc-secao-ativa', 'chapa');

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

  // Calcula tempo estimado sempre que parâmetros mudarem
  useEffect(() => {
    if (pecasPosicionadas.length > 0) {
      const tempo = calcularTempoEstimado(pecasPosicionadas, configChapa, configCorte);
      setTempoEstimado(tempo);
    } else {
      setTempoEstimado(undefined);
    }
  }, [
    pecasPosicionadas,
    configChapa.espessura,
    configCorte.profundidade,
    configCorte.profundidadePorPassada,
    configCorte.feedrate,
    configCorte.plungeRate,
    configCorte.rapidsSpeed,
    configCorte.usarRampa,
    configCorte.anguloRampa
  ]);

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

    setVisualizadorAberto(true);
  };

  // Handler para mudança de versão do gerador
  const handleVersaoChange = (novaVersao: VersaoGerador) => {
    setVersaoGerador(novaVersao);
  };

  // Atualiza G-code quando versão mudar ou visualizador abrir
  useEffect(() => {
    if (visualizadorAberto && pecasPosicionadas.length > 0) {
      const gcode = gerarGCode(pecasPosicionadas, configChapa, configCorte, configFerramenta, versaoGerador, incluirComentarios);
      setGcodeGerado(gcode);
    }
  }, [visualizadorAberto, versaoGerador, incluirComentarios, pecasPosicionadas, configChapa, configCorte, configFerramenta]);

  // Handler para baixar G-code
  const handleBaixarGCode = (formato: FormatoArquivo) => {
    if (gcodeGerado) {
      downloadGCode(gcodeGerado, formato);
    }
  };

  return (
    <MainLayout>
      <div className="flex h-full">
        {/* Sidebar */}
        <Sidebar secaoAtiva={secaoAtiva} onSecaoChange={setSecaoAtiva} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Actions Bar */}
          <div className="flex items-center justify-between gap-2 p-4 border-b flex-shrink-0 lg:pl-4 pl-20">
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

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 p-4 h-full overflow-auto">
              {/* Left Panel - Configuration Form */}
              <div className="overflow-auto h-full">
                <div className="max-w-3xl">
                  {secaoAtiva === 'chapa' && (
                    <ConfiguracoesChapa config={configChapa} onChange={setConfigChapa} />
                  )}
                  {secaoAtiva === 'corte' && (
                    <ConfiguracoesCorte config={configCorte} onChange={setConfigCorte} />
                  )}
                  {secaoAtiva === 'ferramenta' && (
                    <ConfiguracoesFerramenta config={configFerramenta} onChange={setConfigFerramenta} />
                  )}
                  {secaoAtiva === 'nesting' && (
                    <SeletorNesting
                      metodo={metodoNesting}
                      onChange={setMetodoNesting}
                      metricas={metricas}
                      tempoEstimado={tempoEstimado}
                    />
                  )}
                  {secaoAtiva === 'adicionar-peca' && (
                    <CadastroPeca
                      onAdicionar={handleAdicionarPeca}
                      configChapa={configChapa}
                      espacamento={configCorte.espacamento}
                      pecasExistentes={pecas}
                      metodoNesting={metodoNesting}
                    />
                  )}
                </div>
              </div>

              {/* Right Panel - Preview and List */}
              <div className="flex flex-col gap-4 overflow-auto h-full">
                <PreviewCanvas
                  chapaLargura={configChapa.largura}
                  chapaAltura={configChapa.altura}
                  pecasPosicionadas={pecasPosicionadas}
                  tempoEstimado={tempoEstimado}
                />
                <ListaPecas pecas={pecas} onRemover={handleRemoverPeca} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* G-Code Viewer */}
      <VisualizadorGCode
        isOpen={visualizadorAberto}
        onClose={() => setVisualizadorAberto(false)}
        gcode={gcodeGerado}
        onDownload={handleBaixarGCode}
        versaoGerador={versaoGerador}
        onVersaoChange={handleVersaoChange}
        incluirComentarios={incluirComentarios}
        onIncluirComentariosChange={setIncluirComentarios}
      />
    </MainLayout>
  );
}
