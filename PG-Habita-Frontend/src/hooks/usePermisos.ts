import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { Permiso, PermisoFormData } from '@/types/auth';
import { toast } from './use-toast';

export const usePermisos = () => {
    const queryClient = useQueryClient();

    // CORRECCIÓN: Especificar tipos explícitos para useQuery
    const permisosQuery = useQuery<Permiso[], Error>({
        queryKey: ['permisos'],
        queryFn: () => api.fetchPermisos(),
    });

    const createPermisoMutation = useMutation<Permiso, Error, PermisoFormData>({
        mutationFn: api.createPermiso,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['permisos'] });
            toast({
                title: 'Permiso creado',
                description: 'El permiso se ha creado correctamente',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Error',
                description: error.message || 'Error al crear el permiso',
                variant: 'destructive',
            });
        },
    });

    const updatePermisoMutation = useMutation<Permiso, Error, { id: number; data: Partial<PermisoFormData> }>({
        mutationFn: ({ id, data }) => api.updatePermiso(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['permisos'] });
            toast({
                title: 'Permiso actualizado',
                description: 'El permiso se ha actualizado correctamente',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Error',
                description: error.message || 'Error al actualizar el permiso',
                variant: 'destructive',
            });
        },
    });

    const deletePermisoMutation = useMutation<void, Error, number>({
        mutationFn: api.deletePermiso,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['permisos'] });
            toast({
                title: 'Permiso eliminado',
                description: 'El permiso se ha eliminado correctamente',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Error',
                description: error.message || 'Error al eliminar el permiso',
                variant: 'destructive',
            });
        },
    });

    return {
        permisos: permisosQuery.data || [],
        isLoading: permisosQuery.isLoading,
        error: permisosQuery.error,
        createPermiso: createPermisoMutation.mutate,
        updatePermiso: updatePermisoMutation.mutate,
        deletePermiso: deletePermisoMutation.mutate,
        isCreating: createPermisoMutation.isPending,
        isUpdating: updatePermisoMutation.isPending,
        isDeleting: deletePermisoMutation.isPending,
    };
};