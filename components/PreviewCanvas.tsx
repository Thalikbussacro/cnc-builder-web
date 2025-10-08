"use client";

import { useEffect, useRef } from "react";
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Dimensões do canvas
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

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
  }, [chapaLargura, chapaAltura, pecasPosicionadas]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Preview da Chapa e Peças</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center bg-gray-100 rounded-lg p-4">
          <canvas
            ref={canvasRef}
            width={700}
            height={500}
            className="border border-gray-300 bg-white"
          />
        </div>
        <div className="mt-4 text-sm text-gray-600">
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
