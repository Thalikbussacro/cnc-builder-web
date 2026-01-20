"use client";

import { ChevronRight } from "lucide-react";
import type { SecaoSidebar } from "./Sidebar";

interface BreadcrumbProps {
  secaoAtiva: SecaoSidebar;
}

const secaoLabels: Record<SecaoSidebar, string> = {
  'adicionar-peca': 'Adicionar Peça',
  'configuracoes': 'Configurações',
  'projetos': 'Projetos'
};

export function Breadcrumb({ secaoAtiva }: BreadcrumbProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="font-medium text-foreground hidden sm:inline">G-Code Generator</span>
      <span className="font-medium text-foreground sm:hidden">GCG</span>
      <ChevronRight className="h-4 w-4" />
      <span>{secaoLabels[secaoAtiva]}</span>
    </div>
  );
}
