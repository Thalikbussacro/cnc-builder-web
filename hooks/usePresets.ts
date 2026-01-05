import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import type { ConfigPreset, CreatePresetInput, UpdatePresetInput } from '@/types/database';

export function usePresets(favorites = false) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['presets', favorites],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (favorites) params.set('favorites', 'true');

      const response = await fetch(`/api/presets?${params}`);
      if (!response.ok) throw new Error('Failed to fetch presets');
      const data = await response.json();
      return data.presets as ConfigPreset[];
    },
    enabled: !!session?.user,
  });
}

export function usePreset(id: string | null) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['presets', id],
    queryFn: async () => {
      const response = await fetch(`/api/presets/${id}`);
      if (!response.ok) throw new Error('Failed to fetch preset');
      const data = await response.json();
      return data.preset as ConfigPreset;
    },
    enabled: !!session?.user && !!id,
  });
}

export function useCreatePreset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePresetInput) => {
      const response = await fetch('/api/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) throw new Error('Failed to create preset');
      const data = await response.json();
      return data.preset as ConfigPreset;
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
      const response = await fetch(`/api/presets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update preset');
      const result = await response.json();
      return result.preset as ConfigPreset;
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
      const response = await fetch(`/api/presets/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete preset');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presets'] });
    },
  });
}
