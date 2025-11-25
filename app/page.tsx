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
import { ValidationDialog } from "@/components/ValidationDialog";
import { Button } from "@/components/ui/button";
import { Menu, Loader2 } from "lucide-react";
import type { Peca, PecaPosicionada, ConfiguracoesChapa as TConfigChapa, ConfiguracoesCorte as TConfigCorte, ConfiguracoesFerramenta as TConfigFerramenta, FormatoArquivo, VersaoGerador, TempoEstimado } from "@/types";
import { posicionarPecas, type MetodoNesting } from "@/lib/nesting-algorithm";
import { gerarGCode, downloadGCode, calcularTempoEstimado } from "@/lib/gcode-generator";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useDebounce } from "@/hooks/useDebounce";
import { validateConfigurations, type ValidationResult, type ValidationField } from "@/lib/validator";
import { ApiClient } from "@/lib/api-client";

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
    aplicarRampaEm: 'primeira-passada',
    usarMesmoEspacamentoBorda: true,
    margemBorda: 50,
  });

  const [configFerramenta, setConfigFerramenta] = useLocalStorage<TConfigFerramenta>('cnc-config-ferramenta', {
    diametro: 6,
    numeroFerramenta: 1,
  });

  const [metodoNesting, setMetodoNesting] = useLocalStorage<MetodoNesting>('cnc-metodo-nesting', 'shelf');

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
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

  // Estados de validação
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult>({ valid: true, errors: [], warnings: [] });
  const [errorFields, setErrorFields] = useState<ValidationField[]>([]);

  // Estados de API
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Debounce para valores que mudam frequentemente durante digitação
  const debouncedLargura = useDebounce(configChapa.largura, 500);
  const debouncedAltura = useDebounce(configChapa.altura, 500);
  const debouncedEspacamento = useDebounce(configCorte.espacamento, 500);
  const debouncedMargemBorda = useDebounce(configCorte.margemBorda, 500);

  // Atualiza posicionamento após debounce
  useEffect(() => {
    // Usa margem de borda customizada se configurado, senão usa espaçamento
    const margemBorda = configCorte.usarMesmoEspacamentoBorda ? undefined : debouncedMargemBorda;

    const resultado = posicionarPecas(
      pecas,
      debouncedLargura,
      debouncedAltura,
      debouncedEspacamento,
      metodoNesting,
      margemBorda
    );
    setPecasPosicionadas(resultado.posicionadas);
    setMetricas(resultado.metricas);
  }, [pecas, debouncedLargura, debouncedAltura, debouncedEspacamento, configCorte.usarMesmoEspacamentoBorda, debouncedMargemBorda, metodoNesting]);

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
    configCorte.anguloRampa,
    configCorte.aplicarRampaEm
  ]);

  // Handler para adicionar peça (aceita uma ou múltiplas)
  const handleAdicionarPeca = (peca: Peca | Peca[]) => {
    if (Array.isArray(peca)) {
      setPecas([...pecas, ...peca]);
    } else {
      setPecas([...pecas, peca]);
    }
  };

  // Handler para remover peça individual
  const handleRemoverPeca = (id: string) => {
    setPecas(pecas.filter(p => p.id !== id));
  };

  // Handler para alternar estado de ignorar peça
  const handleToggleIgnorar = (id: string) => {
    setPecas(pecas.map(p =>
      p.id === id ? { ...p, ignorada: !p.ignorada } : p
    ));
  };

  // Handler para limpar tudo
  const handleLimpar = () => {
    if (pecas.length > 0 && !confirm("Deseja limpar todas as peças?")) {
      return;
    }
    setPecas([]);
  };

  // Handler para visualizar G-code
  const handleVisualizarGCode = async () => {
    // Limpa erros anteriores
    setErro(null);

    // Executa validações
    const result = validateConfigurations(
      configChapa,
      configCorte,
      configFerramenta,
      pecasPosicionadas
    );

    // Extrai campos com erro para destacar na UI
    const fieldsWithErrors: ValidationField[] = [
      ...result.errors.map(e => e.field),
      ...result.warnings.map(w => w.field)
    ];
    setErrorFields(fieldsWithErrors);

    // Se houver erros ou avisos, mostra dialog
    if (!result.valid || result.warnings.length > 0) {
      setValidationResult(result);
      setValidationDialogOpen(true);
      return;
    }

    // Gera G-code via API
    try {
      setCarregando(true);

      const response = await ApiClient.gerarGCode({
        pecas: pecas.filter(p => !p.ignorada),
        configChapa,
        configCorte,
        configFerramenta,
        metodoNesting,
        incluirComentarios,
      });

      setGcodeGerado(response.gcode);
      setVisualizadorAberto(true);
    } catch (error) {
      const mensagemErro = error instanceof Error ? error.message : 'Erro ao gerar G-code';
      setErro(mensagemErro);
      console.error('Erro ao gerar G-code:', error);
    } finally {
      setCarregando(false);
    }
  };

  // Handler para continuar mesmo com avisos
  const handleContinueWithWarnings = async () => {
    setValidationDialogOpen(false);

    // Gera G-code via API (mesmo com avisos)
    try {
      setCarregando(true);

      const response = await ApiClient.gerarGCode({
        pecas: pecas.filter(p => !p.ignorada),
        configChapa,
        configCorte,
        configFerramenta,
        metodoNesting,
        incluirComentarios,
      });

      setGcodeGerado(response.gcode);
      setVisualizadorAberto(true);
    } catch (error) {
      const mensagemErro = error instanceof Error ? error.message : 'Erro ao gerar G-code';
      setErro(mensagemErro);
      console.error('Erro ao gerar G-code:', error);
    } finally {
      setCarregando(false);
    }
  };

  // Handler para mudança de versão do gerador
  const handleVersaoChange = (novaVersao: VersaoGerador) => {
    setVersaoGerador(novaVersao);
  };

  // Nota: G-code agora é gerado via API no handleVisualizarGCode

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
        <Sidebar
          secaoAtiva={secaoAtiva}
          onSecaoChange={setSecaoAtiva}
          mobileOpen={sidebarMobileOpen}
          onMobileOpenChange={setSidebarMobileOpen}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Actions Bar */}
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b flex-shrink-0 bg-card/50">
            <div className="flex items-center gap-3">
              {/* Menu Button (Mobile) */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarMobileOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Logo/Title */}
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold hidden sm:block">G-Code Generator</h1>
                <h1 className="text-lg font-semibold sm:hidden">GCG</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DicionarioGCode />
              <Button
                onClick={handleVisualizarGCode}
                variant="default"
                size="sm"
                disabled={pecas.length === 0 || carregando}
              >
                {carregando && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <span className="hidden md:inline">Baixar/Copiar </span>G-code
              </Button>
              <Button
                onClick={handleLimpar}
                variant="destructive"
                size="sm"
                disabled={pecas.length === 0}
                title="Limpar todas as peças"
              >
                <span className="hidden sm:inline">Limpar</span>
                <span className="sm:hidden">✕</span>
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {erro && (
            <div className="mx-4 mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-2">
              <span className="text-destructive text-sm flex-1">{erro}</span>
              <button
                onClick={() => setErro(null)}
                className="text-destructive hover:text-destructive/80 font-bold"
              >
                ✕
              </button>
            </div>
          )}

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
                    <ConfiguracoesCorte
                      config={configCorte}
                      onChange={setConfigCorte}
                      errorFields={errorFields}
                    />
                  )}
                  {secaoAtiva === 'ferramenta' && (
                    <ConfiguracoesFerramenta
                      config={configFerramenta}
                      onChange={setConfigFerramenta}
                      errorFields={errorFields}
                    />
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
                      margemBorda={configCorte.usarMesmoEspacamentoBorda ? undefined : configCorte.margemBorda}
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
                <ListaPecas pecas={pecas} onRemover={handleRemoverPeca} onToggleIgnorar={handleToggleIgnorar} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Dialog */}
      <ValidationDialog
        open={validationDialogOpen}
        onOpenChange={setValidationDialogOpen}
        validation={validationResult}
        onContinue={validationResult.errors.length === 0 ? handleContinueWithWarnings : undefined}
      />

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
