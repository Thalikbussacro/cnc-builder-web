"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Maximize2 } from "lucide-react";
import { PreviewFullscreen } from "@/components/PreviewFullscreen";
import type { PecaPosicionada } from "@/types";

type PreviewCanvasProps = {
  chapaLargura: number;
  chapaAltura: number;
  pecasPosicionadas: PecaPosicionada[];
};

// Cores para peças - paleta quente temática
const CORES = [
  { hex: "#F5B642", nome: "Amarelo" },
  { hex: "#E67E22", nome: "Laranja" },
  { hex: "#D35400", nome: "Laranja Escuro" },
  { hex: "#F39C12", nome: "Dourado" },
  { hex: "#E59866", nome: "Pêssego" },
  { hex: "#DC7633", nome: "Terracota" },
];

export function PreviewCanvas({
  chapaLargura,
  chapaAltura,
  pecasPosicionadas,
}: PreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 500, height: 380 });
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  // Calcula taxa de aproveitamento
  const areaTotalChapa = chapaLargura * chapaAltura;
  const areaPecas = pecasPosicionadas.reduce(
    (total, peca) => total + peca.largura * peca.altura,
    0
  );
  const taxaAproveitamento = areaTotalChapa > 0 ? (areaPecas / areaTotalChapa) * 100 : 0;

  // Ajusta tamanho do canvas baseado no container (reduzido em 50%)
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 16;
        // Altura reduzida para preview compacto
        const containerHeight = Math.min(320, window.innerHeight - 380);
        setCanvasSize({
          width: Math.max(200, Math.min(350, containerWidth * 0.85)), // Reduzido: largura máxima de 350px
          height: Math.max(180, containerHeight * 0.85),
        });
      }
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Dimensões do canvas
    const canvasWidth = canvasSize.width;
    const canvasHeight = canvasSize.height;

    // Limpa canvas com cor de fundo escura
    ctx.fillStyle = "#1a1613";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Calcula escala para caber a chapa no canvas com margem
    const margem = 20;
    const escala = Math.min(
      (canvasWidth - margem * 2) / chapaLargura,
      (canvasHeight - margem * 2) / chapaAltura
    );

    // Offset para centralizar a chapa
    const offsetX = margem;
    const offsetY = margem;

    // GRID DE FUNDO - Linhas a cada 100mm
    ctx.strokeStyle = "#3a342e";
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 2]);

    // Grid vertical
    for (let x = 0; x <= chapaLargura; x += 100) {
      ctx.beginPath();
      ctx.moveTo(offsetX + x * escala, offsetY);
      ctx.lineTo(offsetX + x * escala, offsetY + chapaAltura * escala);
      ctx.stroke();
    }

    // Grid horizontal
    for (let y = 0; y <= chapaAltura; y += 100) {
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY + y * escala);
      ctx.lineTo(offsetX + chapaLargura * escala, offsetY + y * escala);
      ctx.stroke();
    }

    ctx.setLineDash([]);

    // Desenha chapa (madeira clara)
    ctx.fillStyle = "#d4a574";
    ctx.fillRect(offsetX, offsetY, chapaLargura * escala, chapaAltura * escala);
    ctx.strokeStyle = "#c89858";
    ctx.lineWidth = 3;
    ctx.strokeRect(offsetX, offsetY, chapaLargura * escala, chapaAltura * escala);

    // Indicador de origem (0,0)
    ctx.fillStyle = "#2d251f";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("(0,0)", offsetX + 4, offsetY + 4);

    // Desenha peças posicionadas
    ctx.lineWidth = 2;

    pecasPosicionadas.forEach((peca, index) => {
      const cor = CORES[index % CORES.length].hex;
      const x = offsetX + peca.x * escala;
      const y = offsetY + peca.y * escala;
      const w = peca.largura * escala;
      const h = peca.altura * escala;

      // Sombra para profundidade
      ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      // Preenche com cor transparente
      ctx.fillStyle = cor + "40";
      ctx.fillRect(x, y, w, h);

      // Remove sombra para borda
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Borda da peça
      ctx.strokeStyle = cor;
      ctx.strokeRect(x, y, w, h);

      // Texto da peça (número + dimensões)
      ctx.fillStyle = cor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const centerX = x + w / 2;
      const centerY = y + h / 2;

      // Número da peça
      const fontSize = Math.max(12, Math.min(16, w / 8, h / 8));
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillText(`#${index + 1}`, centerX, centerY - fontSize / 2);

      // Dimensões (se houver espaço)
      if (w > 60 && h > 40) {
        ctx.font = `${fontSize * 0.7}px sans-serif`;
        ctx.fillStyle = cor + "dd";
        ctx.fillText(
          `${peca.largura.toFixed(0)}×${peca.altura.toFixed(0)}mm`,
          centerX,
          centerY + fontSize / 2 + 2
        );
      }
    });
  }, [chapaLargura, chapaAltura, pecasPosicionadas, canvasSize]);

  return (
    <>
      <Card ref={containerRef}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base sm:text-lg">Pré-visualização</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFullscreenOpen(true)}
              className="h-8 w-8 p-0"
              title="Visualizar em tela cheia"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs mt-2">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Chapa:</span>
              <span className="font-semibold">{chapaLargura.toFixed(0)}×{chapaAltura.toFixed(0)}mm</span>
            </div>
            <div className="w-px h-4 bg-border hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Peças:</span>
              <span className="font-semibold">{pecasPosicionadas.length}</span>
            </div>
            <div className="w-px h-4 bg-border hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Área:</span>
              <span className="font-semibold">{(areaPecas / 1000000).toFixed(2)}m²</span>
            </div>
            <div className="w-px h-4 bg-border hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Aproveitamento:</span>
              <span className={`font-semibold ${
                taxaAproveitamento >= 70 ? 'text-amber-600 dark:text-amber-500' :
                taxaAproveitamento >= 50 ? 'text-orange-600 dark:text-orange-500' :
                'text-red-600 dark:text-red-500'
              }`}>
                {taxaAproveitamento.toFixed(1)}%
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2 pb-3">
          <div className="flex items-center justify-center bg-black/20 rounded-lg p-1.5">
            <canvas
              ref={canvasRef}
              width={canvasSize.width}
              height={canvasSize.height}
              className="border border-border"
              style={{ backgroundColor: "#1a1613" }}
            />
          </div>
        </CardContent>
      </Card>

      <PreviewFullscreen
        open={fullscreenOpen}
        onOpenChange={setFullscreenOpen}
        chapaLargura={chapaLargura}
        chapaAltura={chapaAltura}
        pecasPosicionadas={pecasPosicionadas}
      />
    </>
  );
}
