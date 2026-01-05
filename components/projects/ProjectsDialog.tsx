"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProjectsList } from './ProjectsList';

interface ProjectsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectsDialog({ open, onOpenChange }: ProjectsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Meus Projetos</DialogTitle>
          <DialogDescription>
            Carregue um projeto salvo anteriormente para continuar trabalhando nele.
          </DialogDescription>
        </DialogHeader>

        <ProjectsList />
      </DialogContent>
    </Dialog>
  );
}
