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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Menu, Loader2 } from "lucide-react";
import type { FormatoArquivo, VersaoGerador, ValidationResult, Peca } from "@/types";
import { downloadGCode } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useDebounce } from "@/hooks/useDebounce";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { ApiClient } from "@/lib/api-client";
import { sanitizeValue } from "@/lib/validation-rules";
import { useValidationContext } from "@/contexts/ValidationContext";
import { toast } from "sonner";
import { useConfigStore } from "@/stores/useConfigStore";
import { useConfigValidation } from "@/hooks/useConfigValidation";
import { ModalConfirmacaoRemocao } from "@/components/ModalConfirmacaoRemocao";

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
    setConfigChapa,
    setConfigCorte,
    setConfigFerramenta,
    setMetodoNesting,
  } = useConfigStore();

  // Hook de validação de configurações
  const {
    pendingChange,
    validateChapaChange,
    validateCorteChange,
    validateFerramentaChange,
    validateNestingChange,
    cancelPendingChange,
  } = useConfigValidation();

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

  // Estado para modal de confirmação de limpar
  const [clearConfirmDialogOpen, setClearConfirmDialogOpen] = useState(false);

  // Estado para adição de peças pendente (quando peças não cabem)
  const [pendingPecasAdicionais, setPendingPecasAdicionais] = useState<{
    novasPecas: Peca[];
    pecasQueNaoCabem: Peca[];
  } | null>(null);

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

  // Preview automático via React Query com debounce de 1s
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
    staleTime: 1000, // Cache de 1 segundo (debounce para reduzir chamadas)
    retry: false, // Não retenta em caso de erro (preview não é crítico)
  });

  // Extrai dados do preview (ou usa valores vazios)
  const pecasPosicionadas = previewData?.preview?.pecasPosicionadas ?? [];
  const pecasNaoCouberam = previewData?.preview?.pecasNaoCouberam ?? [];
  const metricas = previewData?.preview?.metricas;
  const tempoEstimado = previewData?.preview?.tempoEstimado;

  // Função para validar se novas peças cabem ANTES de adicionar
  const validarPecasAntes = async (novasPecas: Peca[]): Promise<boolean> => {
    try {
      // Combina peças existentes (não ignoradas) com as novas peças
      const pecasParaValidar = [...pecas.filter(p => !p.ignorada), ...novasPecas];

      // Chama API de validação
      const resultado = await ApiClient.validate({
        pecas: pecasParaValidar,
        configChapa: sanitizedConfigs.configChapa,
        configCorte: sanitizedConfigs.configCorte,
        configFerramenta: sanitizedConfigs.configFerramenta,
        metodoNesting,
      });

      const pecasNaoCouberam = resultado.preview?.pecasNaoCouberam ?? [];

      // Se QUALQUER peça (nova ou antiga) não couber, mostra modal de confirmação
      if (pecasNaoCouberam.length > 0) {
        setPendingPecasAdicionais({
          novasPecas,
          pecasQueNaoCabem: pecasNaoCouberam,
        });
        return false; // Não adiciona ainda, aguarda confirmação do usuário
      }

      // Todas as peças cabem, pode adicionar diretamente
      return true;
    } catch (error) {
      console.error('Erro ao validar peças:', error);
      // Em caso de erro na validação, permite adicionar (fail-safe)
      return true;
    }
  };

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
    if (pecas.length > 0) {
      setClearConfirmDialogOpen(true);
    }
  };

  const handleConfirmLimpar = () => {
    setPecas([]);
    setClearConfirmDialogOpen(false);
    toast.success('Peças limpas', {
      description: 'Todas as peças foram removidas',
    });
  };

  // Handlers de confirmação de mudanças que causam remoção de peças
  const handleConfirmarMudanca = () => {
    if (!pendingChange) return;

    // Remove as peças que não cabem
    const idsParaRemover = new Set(pendingChange.pecasQueNaoCabem.map(p => p.id));
    const pecasRestantes = pecas.filter(p => !idsParaRemover.has(p.id));
    setPecas(pecasRestantes);

    // Aplica a nova configuração
    switch (pendingChange.type) {
      case 'chapa':
        setConfigChapa(pendingChange.newValue);
        break;
      case 'corte':
        setConfigCorte(pendingChange.newValue);
        break;
      case 'ferramenta':
        setConfigFerramenta(pendingChange.newValue);
        break;
      case 'nesting':
        setMetodoNesting(pendingChange.newValue);
        break;
    }

    // Limpa mudança pendente
    cancelPendingChange();

    // Mostra toast
    toast.success('Configuração alterada', {
      description: `${pendingChange.pecasQueNaoCabem.length} peça(s) removida(s)`,
    });
  };

  const handleCancelarMudanca = () => {
    if (!pendingChange) return;

    // Reverte para o valor anterior
    switch (pendingChange.type) {
      case 'chapa':
        setConfigChapa(pendingChange.previousValue);
        break;
      case 'corte':
        setConfigCorte(pendingChange.previousValue);
        break;
      case 'ferramenta':
        setConfigFerramenta(pendingChange.previousValue);
        break;
      case 'nesting':
        setMetodoNesting(pendingChange.previousValue);
        break;
    }

    // Limpa mudança pendente
    cancelPendingChange();

    toast.info('Alteração cancelada', {
      description: 'Configuração mantida como estava',
    });
  };

  // Handlers para confirmação de adição de peças
  const handleConfirmarAdicaoPecas = () => {
    if (!pendingPecasAdicionais) return;

    // Remove as peças que não cabem
    const idsParaRemover = new Set(pendingPecasAdicionais.pecasQueNaoCabem.map(p => p.id));
    const pecasRestantes = pecas.filter(p => !idsParaRemover.has(p.id));

    // Adiciona as novas peças
    const todasPecas = [...pecasRestantes, ...pendingPecasAdicionais.novasPecas];
    setPecas(todasPecas);

    // Limpa adição pendente
    setPendingPecasAdicionais(null);

    // Mostra toast
    const qtdAdicionadas = pendingPecasAdicionais.novasPecas.length;
    const qtdRemovidas = pendingPecasAdicionais.pecasQueNaoCabem.length;
    toast.success('Peças adicionadas', {
      description: `${qtdAdicionadas} peça(s) adicionada(s), ${qtdRemovidas} peça(s) removida(s)`,
    });
  };

  const handleCancelarAdicaoPecas = () => {
    if (!pendingPecasAdicionais) return;

    // Limpa adição pendente
    setPendingPecasAdicionais(null);

    toast.info('Adição cancelada', {
      description: 'Nenhuma peça foi adicionada',
    });
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
        <div id="main-content" className="flex-1 flex flex-col overflow-hidden">
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
                    <ConfiguracoesChapa onValidate={validateChapaChange} />
                  )}
                  {secaoAtiva === 'corte' && (
                    <ConfiguracoesCorte onValidate={validateCorteChange} />
                  )}
                  {secaoAtiva === 'ferramenta' && (
                    <ConfiguracoesFerramenta onValidate={validateFerramentaChange} />
                  )}
                  {secaoAtiva === 'nesting' && (
                    <SeletorNesting
                      metricas={metricas}
                      tempoEstimado={tempoEstimado}
                      onValidate={validateNestingChange}
                    />
                  )}
                  {secaoAtiva === 'adicionar-peca' && (
                    <CadastroPeca
                      pecasNaoCouberam={pecasNaoCouberam}
                      onValidarAntes={validarPecasAntes}
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

      {/* Clear Confirmation Dialog */}
      <AlertDialog open={clearConfirmDialogOpen} onOpenChange={setClearConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Limpar todas as peças?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todas as {pecas.length} peças cadastradas serão removidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmLimpar} className="bg-destructive hover:bg-destructive/90">
              Limpar tudo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de confirmação de remoção de peças (mudança de config) */}
      <ModalConfirmacaoRemocao
        open={pendingChange !== null}
        pecasQueNaoCabem={pendingChange?.pecasQueNaoCabem || []}
        onConfirm={handleConfirmarMudanca}
        onCancel={handleCancelarMudanca}
      />

      {/* Modal de confirmação de remoção de peças (adição de novas peças) */}
      <ModalConfirmacaoRemocao
        open={pendingPecasAdicionais !== null}
        pecasQueNaoCabem={pendingPecasAdicionais?.pecasQueNaoCabem || []}
        onConfirm={handleConfirmarAdicaoPecas}
        onCancel={handleCancelarAdicaoPecas}
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
