"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Save,
  Trash2,
  AlertCircle,
  Download,
  MoreVertical,
  FileText,
  Loader2
} from "lucide-react";

interface ActionBarProps {
  onSaveProject: () => void;
  onClearPieces: () => void;
  onValidate: () => void;
  onGenerateGCode: () => void;
  onDownloadGCode: () => void;
  onOpenDictionary: () => void;
  hasPieces: boolean;
  hasErrors: boolean;
  isGenerating: boolean;
  hasGeneratedGCode: boolean;
}

export function ActionBar({
  onSaveProject,
  onClearPieces,
  onValidate,
  onGenerateGCode,
  onDownloadGCode,
  onOpenDictionary,
  hasPieces,
  hasErrors,
  isGenerating,
  hasGeneratedGCode
}: ActionBarProps) {
  return (
    <div className="border-t bg-card/50 backdrop-blur-sm sticky bottom-0 z-10">
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        {/* Left: Secondary Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSaveProject}
            disabled={!hasPieces}
            title="Salvar projeto atual"
          >
            <Save className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Salvar Projeto</span>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onClearPieces}
            disabled={!hasPieces}
            title="Limpar todas as peças"
          >
            <Trash2 className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Limpar Peças</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onValidate}
            disabled={!hasPieces}
            title="Validar configurações"
            className="hidden md:flex"
          >
            <AlertCircle className="h-4 w-4 lg:mr-2" />
            <span className="hidden lg:inline">Validar</span>
          </Button>
        </div>

        {/* Right: Primary Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={onGenerateGCode}
            disabled={!hasPieces || hasErrors || isGenerating}
            title={hasErrors ? "Corrija os erros antes de gerar" : "Gerar G-code"}
          >
            {isGenerating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Gerar G-code</span>
            <span className="sm:hidden">Gerar</span>
          </Button>

          {hasGeneratedGCode && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDownloadGCode}
              title="Baixar G-code gerado"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}

          {/* More Options Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" title="Mais opções">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onOpenDictionary}>
                <FileText className="h-4 w-4 mr-2" />
                Dicionário G-code
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
