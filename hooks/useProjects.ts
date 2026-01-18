import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { ApiClient } from '@/lib/api-client';
import type { Project, CreateProjectInput, UpdateProjectInput } from '@/types/database';

export function useProjects(favorites = false) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['projects', favorites],
    queryFn: async () => {
      const { projects } = await ApiClient.getProjects({ favorites });
      return projects as Project[];
    },
    enabled: !!user,
  });
}

export function useProject(id: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['projects', id],
    queryFn: async () => {
      if (!id) throw new Error('Project ID is required');
      const { project } = await ApiClient.getProject(id);
      return project as Project;
    },
    enabled: !!user && !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProjectInput) => {
      const { project } = await ApiClient.createProject(input);
      return project as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProjectInput }) => {
      const { project } = await ApiClient.updateProject(id, data);
      return project as Project;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', variables.id] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await ApiClient.deleteProject(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
