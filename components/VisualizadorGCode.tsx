"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FormatoArquivo, VersaoGerador } from "@/types";
import { VERSOES_GERADOR } from "@/lib/gcode-generator";

type VisualizadorGCodeProps = {
  isOpen: boolean;
  onClose: () => void;
  gcode: string;
  onDownload: (formato: FormatoArquivo) => void;
  versaoGerador: VersaoGerador;
  onVersaoChange: (versao: VersaoGerador) => void;
  incluirComentarios: boolean;
  onIncluirComentariosChange: (incluir: boolean) => void;
};

export function VisualizadorGCode({
  isOpen,
  onClose,
  gcode,
  onDownload,
  versaoGerador,
  onVersaoChange,
  incluirComentarios,
  onIncluirComentariosChange,
}: VisualizadorGCodeProps) {
  const [copiado, setCopiado] = useState(false);
  const [formato, setFormato] = useState<FormatoArquivo>('tap');

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
        className={`fixed top-0 right-0 h-full w-full md:w-1/2 bg-background border-l-2 border-amber-600/20 z-[100] shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b-2 border-amber-600/30 bg-amber-950/10 dark:bg-amber-950/30">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-500">
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
              className="h-8 w-8 sm:h-10 sm:w-10 hover:bg-red-600/20 hover:text-red-500"
            >
              ✕
            </Button>
          </div>

          {/* Conteúdo - Área de código */}
          <div className="flex-1 overflow-hidden p-4 sm:p-6">
            <Card className="h-full bg-slate-800 dark:bg-black/60 border-2 border-amber-600/20">
              <div className="h-full overflow-auto p-4 text-xs sm:text-sm font-mono leading-relaxed">
                <table className="w-full border-collapse">
                  <tbody>
                    {gcode.split('\n').map((linha, index) => (
                      <tr key={index} className="hover:bg-amber-600/10">
                        <td className="text-muted-foreground text-right pr-4 select-none align-top" style={{ minWidth: '3em' }}>
                          {index + 1}
                        </td>
                        <td className="text-amber-300 dark:text-amber-400 whitespace-pre">
                          {linha || '\u00A0'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Footer - Botões de ação */}
          <div className="p-4 sm:p-6 border-t-2 border-amber-600/20 bg-amber-950/5 dark:bg-amber-950/20 backdrop-blur-sm space-y-3">
            {/* Seletor de versão do gerador */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">
                Versão do Gerador
              </Label>
              <Select value={versaoGerador} onValueChange={(value) => onVersaoChange(value as VersaoGerador)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione a versão" />
                </SelectTrigger>
                <SelectContent className="z-[150]">
                  {VERSOES_GERADOR.map((versao) => (
                    <SelectItem key={versao.versao} value={versao.versao}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{versao.nome}</span>
                        {versao.recomendado && (
                          <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                            Recomendado
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {VERSOES_GERADOR.find(v => v.versao === versaoGerador)?.descricao}
              </p>
            </div>

            {/* Checkbox Incluir Comentários */}
            <div className="flex items-center space-x-2 p-3 border border-border rounded-md bg-background/50">
              <Checkbox
                id="incluir-comentarios"
                checked={incluirComentarios}
                onCheckedChange={(checked) => onIncluirComentariosChange(checked as boolean)}
              />
              <Label
                htmlFor="incluir-comentarios"
                className="text-sm font-medium cursor-pointer flex-1"
              >
                Incluir comentários no G-code
              </Label>
            </div>

            {/* Seletor de formato */}
            <div className="space-y-3">
              <Label className="text-xs font-medium">
                Formato do Arquivo
              </Label>
              <RadioGroup
                value={formato}
                onValueChange={(value) => setFormato(value as FormatoArquivo)}
                className="grid grid-cols-2 lg:grid-cols-4 gap-3"
              >
                <div className="flex items-center space-x-2 border border-border rounded-md p-3 hover:bg-accent/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="tap" id="tap" />
                  <Label htmlFor="tap" className="flex-1 cursor-pointer text-xs sm:text-sm font-medium">
                    .tap
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border border-border rounded-md p-3 hover:bg-accent/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="nc" id="nc" />
                  <Label htmlFor="nc" className="flex-1 cursor-pointer text-xs sm:text-sm font-medium">
                    .nc
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border border-border rounded-md p-3 hover:bg-accent/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="gcode" id="gcode" />
                  <Label htmlFor="gcode" className="flex-1 cursor-pointer text-xs sm:text-sm font-medium">
                    .gcode
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border border-border rounded-md p-3 hover:bg-accent/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="cnc" id="cnc" />
                  <Label htmlFor="cnc" className="flex-1 cursor-pointer text-xs sm:text-sm font-medium">
                    .cnc
                  </Label>
                </div>
              </RadioGroup>
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
