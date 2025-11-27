"use client";

import { ReactNode } from "react";
import { ValidationProvider } from "@/contexts/ValidationContext";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <ValidationProvider>
      {children}
    </ValidationProvider>
  );
}
