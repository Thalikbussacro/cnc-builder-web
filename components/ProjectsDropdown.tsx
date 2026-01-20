"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Save, FolderPlus, FolderOpen } from "lucide-react";

interface ProjectsDropdownProps {
  onSaveProject: () => void;
  onNewProject: () => void;
  onViewAllProjects: () => void;
  hasPieces: boolean;
}

export function ProjectsDropdown({
  onSaveProject,
  onNewProject,
  onViewAllProjects,
  hasPieces
}: ProjectsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <FolderOpen className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Projetos</span>
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onSaveProject} disabled={!hasPieces}>
          <Save className="h-4 w-4 mr-2" />
          Salvar Projeto Atual
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onNewProject}>
          <FolderPlus className="h-4 w-4 mr-2" />
          Novo Projeto
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onViewAllProjects}>
          <FolderOpen className="h-4 w-4 mr-2" />
          Ver Todos os Projetos
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
