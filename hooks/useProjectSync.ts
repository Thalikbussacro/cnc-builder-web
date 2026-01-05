import { useConfigStore } from '@/stores/useConfigStore';
import { useCreateProject, useUpdateProject } from './useProjects';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import type { Project } from '@/types/database';

export function useProjectSync() {
  const { data: session } = useSession();
  const store = useConfigStore();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();

  const saveAsNewProject = async (name: string, description?: string) => {
    if (!session?.user) {
      toast.error('Você precisa estar logado para salvar projetos');
      return null;
    }

    const state = useConfigStore.getState();

    try {
      const project = await createProject.mutateAsync({
        name,
        description,
        config_chapa: state.configChapa,
        config_corte: state.configCorte,
        config_ferramenta: state.configFerramenta,
        metodo_nesting: state.metodoNesting,
        pecas: state.pecas,
      });

      toast.success('Projeto salvo com sucesso!');
      return project;
    } catch (error) {
      toast.error('Erro ao salvar projeto');
      console.error('Error saving project:', error);
      return null;
    }
  };

  const saveProject = async (id: string) => {
    if (!session?.user) {
      toast.error('Você precisa estar logado');
      return null;
    }

    const state = useConfigStore.getState();

    try {
      const project = await updateProject.mutateAsync({
        id,
        data: {
          config_chapa: state.configChapa,
          config_corte: state.configCorte,
          config_ferramenta: state.configFerramenta,
          metodo_nesting: state.metodoNesting,
          pecas: state.pecas,
        },
      });

      toast.success('Projeto atualizado!');
      return project;
    } catch (error) {
      toast.error('Erro ao atualizar projeto');
      console.error('Error updating project:', error);
      return null;
    }
  };

  const loadProject = (project: Project) => {
    store.setConfigChapa(project.config_chapa);
    store.setConfigCorte(project.config_corte);
    store.setConfigFerramenta(project.config_ferramenta);
    store.setMetodoNesting(project.metodo_nesting);
    store.setPecas(project.pecas);
    toast.success(`Projeto "${project.name}" carregado!`);
  };

  return {
    saveAsNewProject,
    saveProject,
    loadProject,
    isLoading: createProject.isPending || updateProject.isPending,
  };
}
