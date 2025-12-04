"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, AlertTriangle } from "lucide-react";
import type { ValidationResult } from "@/types";

type ValidationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  validation: ValidationResult;
  onContinue?: () => void; // Só disponível se não houver erros
};

export function ValidationDialog({
  open,
  onOpenChange,
  validation,
  onContinue,
}: ValidationDialogProps) {
  const hasErrors = validation.errors.length > 0;
  const hasWarnings = validation.warnings.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {hasErrors ? (
              <>
                <AlertCircle className="h-5 w-5 text-destructive" />
                Problemas Encontrados
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Avisos
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {hasErrors
              ? 'Corrija os erros abaixo antes de gerar o G-code'
              : 'Revise os avisos abaixo. Você pode continuar, mas considere fazer ajustes.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* ERROS */}
          {hasErrors && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                ERROS ({validation.errors.length})
              </h3>
              <div className="space-y-3">
                {validation.errors.map((error, index) => (
                  <div
                    key={index}
                    className="border border-destructive/50 rounded-lg p-3 bg-destructive/5"
                  >
                    <div className="font-medium text-sm mb-1">{error.message}</div>
                    <div className="text-xs text-muted-foreground mb-2">
                      → {error.suggestion}
                    </div>
                    {error.currentValue !== undefined && (
                      <div className="text-xs">
                        <span className="text-muted-foreground">Valor atual: </span>
                        <span className="font-mono">{error.currentValue}</span>
                      </div>
                    )}
                    {error.recommendedValue && (
                      <div className="text-xs">
                        <span className="text-muted-foreground">Recomendado: </span>
                        <span className="font-mono text-green-600 dark:text-green-400">
                          {error.recommendedValue}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AVISOS */}
          {hasWarnings && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
                <AlertTriangle className="h-4 w-4" />
                AVISOS ({validation.warnings.length})
              </h3>
              <div className="space-y-3">
                {validation.warnings.map((warning, index) => (
                  <div
                    key={index}
                    className="border border-yellow-500/50 rounded-lg p-3 bg-yellow-500/5"
                  >
                    <div className="font-medium text-sm mb-1">{warning.message}</div>
                    <div className="text-xs text-muted-foreground mb-2">
                      → {warning.suggestion}
                    </div>
                    {warning.currentValue !== undefined && (
                      <div className="text-xs">
                        <span className="text-muted-foreground">Valor atual: </span>
                        <span className="font-mono">{warning.currentValue}</span>
                      </div>
                    )}
                    {warning.recommendedValue && (
                      <div className="text-xs">
                        <span className="text-muted-foreground">Recomendado: </span>
                        <span className="font-mono text-green-600 dark:text-green-400">
                          {warning.recommendedValue}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Voltar e Corrigir
          </Button>
          {!hasErrors && onContinue && (
            <Button onClick={onContinue}>
              Gerar Mesmo Assim
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
