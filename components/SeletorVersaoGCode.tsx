"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { InfoTooltip } from "@/components/InfoTooltip";
import { VERSOES_GERADOR } from "@/lib/utils";
import type { VersaoGerador } from "@/types";
import { Badge } from "@/components/ui/badge";

type SeletorVersaoGCodeProps = {
  versaoSelecionada: VersaoGerador;
  onChange: (versao: VersaoGerador) => void;
};

export function SeletorVersaoGCode({ versaoSelecionada, onChange }: SeletorVersaoGCodeProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Versão do Gerador G-Code
          <InfoTooltip
            title="Versões do Gerador"
            content={
              <>
                <div>
                  <strong>O que é:</strong> Escolha a versão do algoritmo que gera o código G-code.
                </div>
                <div className="mt-2">
                  <strong>V1 - Clássico:</strong> Versão original com comentários detalhados e estrutura tradicional.
                </div>
                <div className="mt-2">
                  <strong>V2 - Otimizado:</strong> Versão melhorada que elimina movimentos redundantes, resultando em código ~30% menor e execução mais rápida.
                </div>
              </>
            }
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={versaoSelecionada} onValueChange={(value) => onChange(value as VersaoGerador)}>
          <div className="space-y-3">
            {VERSOES_GERADOR.map((versao) => (
              <div
                key={versao.versao}
                className={`flex items-start space-x-3 p-3 rounded-lg border-2 transition-colors ${
                  versaoSelecionada === versao.versao
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value={versao.versao} id={versao.versao} className="mt-1" />
                <div className="flex-1 space-y-1">
                  <Label htmlFor={versao.versao} className="cursor-pointer font-semibold flex items-center gap-2">
                    {versao.nome}
                    {versao.recomendado && (
                      <Badge variant="default" className="text-xs">
                        Recomendado
                      </Badge>
                    )}
                  </Label>
                  <p className="text-sm text-muted-foreground">{versao.descricao}</p>
                  <ul className="text-xs text-muted-foreground space-y-0.5 mt-2">
                    {versao.recursos.map((recurso, index) => (
                      <li key={index} className="flex items-start gap-1.5">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{recurso}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </RadioGroup>

        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
          <p className="text-xs text-amber-800 dark:text-amber-200">
            <strong>Dica:</strong> A versão V2 gera código mais eficiente eliminando comandos redundantes,
            mantendo total compatibilidade com controladores DDCS e similares.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
