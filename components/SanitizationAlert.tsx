"use client";

import { useEffect, useState } from 'react';
import type { SanitizationAlert as SanitizationAlertType } from '@/hooks/useValidatedInput';
import { AlertCircle } from 'lucide-react';

type SanitizationAlertProps = {
  alert: SanitizationAlertType;
  onDismiss: () => void;
  duration?: number; // Duração em ms (padrão: 4000ms)
};

export function SanitizationAlert({
  alert,
  onDismiss,
  duration = 4000
}: SanitizationAlertProps) {
  const [progress, setProgress] = useState(100);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!alert.show) {
      setProgress(100);
      setIsExiting(false);
      return;
    }

    // Inicia a animação de progresso
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (duration / 50));
        if (newProgress <= 0) {
          clearInterval(interval);
          return 0;
        }
        return newProgress;
      });
    }, 50);

    // Inicia fade-out antes de dismissar
    const fadeOutTimer = setTimeout(() => {
      setIsExiting(true);
    }, duration - 300); // Começa fade-out 300ms antes

    // Dismissa o alerta
    const dismissTimer = setTimeout(() => {
      onDismiss();
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(fadeOutTimer);
      clearTimeout(dismissTimer);
    };
  }, [alert.show, duration, onDismiss]);

  if (!alert.show) {
    return null;
  }

  return (
    <div
      className={`
        mt-1.5 flex items-start gap-2 rounded-md border border-amber-200
        bg-amber-50 p-2.5 text-xs text-amber-900 transition-opacity duration-300
        ${isExiting ? 'opacity-0' : 'opacity-100 animate-in fade-in slide-in-from-top-1'}
      `}
    >
      <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />

      <div className="flex-1 space-y-1.5">
        <p className="font-medium leading-tight">{alert.message}</p>

        {/* Barra de progresso */}
        <div className="h-1 w-full overflow-hidden rounded-full bg-amber-200">
          <div
            className="h-full bg-amber-500 transition-all duration-50 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
