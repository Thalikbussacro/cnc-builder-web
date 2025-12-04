"use client";

import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ValidationProvider } from "@/contexts/ValidationContext";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  // Create QueryClient instance (only once per component mount)
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5000, // 5 segundos antes de considerar dados "stale"
        gcTime: 10 * 60 * 1000, // 10 minutos para garbage collection
        retry: 1, // Tenta 1 vez em caso de erro
        refetchOnWindowFocus: false, // Não refaz query ao focar janela
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ValidationProvider>
        {children}
      </ValidationProvider>
    </QueryClientProvider>
  );
}
