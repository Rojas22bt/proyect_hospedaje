import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { Suscripcion, SuscripcionFormData } from '@/types/auth';
import { toast } from './use-toast';

export const useSuscripciones = () => {
    const queryClient = useQueryClient();

    // CORRECCIÓN: Especificar tipos explícitos
    const suscripcionesQuery = useQuery<Suscripcion[], Error>({
        queryKey: ['suscripciones'],
        queryFn: () => api.fetchSuscripciones(),
    });

    const createSuscripcionMutation = useMutation<Suscripcion, Error, SuscripcionFormData>({
        mutationFn: api.createSuscripcion,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suscripciones'] });
            toast({
                title: 'Suscripción creada',
                description: 'La suscripción se ha creado correctamente',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Error',
                description: error.message || 'Error al crear la suscripción',
                variant: 'destructive',
            });
        },
    });

    const updateSuscripcionMutation = useMutation<Suscripcion, Error, { id: number; data: Partial<SuscripcionFormData> }>({
        mutationFn: ({ id, data }) => api.updateSuscripcion(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suscripciones'] });
            toast({
                title: 'Suscripción actualizada',
                description: 'La suscripción se ha actualizado correctamente',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Error',
                description: error.message || 'Error al actualizar la suscripción',
                variant: 'destructive',
            });
        },
    });

    const deleteSuscripcionMutation = useMutation<void, Error, number>({
        mutationFn: api.deleteSuscripcion,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suscripciones'] });
            toast({
                title: 'Suscripción eliminada',
                description: 'La suscripción se ha eliminado correctamente',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Error',
                description: error.message || 'Error al eliminar la suscripción',
                variant: 'destructive',
            });
        },
    });

    return {
        suscripciones: suscripcionesQuery.data || [],
        isLoading: suscripcionesQuery.isLoading,
        error: suscripcionesQuery.error,
        createSuscripcion: createSuscripcionMutation.mutate,
        updateSuscripcion: updateSuscripcionMutation.mutate,
        deleteSuscripcion: deleteSuscripcionMutation.mutate,
        isCreating: createSuscripcionMutation.isPending,
        isUpdating: updateSuscripcionMutation.isPending,
        isDeleting: deleteSuscripcionMutation.isPending,
    };
};