"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FormatoArquivo } from "@/types";

type VisualizadorGCodeProps = {
  isOpen: boolean;
  onClose: () => void;
  gcode: string;
  onDownload: (formato: FormatoArquivo) => void;
};

export function VisualizadorGCode({
  isOpen,
  onClose,
  gcode,
  onDownload,
}: VisualizadorGCodeProps) {
  const [copiado, setCopiado] = useState(false);
  const [formato, setFormato] = useState<FormatoArquivo>('nc');

  // Fecha com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      // Bloqueia scroll do body quando aberto
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleCopiar = async () => {
    try {
      await navigator.clipboard.writeText(gcode);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (err) {
      console.error("Erro ao copiar:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity"
        onClick={onClose}
      />

      {/* Painel Lateral Deslizante */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[600px] bg-[#292318] border-l border-border z-[100] shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">
                Visualizador G-Code
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {gcode.split("\n").length} linhas • {(gcode.length / 1024).toFixed(1)} KB
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 sm:h-10 sm:w-10"
            >
              ✕
            </Button>
          </div>

          {/* Conteúdo - Área de código */}
          <div className="flex-1 overflow-hidden p-4 sm:p-6">
            <Card className="h-full bg-black/40 border-border">
              <pre className="h-full overflow-auto p-4 text-xs sm:text-sm font-mono leading-relaxed">
                <code className="text-green-400">{gcode}</code>
              </pre>
            </Card>
          </div>

          {/* Footer - Botões de ação */}
          <div className="p-4 sm:p-6 border-t border-border bg-card/50 backdrop-blur-sm space-y-3">
            {/* Seletor de formato */}
            <div className="space-y-2">
              <Label htmlFor="formato" className="text-xs font-medium">
                Formato do Arquivo
              </Label>
              <Select value={formato} onValueChange={(value) => setFormato(value as FormatoArquivo)}>
                <SelectTrigger id="formato" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nc">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">.nc (Numerical Control)</span>
                      <span className="text-xs text-muted-foreground">Padrão moderno - Recomendado</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="tap">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">.tap (Tape)</span>
                      <span className="text-xs text-muted-foreground">Compatibilidade com máquinas antigas</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="gcode">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">.gcode</span>
                      <span className="text-xs text-muted-foreground">Formato genérico (3D printers + CNC)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="cnc">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">.cnc</span>
                      <span className="text-xs text-muted-foreground">Variação alternativa</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                ℹ️ Todos os formatos são idênticos (apenas extensão diferente)
              </p>
            </div>

            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleCopiar}
                variant="outline"
                className="flex-1 h-11 font-semibold border-2 shadow-md hover:shadow-lg transition-all"
                disabled={copiado}
              >
                {copiado ? "✓ Copiado!" : "📋 Copiar"}
              </Button>
              <Button
                onClick={() => {
                  onDownload(formato);
                  onClose();
                }}
                variant="default"
                className="flex-1 h-11 font-semibold !border-2 !border-primary/50 shadow-md hover:shadow-lg transition-all"
              >
                💾 Baixar .{formato}
              </Button>
              <Button
                onClick={onClose}
                variant="secondary"
                className="sm:w-auto h-11 font-semibold !border-2 !border-border shadow-md hover:shadow-lg transition-all"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
