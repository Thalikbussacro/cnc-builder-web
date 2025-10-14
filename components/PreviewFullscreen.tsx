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

// Mesmas cores do PreviewCanvas
const CORES = [
  { hex: "#e67e22", nome: "Laranja" },
  { hex: "#3498db", nome: "Azul" },
  { hex: "#95a5a6", nome: "Cinza" },
  { hex: "#e74c3c", nome: "Vermelho" },
  { hex: "#16a085", nome: "Verde" },
  { hex: "#f39c12", nome: "Amarelo" },
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

    // Tamanho do canvas fullscreen (90% da janela)
    const maxWidth = window.innerWidth * 0.9;
    const maxHeight = window.innerHeight * 0.85;

    // Calcula escala para caber na tela
    const escalaX = (maxWidth - 80) / chapaLargura;
    const escalaY = (maxHeight - 80) / chapaAltura;
    const escala = Math.min(escalaX, escalaY);

    const canvasWidth = chapaLargura * escala + 80;
    const canvasHeight = chapaAltura * escala + 80;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const offsetX = 40;
    const offsetY = 40;

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

      // Número
      const fontSize = Math.max(16, Math.min(24, w / 8, h / 8));
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillText(`#${index + 1}`, centerX, centerY - fontSize / 2);

      // Dimensões
      if (w > 80 && h > 50) {
        ctx.font = `${fontSize * 0.75}px sans-serif`;
        ctx.fillStyle = cor + "dd";
        ctx.fillText(
          `${peca.largura.toFixed(0)}×${peca.altura.toFixed(0)}mm`,
          centerX,
          centerY + fontSize / 2 + 3
        );
      }
    });
  }, [open, chapaLargura, chapaAltura, pecasPosicionadas]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-4">
        <DialogHeader>
          <VisuallyHidden>
            <DialogTitle>Pré-visualização em tela cheia</DialogTitle>
          </VisuallyHidden>
        </DialogHeader>
        <div className="flex items-center justify-center w-full h-full overflow-auto">
          <canvas
            ref={canvasRef}
            className="border border-border"
            style={{ backgroundColor: "#1a1613" }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
