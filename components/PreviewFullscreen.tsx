"use client";

import { useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import type { PecaPosicionada } from "@/types";

type PreviewFullscreenProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chapaLargura: number;
  chapaAltura: number;
  pecasPosicionadas: PecaPosicionada[];
};

// Cores temáticas quentes (mesmas do PreviewCanvas)
const CORES = [
  { hex: "#F5B642", nome: "Amarelo" },
  { hex: "#E67E22", nome: "Laranja" },
  { hex: "#D35400", nome: "Laranja Escuro" },
  { hex: "#F39C12", nome: "Dourado" },
  { hex: "#E59866", nome: "Pêssego" },
  { hex: "#DC7633", nome: "Terracota" },
];

export function PreviewFullscreen({
  open,
  onOpenChange,
  chapaLargura,
  chapaAltura,
  pecasPosicionadas,
}: PreviewFullscreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!open) return;

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

    // Limpa canvas
    ctx.fillStyle = "#1a1613";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Grid
    ctx.strokeStyle = "#2d2520";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

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
    ctx.fillStyle = "#d4a574";
    ctx.fillRect(offsetX, offsetY, chapaLargura * escala, chapaAltura * escala);
    ctx.strokeStyle = "#c89858";
    ctx.lineWidth = 4;
    ctx.strokeRect(offsetX, offsetY, chapaLargura * escala, chapaAltura * escala);

    // Indicador de origem
    ctx.fillStyle = "#2d251f";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("(0,0)", offsetX + 6, offsetY + 6);

    // Desenha peças
    ctx.lineWidth = 3;

    pecasPosicionadas.forEach((peca, index) => {
      const cor = CORES[index % CORES.length].hex;
      const x = offsetX + peca.x * escala;
      const y = offsetY + peca.y * escala;
      const w = peca.largura * escala;
      const h = peca.altura * escala;

      // Sombra
      ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;

      // Preenche
      ctx.fillStyle = cor + "40";
      ctx.fillRect(x, y, w, h);

      // Remove sombra
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Borda
      ctx.strokeStyle = cor;
      ctx.strokeRect(x, y, w, h);

      // Texto
      ctx.fillStyle = cor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const centerX = x + w / 2;
      const centerY = y + h / 2;

      // Tamanho de fonte adaptativo
      const fontSize = Math.max(18, Math.min(28, w / 8, h / 8));

      // Nome ou número da peça
      ctx.font = `bold ${fontSize}px sans-serif`;
      const nomePeca = peca.nome || `#${index + 1}`;
      ctx.fillText(nomePeca, centerX, centerY - fontSize / 2);

      // Dimensões (se houver espaço)
      if (w > 100 && h > 60) {
        ctx.font = `${fontSize * 0.7}px sans-serif`;
        ctx.fillStyle = cor + "dd";
        ctx.fillText(
          `${peca.largura.toFixed(0)}×${peca.altura.toFixed(0)}mm`,
          centerX,
          centerY + fontSize / 2 + 4
        );
      }
    });
  }, [open, chapaLargura, chapaAltura, pecasPosicionadas]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[96vw] max-h-[96vh] p-2 sm:p-4 bg-background">
        <DialogHeader>
          <VisuallyHidden>
            <DialogTitle>Pré-visualização em tela cheia</DialogTitle>
          </VisuallyHidden>
        </DialogHeader>
        <div className="flex items-center justify-center w-full overflow-auto rounded-lg bg-slate-900 dark:bg-black p-2">
          <canvas
            ref={canvasRef}
            className="border-2 border-amber-600/30 rounded"
            style={{ backgroundColor: "#1a1613", maxWidth: "100%", height: "auto" }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
