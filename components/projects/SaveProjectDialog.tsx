"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useProjectSync } from '@/hooks/useProjectSync';
import { Loader2 } from 'lucide-react';

interface SaveProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentProjectId?: string | null;
}

export function SaveProjectDialog({
  open,
  onOpenChange,
  currentProjectId,
}: SaveProjectDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { saveAsNewProject, saveProject, isLoading } = useProjectSync();

  const handleSave = async () => {
    if (!name.trim() && !currentProjectId) return;

    try {
      if (currentProjectId) {
        await saveProject(currentProjectId);
      } else {
        await saveAsNewProject(name, description || undefined);
      }
      onOpenChange(false);
      setName('');
      setDescription('');
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {currentProjectId ? 'Atualizar Projeto' : 'Salvar Novo Projeto'}
          </DialogTitle>
          <DialogDescription>
            {currentProjectId
              ? 'As configurações atuais serão salvas no projeto.'
              : 'Dê um nome para salvar suas configurações e peças.'}
          </DialogDescription>
        </DialogHeader>

        {!currentProjectId && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Projeto *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Chapa MDF 15mm - Gavetas"
              />
            </div>
            <div>
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalhes sobre o projeto..."
                rows={3}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={(!currentProjectId && !name.trim()) || isLoading}
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {currentProjectId ? 'Atualizar' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
