"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PecaPosicionada } from "@/types";

type PreviewCanvasProps = {
  chapaLargura: number;
  chapaAltura: number;
  pecasPosicionadas: PecaPosicionada[];
};

// Cores alternadas para melhor visualização
const CORES = [
  { hex: "#3b82f6", nome: "Azul" },
  { hex: "#10b981", nome: "Verde" },
  { hex: "#f59e0b", nome: "Amarelo" },
  { hex: "#ef4444", nome: "Vermelho" },
  { hex: "#8b5cf6", nome: "Roxo" },
  { hex: "#ec4899", nome: "Rosa" },
];

export function PreviewCanvas({
  chapaLargura,
  chapaAltura,
  pecasPosicionadas,
}: PreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  // Calcula taxa de aproveitamento
  const areaTotalChapa = chapaLargura * chapaAltura;
  const areaPecas = pecasPosicionadas.reduce(
    (total, peca) => total + peca.largura * peca.altura,
    0
  );
  const taxaAproveitamento = areaTotalChapa > 0 ? (areaPecas / areaTotalChapa) * 100 : 0;

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
    ctx.fillStyle = "#fafafa";
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
    ctx.strokeStyle = "#e5e7eb";
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

    // Desenha chapa (borda preta, fundo branco)
    ctx.fillStyle = "white";
    ctx.fillRect(offsetX, offsetY, chapaLargura * escala, chapaAltura * escala);
    ctx.strokeStyle = "#1f2937";
    ctx.lineWidth = 3;
    ctx.strokeRect(offsetX, offsetY, chapaLargura * escala, chapaAltura * escala);

    // Indicador de origem (0,0)
    ctx.fillStyle = "#1f2937";
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
        <div className="mt-3 sm:mt-4 space-y-3">
          {/* Informações gerais */}
          <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-gray-500 text-xs">Chapa</p>
              <p className="font-semibold text-gray-900">
                {chapaLargura.toFixed(0)} × {chapaAltura.toFixed(0)} mm
              </p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-gray-500 text-xs">Peças</p>
              <p className="font-semibold text-gray-900">
                {pecasPosicionadas.length}
              </p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-gray-500 text-xs">Área ocupada</p>
              <p className="font-semibold text-gray-900">
                {(areaPecas / 1000000).toFixed(2)} m²
              </p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-gray-500 text-xs">Aproveitamento</p>
              <p className={`font-semibold ${
                taxaAproveitamento >= 70 ? 'text-green-600' :
                taxaAproveitamento >= 50 ? 'text-amber-600' :
                'text-red-600'
              }`}>
                {taxaAproveitamento.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Legenda de cores */}
          {pecasPosicionadas.length > 0 && (
            <div className="border-t pt-3">
              <p className="text-xs font-medium text-gray-700 mb-2">Legenda de Peças</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {pecasPosicionadas.slice(0, 6).map((peca, index) => (
                  <div key={peca.id} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded border-2 flex-shrink-0"
                      style={{
                        backgroundColor: CORES[index % CORES.length].hex + '40',
                        borderColor: CORES[index % CORES.length].hex,
                      }}
                    />
                    <span className="text-xs text-gray-600">
                      #{index + 1} - {peca.largura.toFixed(0)}×{peca.altura.toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
              {pecasPosicionadas.length > 6 && (
                <p className="text-xs text-gray-500 mt-2">
                  + {pecasPosicionadas.length - 6} peças adicionais
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
