"use client";

import { useRef } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";
import type { Peca } from "@/types";

type ModalConfirmacaoRemocaoProps = {
  open: boolean;
  pecasQueNaoCabem: Peca[];
  onConfirm: () => void;
  onCancel: () => void;
};

export function ModalConfirmacaoRemocao({
  open,
  pecasQueNaoCabem,
  onConfirm,
  onCancel,
}: ModalConfirmacaoRemocaoProps) {
  const quantidade = pecasQueNaoCabem.length;
  const isConfirmingRef = useRef(false);

  const handleConfirm = () => {
    isConfirmingRef.current = true;
    onConfirm();
  };

  const handleCancel = () => {
    isConfirmingRef.current = false;
    onCancel();
  };

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => {
      // Só chama onCancel se não estiver confirmando
      if (!isOpen && !isConfirmingRef.current) {
        onCancel();
      }
      // Reseta flag
      if (!isOpen) {
        isConfirmingRef.current = false;
      }
    }}>
      <AlertDialogContent onEscapeKeyDown={(e) => e.preventDefault()}>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
            </div>
            <AlertDialogTitle className="text-lg">
              Peças não cabem mais
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm text-muted-foreground pt-2">
            {quantidade === 1 ? (
              <>
                A peça <strong>#{pecasQueNaoCabem[0].numeroOriginal}</strong> não cabe mais
                com estas configurações e será removida.
              </>
            ) : (
              <>
                <strong>{quantidade} peças</strong> não cabem mais com estas
                configurações e serão removidas:
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Lista de peças (se mais de 1) */}
        {quantidade > 1 && (
          <div className="max-h-40 overflow-y-auto rounded-md border border-border bg-muted/30 p-3">
            <ul className="space-y-1.5 text-sm">
              {pecasQueNaoCabem.map((peca) => (
                <li key={peca.id} className="flex items-center gap-2">
                  <span className="font-medium text-amber-600 dark:text-amber-500">
                    #{peca.numeroOriginal}
                  </span>
                  {peca.nome && (
                    <span className="text-muted-foreground">- {peca.nome}</span>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {peca.largura.toFixed(0)}×{peca.altura.toFixed(0)}mm
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="rounded-md bg-muted/50 p-3 text-sm">
          <p className="text-muted-foreground">
            <strong className="text-foreground">Deseja continuar?</strong>
            <br />
            As peças listadas serão permanentemente removidas.
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            Cancelar alteração
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Continuar e remover {quantidade === 1 ? "peça" : "peças"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
