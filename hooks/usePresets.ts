import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { ApiClient } from '@/lib/api-client';
import type { ConfigPreset, CreatePresetInput, UpdatePresetInput } from '@/types/database';

export function usePresets(favorites = false) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['presets', favorites],
    queryFn: async () => {
      const { presets } = await ApiClient.getPresets({ favorites });
      return presets as ConfigPreset[];
    },
    enabled: !!user,
  });
}

export function usePreset(id: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['presets', id],
    queryFn: async () => {
      if (!id) throw new Error('Preset ID is required');
      const { preset } = await ApiClient.getPreset(id);
      return preset as ConfigPreset;
    },
    enabled: !!user && !!id,
  });
}

export function useCreatePreset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePresetInput) => {
      const { preset } = await ApiClient.createPreset(input);
      return preset as ConfigPreset;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presets'] });
    },
  });
}

export function useUpdatePreset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePresetInput }) => {
      const { preset } = await ApiClient.updatePreset(id, data);
      return preset as ConfigPreset;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['presets'] });
      queryClient.invalidateQueries({ queryKey: ['presets', variables.id] });
    },
  });
}

export function useDeletePreset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await ApiClient.deletePreset(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presets'] });
    },
  });
}
