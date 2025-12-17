import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { Propiedad, PropiedadFormData, BajaPropiedadData } from '@/types/auth';
import { toast } from './use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const usePropiedades = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const propiedadesQuery = useQuery<Propiedad[], Error>({
        queryKey: ['propiedades'],
        queryFn: () => api.fetchPropiedades(),
    });

    // 🔥 CORRECCIÓN: Filtrar propiedades según el tipo de usuario
    const getPropiedadesFiltradas = () => {
        if (!propiedadesQuery.data) return [];

        const propiedadesActivas = propiedadesQuery.data?.filter(prop => prop.status === true) || [];

        // Si es SUPERUSER o ADMIN, ver todas las propiedades activas
        if (user?.role === 'SUPERUSER' || user?.role === 'ADMIN') {
            return propiedadesActivas;
        }

        // Si es CLIENT, ver solo SUS propiedades activas
        if (user?.role === 'CLIENT') {
            return propiedadesActivas.filter(prop => prop.user === user.id);
        }

        return propiedadesActivas;
    };

    const propiedadesFiltradas = getPropiedadesFiltradas();

    const createPropiedadMutation = useMutation<Propiedad, Error, PropiedadFormData>({
        mutationFn: api.createPropiedad,
        onSuccess: (newPropiedad) => {
            queryClient.invalidateQueries({ queryKey: ['propiedades'] });
            toast({
                title: '✅ Propiedad creada',
                description: `La propiedad "${newPropiedad.nombre}" ha sido creada exitosamente.`,
            });
        },
        onError: (error: Error) => {
            toast({
                title: '❌ Error al crear propiedad',
                description: error.message || 'No se pudo crear la propiedad',
                variant: 'destructive',
            });
        },
    });

    const updatePropiedadMutation = useMutation<Propiedad, Error, { id: number; data: Partial<PropiedadFormData> }>({
        mutationFn: ({ id, data }) => api.updatePropiedad(id, data),
        onSuccess: (updatedPropiedad) => {
            queryClient.invalidateQueries({ queryKey: ['propiedades'] });
            toast({
                title: '✅ Propiedad actualizada',
                description: `La propiedad "${updatedPropiedad.nombre}" ha sido actualizada.`,
            });
        },
        onError: (error: Error) => {
            toast({
                title: '❌ Error al actualizar propiedad',
                description: error.message || 'No se pudo actualizar la propiedad',
                variant: 'destructive',
            });
        },
    });

    const deletePropiedadMutation = useMutation<void, Error, number>({
        mutationFn: api.deletePropiedad,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['propiedades'] });
            toast({
                title: '✅ Propiedad eliminada',
                description: 'La propiedad ha sido eliminada exitosamente.',
            });
        },
        onError: (error: Error) => {
            toast({
                title: '❌ Error al eliminar propiedad',
                description: error.message || 'No se pudo eliminar la propiedad',
                variant: 'destructive',
            });
        },
    });

    const darBajaPropiedadMutation = useMutation<Propiedad, Error, { id: number; data: BajaPropiedadData }>({
        mutationFn: ({ id, data }) => api.darBajaPropiedad(id, data),
        onSuccess: (updatedPropiedad) => {
            queryClient.invalidateQueries({ queryKey: ['propiedades'] });
            toast({
                title: '✅ Propiedad dada de baja',
                description: `La propiedad "${updatedPropiedad.nombre}" ha sido dada de baja.`,
            });
        },
        onError: (error: Error) => {
            toast({
                title: '❌ Error al dar de baja',
                description: error.message || 'No se pudo dar de baja la propiedad',
                variant: 'destructive',
            });
        },
    });

    // 🔥 NUEVA MUTATION PARA REACTIVAR
    const reactivarPropiedadMutation = useMutation<Propiedad, Error, number>({
        mutationFn: (id) => api.reactivarPropiedad(id),
        onSuccess: (updatedPropiedad) => {
            queryClient.invalidateQueries({ queryKey: ['propiedades'] });
            toast({
                title: '✅ Propiedad reactivada',
                description: `La propiedad "${updatedPropiedad.nombre}" ha sido reactivada.`,
            });
        },
        onError: (error: Error) => {
            toast({
                title: '❌ Error al reactivar',
                description: error.message || 'No se pudo reactivar la propiedad',
                variant: 'destructive',
            });
        },
    });

    return {
        propiedades: propiedadesQuery.data || [],
        isLoading: propiedadesQuery.isLoading,
        error: propiedadesQuery.error,
        createPropiedad: createPropiedadMutation.mutate,
        updatePropiedad: updatePropiedadMutation.mutate,
        deletePropiedad: deletePropiedadMutation.mutate,
        darBajaPropiedad: darBajaPropiedadMutation.mutate,
        reactivarPropiedad: reactivarPropiedadMutation.mutate,
        isCreating: createPropiedadMutation.isPending,
        isUpdating: updatePropiedadMutation.isPending,
        isDeleting: deletePropiedadMutation.isPending,
        isDandoBaja: darBajaPropiedadMutation.isPending,
        isReactivando: reactivarPropiedadMutation.isPending,
    };
};