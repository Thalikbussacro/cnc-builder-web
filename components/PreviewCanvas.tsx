"use client";

import { useEffect, useRef, useState, memo, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Maximize2, Loader2 } from "lucide-react";
import { PreviewFullscreen } from "@/components/PreviewFullscreen";
import type { PecaPosicionada, TempoEstimado } from "@/types";
import { formatarTempo } from "@/lib/utils";

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

type PreviewCanvasProps = {
  chapaLargura: number;
  chapaAltura: number;
  pecasPosicionadas: PecaPosicionada[];
  tempoEstimado?: TempoEstimado;
  carregando?: boolean;
};

// Cores para peças - paleta terrosa/quente profissional v2
// Tons amadeirados e metálicos com alto contraste para legibilidade
const CORES = [
  { hex: "#D2691E", nome: "Chocolate" },       // Chocolate (laranja terroso)
  { hex: "#A0522D", nome: "Siena" },           // Siena queimado
  { hex: "#8B4513", nome: "Mogno" },           // Mogno escuro
  { hex: "#CD853F", nome: "Peru" },            // Peru (bege dourado)
  { hex: "#DEB887", nome: "Madeira Clara" },   // Madeira clara
  { hex: "#D2691E", nome: "Cobre" },           // Cobre
  { hex: "#B8860B", nome: "Ouro Escuro" },     // Ouro escuro
  { hex: "#8B7355", nome: "Bege Escuro" },     // Bege escuro
  { hex: "#A0826D", nome: "Taupe" },           // Taupe
  { hex: "#6B4423", nome: "Castanho" },        // Castanho profundo
];

export const PreviewCanvas = memo(function PreviewCanvas({
  chapaLargura,
  chapaAltura,
  pecasPosicionadas,
  tempoEstimado,
  carregando = false,
}: PreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 500, height: 380 });
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const isDark = useIsDark();

  // Calcula taxa de aproveitamento (apenas peças não ignoradas)
  const areaTotalChapa = chapaLargura * chapaAltura;
  const areaPecas = pecasPosicionadas
    .filter(peca => !peca.ignorada)
    .reduce((total, peca) => total + peca.largura * peca.altura, 0);
  const taxaAproveitamento = areaTotalChapa > 0 ? (areaPecas / areaTotalChapa) * 100 : 0;

  // Memoiza key do canvas baseado nas peças para otimizar re-renders
  const canvasKey = useMemo(
    () => pecasPosicionadas.map(p => `${p.x}-${p.y}-${p.largura}-${p.altura}-${p.ignorada}`).join('|'),
    [pecasPosicionadas]
  );

  // Ajusta tamanho do canvas baseado no container (reduzido pela metade)
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 16;
        // Altura reduzida para preview compacto
        const containerHeight = Math.min(280, window.innerHeight - 400);
        setCanvasSize({
          width: Math.max(180, Math.min(320, containerWidth * 0.9)), // Reduzido pela metade: max 320px
          height: Math.max(160, containerHeight * 0.8),
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

    // Cores adaptadas ao tema
    const corFundo = isDark ? "#1a1a1a" : "#f5f5f5";
    const corChapa = isDark ? "#2a2a2a" : "#e5e5e5";
    const corGrid = isDark ? "#3a3a3a" : "#d0d0d0";
    const corBorda = isDark ? "#555555" : "#999999";
    const corTexto = isDark ? "#888888" : "#333333";

    // Limpa canvas com cor de fundo
    ctx.fillStyle = corFundo;
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
    ctx.strokeStyle = corGrid;
    ctx.lineWidth = 0.8;
    ctx.setLineDash([3, 3]);

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

    // Desenha chapa
    ctx.fillStyle = corChapa;
    ctx.fillRect(offsetX, offsetY, chapaLargura * escala, chapaAltura * escala);
    ctx.strokeStyle = corBorda;
    ctx.lineWidth = 3;
    ctx.strokeRect(offsetX, offsetY, chapaLargura * escala, chapaAltura * escala);

    // Indicador de origem (0,0)
    ctx.fillStyle = corTexto;
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("(0,0)", offsetX + 4, offsetY + 4);

    // Desenha peças posicionadas
    ctx.lineWidth = 2;

    pecasPosicionadas.forEach((peca, index) => {
      const ignorada = peca.ignorada || false;
      const cor = ignorada ? "#999999" : CORES[index % CORES.length].hex;
      const x = offsetX + peca.x * escala;
      const y = offsetY + peca.y * escala;
      const w = peca.largura * escala;
      const h = peca.altura * escala;

      // Sombra para profundidade (reduzida para peças ignoradas)
      ctx.shadowColor = ignorada ? "rgba(0, 0, 0, 0.08)" : "rgba(0, 0, 0, 0.2)";
      ctx.shadowBlur = ignorada ? 2 : 5;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      // Preenche com cor mais sólida (mais transparente para ignoradas)
      ctx.fillStyle = ignorada ? cor + "30" : cor + "CC";
      ctx.fillRect(x, y, w, h);

      // Remove sombra para borda
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Borda da peça mais escura (tracejada para ignoradas)
      if (ignorada) {
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = cor;
        ctx.lineWidth = 2;
      } else {
        ctx.setLineDash([]);
        ctx.strokeStyle = cor;
        ctx.lineWidth = 2.5;
      }
      ctx.strokeRect(x, y, w, h);
      ctx.setLineDash([]);

      // Texto da peça (número + dimensões) - BRANCO COM STROKE PRETO
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const centerX = x + w / 2;
      const centerY = y + h / 2;

      // Número da peça (usa numeroOriginal se disponível)
      const fontSize = Math.max(12, Math.min(16, w / 8, h / 8));
      ctx.font = `bold ${fontSize}px sans-serif`;
      const numeroPeca = peca.numeroOriginal || index + 1;

      // Stroke preto para maior contraste
      ctx.strokeStyle = ignorada ? "#666666" : "#000000";
      ctx.lineWidth = ignorada ? 2 : 3;
      ctx.strokeText(`#${numeroPeca}`, centerX, centerY - fontSize / 2);

      // Texto branco por cima
      ctx.fillStyle = ignorada ? "#cccccc" : "#ffffff";
      ctx.fillText(`#${numeroPeca}`, centerX, centerY - fontSize / 2);

      // Dimensões (se houver espaço)
      if (w > 60 && h > 40) {
        ctx.font = `${fontSize * 0.7}px sans-serif`;

        // Stroke preto para dimensões
        ctx.lineWidth = ignorada ? 1.5 : 2.5;
        ctx.strokeText(
          `${peca.largura.toFixed(0)}×${peca.altura.toFixed(0)}mm`,
          centerX,
          centerY + fontSize / 2 + 2
        );

        // Texto branco
        ctx.fillStyle = ignorada ? "#aaaaaa" : "#ffffff";
        ctx.fillText(
          `${peca.largura.toFixed(0)}×${peca.altura.toFixed(0)}mm`,
          centerX,
          centerY + fontSize / 2 + 2
        );
      }
    });
  }, [chapaLargura, chapaAltura, pecasPosicionadas, canvasSize, isDark]);

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
              <span className="font-semibold">{pecasPosicionadas.filter(p => !p.ignorada).length}/{pecasPosicionadas.length}</span>
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
            {tempoEstimado && (
              <>
                <div className="w-px h-4 bg-border hidden sm:block" />
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Tempo:</span>
                  <span className="font-semibold text-primary">
                    {formatarTempo(tempoEstimado.tempoTotal)}
                  </span>
                </div>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-2 pb-3 relative">
          <div className="flex items-center justify-center bg-slate-100 dark:bg-neutral-900 rounded-lg p-1.5">
            <canvas
              ref={canvasRef}
              width={canvasSize.width}
              height={canvasSize.height}
              className="border border-border shadow-sm"
              style={{ backgroundColor: isDark ? "#1a1a1a" : "#f5f5f5" }}
            />
          </div>

          {/* Overlay de loading */}
          {carregando && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-lg">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">Atualizando preview...</span>
              </div>
            </div>
          )}
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
});
