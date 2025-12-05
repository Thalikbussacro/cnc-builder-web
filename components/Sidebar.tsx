"use client";

import { cn } from "@/lib/utils";
import { Settings, Scissors, Wrench, Package, PlusCircle, X, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useValidationContext } from "@/contexts/ValidationContext";

const ThemeToggle = dynamic(() => import("./ThemeToggle").then(mod => ({ default: mod.ThemeToggle })), {
  ssr: false,
  loading: () => <div className="h-8 w-8" />
});

export type SecaoSidebar = 'chapa' | 'corte' | 'ferramenta' | 'nesting' | 'adicionar-peca';

interface SidebarProps {
  secaoAtiva: SecaoSidebar;
  onSecaoChange: (secao: SecaoSidebar) => void;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}

const secaoAdicionar = {
  id: 'adicionar-peca' as const,
  label: 'Adicionar Peça',
  icon: PlusCircle,
  descricao: 'Cadastrar nova peça'
};

const configuracoes = [
  {
    id: 'chapa' as const,
    label: 'Chapa',
    icon: Settings,
    descricao: 'Dimensões da chapa'
  },
  {
    id: 'corte' as const,
    label: 'Corte',
    icon: Scissors,
    descricao: 'Parâmetros de corte'
  },
  {
    id: 'ferramenta' as const,
    label: 'Ferramenta',
    icon: Wrench,
    descricao: 'Configuração da fresa'
  },
  {
    id: 'nesting' as const,
    label: 'Nesting',
    icon: Package,
    descricao: 'Algoritmo de otimização'
  }
];

export function Sidebar({ secaoAtiva, onSecaoChange, mobileOpen, onMobileOpenChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { tabHasErrors } = useValidationContext();

  const handleSecaoClick = (secao: SecaoSidebar) => {
    onSecaoChange(secao);
    onMobileOpenChange(false); // Fecha menu mobile após seleção
  };

  const renderSecaoButton = (secao: typeof secaoAdicionar | typeof configuracoes[0]) => {
    const Icon = secao.icon;
    const isActive = secaoAtiva === secao.id;
    const hasErrors = secao.id !== 'adicionar-peca' && secao.id !== 'nesting' && tabHasErrors(secao.id as 'chapa' | 'corte' | 'ferramenta');

    return (
      <button
        key={secao.id}
        onClick={() => handleSecaoClick(secao.id)}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
          "hover:bg-accent hover:text-accent-foreground",
          isActive && "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
        title={collapsed ? secao.label : undefined}
      >
        <div className="relative">
          <Icon className="h-5 w-5 flex-shrink-0" />
          {hasErrors && (
            <div className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-destructive rounded-full ring-2 ring-background" />
          )}
        </div>
        {!collapsed && (
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-sm">{secao.label}</span>
              {hasErrors && (
                <AlertCircle className="h-3.5 w-3.5 text-destructive flex-shrink-0" />
              )}
            </div>
            <span className={cn(
              "text-xs truncate",
              isActive ? "text-primary-foreground/80" : "text-muted-foreground"
            )}>
              {secao.descricao}
            </span>
          </div>
        )}
      </button>
    );
  };

  // Conteúdo da sidebar (reutilizado em desktop e mobile)
  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header com toggle collapse */}
      <div className="p-4 border-b flex items-center justify-between">
        {!collapsed && <h2 className="text-lg font-semibold">Menu</h2>}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="hidden lg:flex"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => onMobileOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {/* Adicionar Peça - Destaque no topo */}
        <div className="space-y-1">
          {renderSecaoButton(secaoAdicionar)}
        </div>

        {/* Separador */}
        <div className="border-t" />

        {/* Configurações */}
        <div className="space-y-1">
          {!collapsed && (
            <div className="px-3 py-1.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Configurações
              </span>
            </div>
          )}
          {configuracoes.map(renderSecaoButton)}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t">
        <div className="flex items-center justify-between gap-2">
          {!collapsed && (
            <div className="text-xs text-muted-foreground">
              GCG v2.0
            </div>
          )}
          <ThemeToggle />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar - largura dinâmica baseada em collapsed */}
      <aside className={cn(
        "hidden lg:flex border-r bg-card flex-col h-full transition-all duration-300",
        collapsed ? "w-20" : "w-72"
      )}>
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar (Sheet/Drawer) */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={() => onMobileOpenChange(false)}
            role="button"
            tabIndex={-1}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onMobileOpenChange(false);
            }}
            aria-label="Fechar menu lateral"
          />
          {/* Drawer */}
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 w-80 bg-card border-r z-50 shadow-lg animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
