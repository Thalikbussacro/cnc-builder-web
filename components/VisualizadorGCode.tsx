"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type VisualizadorGCodeProps = {
  isOpen: boolean;
  onClose: () => void;
  gcode: string;
  onDownload: () => void;
};

export function VisualizadorGCode({
  isOpen,
  onClose,
  gcode,
  onDownload,
}: VisualizadorGCodeProps) {
  const [copiado, setCopiado] = useState(false);

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
          <div className="p-4 sm:p-6 border-t border-border bg-card/50 backdrop-blur-sm">
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
                  onDownload();
                  onClose();
                }}
                variant="default"
                className="flex-1 h-11 font-semibold !border-2 !border-primary/50 shadow-md hover:shadow-lg transition-all"
              >
                💾 Baixar Arquivo
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
