"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Settings, FileText, Layout, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

type SidebarProps = {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
};

export function Sidebar({ activeSection = "configuracoes", onSectionChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const sections = [
    { id: "configuracoes", label: "Configurações", icon: Settings },
    { id: "pecas", label: "Peças", icon: Layers },
    { id: "preview", label: "Pré-visualização", icon: Layout },
    { id: "gcode", label: "G-code", icon: FileText },
  ];

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-card border-r border-border transition-all duration-200",
        collapsed ? "w-12" : "w-56"
      )}
    >
      <div className="flex items-center justify-between h-12 px-3 border-b border-border">
        {!collapsed && (
          <h2 className="text-sm font-semibold text-foreground">CNC Builder</h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-7 w-7"
          title={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;

            return (
              <li key={section.id}>
                <button
                  onClick={() => onSectionChange?.(section.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  title={collapsed ? section.label : undefined}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && <span>{section.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-2 border-t border-border">
        <div className={cn("text-xs text-muted-foreground", collapsed ? "text-center" : "px-2.5")}>
          {collapsed ? "v1" : "Versão 1.0.0"}
        </div>
      </div>
    </aside>
  );
}
