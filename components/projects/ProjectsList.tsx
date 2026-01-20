"use client";

import { useProjects, useDeleteProject } from '@/hooks/useProjects';
import { useProjectSync } from '@/hooks/useProjectSync';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Trash2, FolderOpen, Loader2 } from 'lucide-react';

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'agora mesmo';
  if (diffMins < 60) return `há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
  if (diffHours < 24) return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  if (diffDays < 30) return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;

  return date.toLocaleDateString('pt-BR');
}

export function ProjectsList() {
  const { data: projects, isLoading } = useProjects();
  const { loadProject } = useProjectSync();
  const deleteProject = useDeleteProject();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nenhum projeto salvo ainda</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <Card key={project.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{project.name}</h3>
                {project.is_favorite && (
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                )}
              </div>
              {project.description && (
                <p className="text-sm text-muted-foreground mb-2">
                  {project.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{project.pecas.length} peças</span>
                <span>
                  Atualizado {formatDate(project.updated_at)}
                </span>
              </div>
              {project.tags && project.tags.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => loadProject(project)}>
                Carregar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteProject.mutate(project.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
