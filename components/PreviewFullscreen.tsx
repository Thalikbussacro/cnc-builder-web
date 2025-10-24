"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import type { PecaPosicionada } from "@/types";

// Hook para detectar tema dark
function useIsDark() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return isDark;
}

type PreviewFullscreenProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chapaLargura: number;
  chapaAltura: number;
  pecasPosicionadas: PecaPosicionada[];
};

// Cores terrosas/quentes profissionais (mesmas do PreviewCanvas)
const CORES = [
  { hex: "#D2691E", nome: "Chocolate" },
  { hex: "#A0522D", nome: "Siena" },
  { hex: "#8B4513", nome: "Mogno" },
  { hex: "#CD853F", nome: "Peru" },
  { hex: "#DEB887", nome: "Madeira Clara" },
  { hex: "#D2691E", nome: "Cobre" },
  { hex: "#B8860B", nome: "Ouro Escuro" },
  { hex: "#8B7355", nome: "Bege Escuro" },
  { hex: "#A0826D", nome: "Taupe" },
  { hex: "#6B4423", nome: "Castanho" },
];

export function PreviewFullscreen({
  open,
  onOpenChange,
  chapaLargura,
  chapaAltura,
  pecasPosicionadas,
}: PreviewFullscreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDark = useIsDark();

  useEffect(() => {
    if (!open) return;

    // Pequeno delay para garantir que o dialog esteja renderizado
    const timeoutId = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Tamanho do canvas fullscreen otimizado para Full HD
      const maxWidth = Math.min(window.innerWidth * 0.92, 1800);
      const maxHeight = Math.min(window.innerHeight * 0.88, 1000);

    // Calcula escala para caber na tela
    const margem = 60;
    const escalaX = (maxWidth - margem * 2) / chapaLargura;
    const escalaY = (maxHeight - margem * 2) / chapaAltura;
    const escala = Math.min(escalaX, escalaY);

    const canvasWidth = chapaLargura * escala + margem * 2;
    const canvasHeight = chapaAltura * escala + margem * 2;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const offsetX = margem;
    const offsetY = margem;

    // Cores adaptadas ao tema
    const corFundo = isDark ? "#1a1a1a" : "#f5f5f5";
    const corChapa = isDark ? "#2a2a2a" : "#e5e5e5";
    const corGrid = isDark ? "#3a3a3a" : "#d0d0d0";
    const corBorda = isDark ? "#555555" : "#999999";
    const corTexto = isDark ? "#888888" : "#333333";

    // Limpa canvas
    ctx.fillStyle = corFundo;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Grid
    ctx.strokeStyle = corGrid;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    const gridSpacing = 100;
    for (let x = 0; x <= chapaLargura; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(offsetX + x * escala, offsetY);
      ctx.lineTo(offsetX + x * escala, offsetY + chapaAltura * escala);
      ctx.stroke();
    }

    for (let y = 0; y <= chapaAltura; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY + y * escala);
      ctx.lineTo(offsetX + chapaLargura * escala, offsetY + y * escala);
      ctx.stroke();
    }

    ctx.setLineDash([]);

    // Desenha chapa
    ctx.fillStyle = corChapa;
    ctx.fillRect(offsetX, offsetY, chapaLargura * escala, chapaAltura * escala);
    ctx.strokeStyle = corBorda;
    ctx.lineWidth = 4;
    ctx.strokeRect(offsetX, offsetY, chapaLargura * escala, chapaAltura * escala);

    // Indicador de origem
    ctx.fillStyle = corTexto;
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("(0,0)", offsetX + 6, offsetY + 6);

    // Desenha peças
    ctx.lineWidth = 3;

    pecasPosicionadas.forEach((peca, index) => {
      const ignorada = peca.ignorada || false;
      const cor = ignorada ? "#999999" : CORES[index % CORES.length].hex;
      const x = offsetX + peca.x * escala;
      const y = offsetY + peca.y * escala;
      const w = peca.largura * escala;
      const h = peca.altura * escala;

      // Sombra (reduzida para peças ignoradas)
      ctx.shadowColor = ignorada ? "rgba(0, 0, 0, 0.1)" : "rgba(0, 0, 0, 0.25)";
      ctx.shadowBlur = ignorada ? 3 : 8;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;

      // Preenche com cor mais sólida (mais transparente para ignoradas)
      ctx.fillStyle = ignorada ? cor + "30" : cor + "CC";
      ctx.fillRect(x, y, w, h);

      // Remove sombra
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Borda mais escura (tracejada para ignoradas)
      if (ignorada) {
        ctx.setLineDash([8, 8]);
        ctx.strokeStyle = cor;
        ctx.lineWidth = 3;
      } else {
        ctx.setLineDash([]);
        ctx.strokeStyle = cor;
        ctx.lineWidth = 3.5;
      }
      ctx.strokeRect(x, y, w, h);
      ctx.setLineDash([]);

      // Texto - BRANCO COM STROKE PRETO
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const centerX = x + w / 2;
      const centerY = y + h / 2;

      // Tamanho de fonte adaptativo
      const fontSize = Math.max(18, Math.min(28, w / 8, h / 8));

      // Nome ou número da peça (usa numeroOriginal se disponível)
      ctx.font = `bold ${fontSize}px sans-serif`;
      const numeroPeca = peca.numeroOriginal || index + 1;
      const nomePeca = peca.nome || `#${numeroPeca}`;

      // Stroke preto para maior contraste
      ctx.strokeStyle = ignorada ? "#666666" : "#000000";
      ctx.lineWidth = ignorada ? 3 : 4;
      ctx.strokeText(nomePeca, centerX, centerY - fontSize / 2);

      // Texto branco por cima
      ctx.fillStyle = ignorada ? "#cccccc" : "#ffffff";
      ctx.fillText(nomePeca, centerX, centerY - fontSize / 2);

      // Dimensões (se houver espaço)
      if (w > 100 && h > 60) {
        ctx.font = `${fontSize * 0.7}px sans-serif`;

        // Stroke preto para dimensões
        ctx.lineWidth = ignorada ? 2 : 3.5;
        ctx.strokeText(
          `${peca.largura.toFixed(0)}×${peca.altura.toFixed(0)}mm`,
          centerX,
          centerY + fontSize / 2 + 4
        );

        // Texto branco
        ctx.fillStyle = ignorada ? "#aaaaaa" : "#ffffff";
        ctx.fillText(
          `${peca.largura.toFixed(0)}×${peca.altura.toFixed(0)}mm`,
          centerX,
          centerY + fontSize / 2 + 4
        );
      }
    });
    }, 50); // 50ms delay

    return () => clearTimeout(timeoutId);
  }, [open, chapaLargura, chapaAltura, pecasPosicionadas, isDark]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[98vw] h-[98vh] p-3 sm:p-6 bg-background flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <VisuallyHidden>
            <DialogTitle>Pré-visualização em tela cheia</DialogTitle>
          </VisuallyHidden>
        </DialogHeader>
        <div className="flex-1 flex items-center justify-center overflow-auto rounded-lg bg-slate-100 dark:bg-neutral-900 p-3">
          <canvas
            ref={canvasRef}
            className="border-2 border-slate-400/50 dark:border-neutral-700/50 rounded shadow-2xl"
            style={{ backgroundColor: isDark ? "#1a1a1a" : "#f5f5f5" }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
