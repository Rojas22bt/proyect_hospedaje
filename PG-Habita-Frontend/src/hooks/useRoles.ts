import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { Rol, RolFormData } from '@/types/auth';
import { toast } from './use-toast';

export const useRoles = () => {
    const queryClient = useQueryClient();

    // CORRECCIÓN: Especificar tipos explícitos
    const rolesQuery = useQuery<Rol[], Error>({
        queryKey: ['roles'],
        queryFn: () => api.fetchRoles(),
    });

    const createRolMutation = useMutation<Rol, Error, RolFormData>({
        mutationFn: api.createRol,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            toast({
                title: 'Rol creado',
                description: 'El rol se ha creado correctamente',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Error',
                description: error.message || 'Error al crear el rol',
                variant: 'destructive',
            });
        },
    });

    const updateRolMutation = useMutation<Rol, Error, { id: number; data: Partial<RolFormData> }>({
        mutationFn: ({ id, data }) => api.updateRol(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            toast({
                title: 'Rol actualizado',
                description: 'El rol se ha actualizado correctamente',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Error',
                description: error.message || 'Error al actualizar el rol',
                variant: 'destructive',
            });
        },
    });

    const deleteRolMutation = useMutation<void, Error, number>({
        mutationFn: api.deleteRol,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            toast({
                title: 'Rol eliminado',
                description: 'El rol se ha eliminado correctamente',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Error',
                description: error.message || 'Error al eliminar el rol',
                variant: 'destructive',
            });
        },
    });

    return {
        roles: rolesQuery.data || [],
        isLoading: rolesQuery.isLoading,
        error: rolesQuery.error,
        createRol: createRolMutation.mutate,
        updateRol: updateRolMutation.mutate,
        deleteRol: deleteRolMutation.mutate,
        isCreating: createRolMutation.isPending,
        isUpdating: updateRolMutation.isPending,
        isDeleting: deleteRolMutation.isPending,
    };
};