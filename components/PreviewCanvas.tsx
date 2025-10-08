"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PecaPosicionada } from "@/types";

type PreviewCanvasProps = {
  chapaLargura: number;
  chapaAltura: number;
  pecasPosicionadas: PecaPosicionada[];
};

export function PreviewCanvas({
  chapaLargura,
  chapaAltura,
  pecasPosicionadas,
}: PreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  // Ajusta tamanho do canvas baseado no container
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 32; // padding
        const containerHeight = Math.min(600, window.innerHeight - 300);
        setCanvasSize({
          width: Math.max(300, containerWidth),
          height: Math.max(300, containerHeight),
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

    // Limpa canvas
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Calcula escala para caber a chapa no canvas
    const escala = Math.min(
      canvasWidth / chapaLargura,
      canvasHeight / chapaAltura
    );

    // Desenha chapa (borda preta, fundo branco)
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, chapaLargura * escala, chapaAltura * escala);

    // Desenha peças posicionadas
    ctx.lineWidth = 1;

    // Cores alternadas para melhor visualização
    const cores = [
      "#3b82f6", // blue-500
      "#10b981", // green-500
      "#f59e0b", // amber-500
      "#ef4444", // red-500
      "#8b5cf6", // violet-500
      "#ec4899", // pink-500
    ];

    pecasPosicionadas.forEach((peca, index) => {
      const cor = cores[index % cores.length];

      // Preenche com cor transparente
      ctx.fillStyle = cor + "30"; // Adiciona opacidade
      ctx.fillRect(
        peca.x * escala,
        peca.y * escala,
        peca.largura * escala,
        peca.altura * escala
      );

      // Borda da peça
      ctx.strokeStyle = cor;
      ctx.strokeRect(
        peca.x * escala,
        peca.y * escala,
        peca.largura * escala,
        peca.altura * escala
      );

      // Número da peça no centro
      ctx.fillStyle = cor;
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        `${index + 1}`,
        (peca.x + peca.largura / 2) * escala,
        (peca.y + peca.altura / 2) * escala
      );
    });
  }, [chapaLargura, chapaAltura, pecasPosicionadas, canvasSize]);

  return (
    <Card className="h-full" ref={containerRef}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg sm:text-xl">Preview da Chapa e Peças</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center justify-center bg-gray-100 rounded-lg p-2 sm:p-4 overflow-auto">
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="border border-gray-300 bg-white max-w-full"
          />
        </div>
        <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600 space-y-1">
          <p>
            <strong>Chapa:</strong> {chapaLargura.toFixed(0)} x {chapaAltura.toFixed(0)} mm
          </p>
          <p>
            <strong>Peças posicionadas:</strong> {pecasPosicionadas.length}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
