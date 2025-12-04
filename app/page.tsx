"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MainLayout } from "@/components/MainLayout";
import { Sidebar, type SecaoSidebar } from "@/components/Sidebar";
import { ConfiguracoesChapa } from "@/components/ConfiguracoesChapa";
import { ConfiguracoesCorte } from "@/components/ConfiguracoesCorte";
import { ConfiguracoesFerramenta } from "@/components/ConfiguracoesFerramenta";
import { CadastroPeca } from "@/components/CadastroPeca";
import { ListaPecas } from "@/components/ListaPecas";
import { PreviewCanvas } from "@/components/PreviewCanvas";
import { SeletorNesting } from "@/components/SeletorNesting";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Menu, Loader2 } from "lucide-react";
import type { FormatoArquivo, VersaoGerador, ValidationResult } from "@/types";
import { downloadGCode } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useDebounce } from "@/hooks/useDebounce";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { ApiClient } from "@/lib/api-client";
import { sanitizeValue } from "@/lib/validation-rules";
import { useValidationContext } from "@/contexts/ValidationContext";
import { toast } from "sonner";
import { useConfigStore } from "@/stores/useConfigStore";

// Componentes grandes carregados sob demanda (code splitting)
const VisualizadorGCode = dynamic(() => import("@/components/VisualizadorGCode").then(mod => ({ default: mod.VisualizadorGCode })), {
  loading: () => <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>,
  ssr: false,
});

const DicionarioGCode = dynamic(() => import("@/components/DicionarioGCode").then(mod => ({ default: mod.DicionarioGCode })), {
  loading: () => <Button disabled><Loader2 className="h-4 w-4 animate-spin mr-2" />Carregando...</Button>,
  ssr: false,
});

const ValidationDialog = dynamic(() => import("@/components/ValidationDialog").then(mod => ({ default: mod.ValidationDialog })), {
  ssr: false,
});

export default function Home() {
  const { hasErrors } = useValidationContext();

  // Estado global com Zustand (persiste automaticamente via middleware)
  const {
    configChapa,
    configCorte,
    configFerramenta,
    metodoNesting,
    pecas,
    removePeca,
    updatePeca,
    setPecas,
  } = useConfigStore();

  // Estados específicos da UI (não fazem parte do estado global)
  const [versaoGerador, setVersaoGerador] = useLocalStorage<VersaoGerador>('cnc-versao-gerador', 'v2');
  const [incluirComentarios, setIncluirComentarios] = useLocalStorage<boolean>('cnc-incluir-comentarios', true);
  const [visualizadorAberto, setVisualizadorAberto] = useState(false);
  const [gcodeGerado, setGcodeGerado] = useState("");
  const [secaoAtiva, setSecaoAtiva] = useLocalStorage<SecaoSidebar>('cnc-secao-ativa', 'chapa');
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

  // Estados de validação
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult>({ valid: true, errors: [], warnings: [] });
  const [erro, setErro] = useState<string | null>(null);

  // Debounce para valores que mudam frequentemente durante digitação
  const debouncedLargura = useDebounce(configChapa.largura, 300);
  const debouncedAltura = useDebounce(configChapa.altura, 300);
  const debouncedEspacamento = useDebounce(configCorte.espacamento, 300);
  const debouncedMargemBorda = useDebounce(configCorte.margemBorda, 300);

  // Memoiza configurações sanitizadas para evitar recalcular a cada render
  const sanitizedConfigs = useMemo(() => ({
    configChapa: {
      largura: sanitizeValue('chapaLargura', debouncedLargura),
      altura: sanitizeValue('chapaAltura', debouncedAltura),
      espessura: sanitizeValue('espessuraChapa', configChapa.espessura),
    },
    configCorte: {
      ...configCorte,
      profundidade: sanitizeValue('profundidade', configCorte.profundidade),
      profundidadePorPassada: sanitizeValue('profundidadePorPassada', configCorte.profundidadePorPassada),
      espacamento: sanitizeValue('espacamento', debouncedEspacamento),
      margemBorda: sanitizeValue('margemBorda', debouncedMargemBorda),
      feedrate: sanitizeValue('feedrate', configCorte.feedrate),
      plungeRate: sanitizeValue('plungeRate', configCorte.plungeRate),
      rapidsSpeed: sanitizeValue('rapidsSpeed', configCorte.rapidsSpeed),
      spindleSpeed: sanitizeValue('spindleSpeed', configCorte.spindleSpeed),
      anguloRampa: sanitizeValue('anguloRampa', configCorte.anguloRampa),
    },
    configFerramenta: {
      diametro: sanitizeValue('diametroFresa', configFerramenta.diametro),
      numeroFerramenta: configFerramenta.numeroFerramenta,
    },
  }), [
    debouncedLargura,
    debouncedAltura,
    debouncedEspacamento,
    debouncedMargemBorda,
    configChapa.espessura,
    configCorte,
    configFerramenta,
  ]);

  // Preview automático via React Query
  const { data: previewData, isLoading: carregandoPreview } = useQuery({
    queryKey: ['preview', pecas, sanitizedConfigs, metodoNesting],
    queryFn: async () => {
      return await ApiClient.validate({
        pecas: pecas.filter(p => !p.ignorada),
        configChapa: sanitizedConfigs.configChapa,
        configCorte: sanitizedConfigs.configCorte,
        configFerramenta: sanitizedConfigs.configFerramenta,
        metodoNesting,
      });
    },
    enabled: pecas.length > 0, // Só busca se houver peças
    staleTime: 5000, // Cache de 5 segundos
    retry: false, // Não retenta em caso de erro (preview não é crítico)
  });

  // Extrai dados do preview (ou usa valores vazios)
  const pecasPosicionadas = previewData?.preview?.pecasPosicionadas ?? [];
  const metricas = previewData?.preview?.metricas;
  const tempoEstimado = previewData?.preview?.tempoEstimado;

  // Mutation para gerar G-code
  const generateGCodeMutation = useMutation({
    mutationFn: async () => {
      return await ApiClient.gerarGCode({
        pecas: pecas.filter(p => !p.ignorada),
        configChapa: sanitizedConfigs.configChapa,
        configCorte: sanitizedConfigs.configCorte,
        configFerramenta: sanitizedConfigs.configFerramenta,
        metodoNesting,
        incluirComentarios,
      });
    },
    onSuccess: (response) => {
      setGcodeGerado(response.gcode);
      setVisualizadorAberto(true);
      toast.success('G-code gerado com sucesso!', {
        description: `${pecas.filter(p => !p.ignorada).length} peças processadas`,
      });
    },
    onError: (error: unknown) => {
      const mensagemErro = error instanceof Error ? error.message : 'Erro ao gerar G-code';
      setErro(mensagemErro);
      toast.error('Erro ao gerar G-code', {
        description: mensagemErro,
      });
    },
  });

  // Handlers (declarados antes de serem usados pelos hooks)
  const handleRemoverPeca = (id: string) => {
    removePeca(id);
  };

  const handleToggleIgnorar = (id: string) => {
    const peca = pecas.find(p => p.id === id);
    if (peca) {
      updatePeca(id, { ignorada: !peca.ignorada });
    }
  };

  const handleLimpar = () => {
    if (pecas.length > 0 && !confirm("Deseja limpar todas as peças?")) {
      return;
    }
    setPecas([]);
  };

  // Handler para visualizar G-code
  const handleVisualizarGCode = async () => {
    // BLOQUEIA se houver erros de validação nos campos
    if (hasErrors()) {
      setErro('Corrija os erros nos campos destacados antes de gerar o G-code');
      return;
    }

    // Limpa erros anteriores
    setErro(null);

    try {
      // VALIDAÇÃO VIA API (fonte única da verdade)
      const result = await ApiClient.validate({
        pecas: pecas.filter(p => !p.ignorada),
        configChapa: sanitizedConfigs.configChapa,
        configCorte: sanitizedConfigs.configCorte,
        configFerramenta: sanitizedConfigs.configFerramenta,
        metodoNesting,
      });

      // Se houver erros ou avisos, mostra dialog
      if (!result.valid || result.warnings.length > 0) {
        setValidationResult(result);
        setValidationDialogOpen(true);

        // Toast de warning
        if (result.warnings.length > 0 && !result.errors.length) {
          toast.warning('Configurações com avisos', {
            description: 'Revise os avisos antes de continuar',
            action: {
              label: 'Revisar',
              onClick: () => setValidationDialogOpen(true),
            },
          });
        }
        return;
      }

      // Gera G-code via mutation (validação já foi feita)
      generateGCodeMutation.mutate();
    } catch (error) {
      const mensagemErro = error instanceof Error ? error.message : 'Erro ao validar configurações';
      setErro(mensagemErro);
      toast.error('Erro ao validar configurações', {
        description: mensagemErro,
      });
    }
  };

  // Handler para continuar mesmo com avisos
  const handleContinueWithWarnings = () => {
    setValidationDialogOpen(false);
    // Gera G-code via mutation (mesmo com avisos)
    generateGCodeMutation.mutate();
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
      toast.success('G-code baixado!', {
        description: `Arquivo .${formato} salvo`,
      });
    }
  };

  // Atalhos de teclado (declarados depois dos handlers)
  useKeyboardShortcuts({
    onGenerate: handleVisualizarGCode,
    onClear: handleLimpar,
    onClose: () => {
      setVisualizadorAberto(false);
      setValidationDialogOpen(false);
    },
  });

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
              <ThemeToggle />
              <DicionarioGCode />
              <Button
                onClick={handleVisualizarGCode}
                variant="default"
                size="sm"
                disabled={pecas.length === 0 || generateGCodeMutation.isPending || hasErrors()}
                title={hasErrors() ? "Corrija os erros nos campos antes de gerar o G-code" : undefined}
              >
                {generateGCodeMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <span className="hidden md:inline">Baixar/Copiar </span>G-code
                <kbd className="hidden xl:inline ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-background/20 rounded border border-background/30 opacity-60">
                  Ctrl+Enter
                </kbd>
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
                <kbd className="hidden xl:inline ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-background/20 rounded border border-background/30 opacity-60">
                  Ctrl+K
                </kbd>
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
                    <ConfiguracoesChapa />
                  )}
                  {secaoAtiva === 'corte' && (
                    <ConfiguracoesCorte />
                  )}
                  {secaoAtiva === 'ferramenta' && (
                    <ConfiguracoesFerramenta />
                  )}
                  {secaoAtiva === 'nesting' && (
                    <SeletorNesting
                      metricas={metricas}
                      tempoEstimado={tempoEstimado}
                    />
                  )}
                  {secaoAtiva === 'adicionar-peca' && (
                    <CadastroPeca />
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
                  carregando={carregandoPreview}
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
