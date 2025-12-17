import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { User, UsuarioFormData } from '@/types/auth';
import { toast } from './use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useUsuarios = () => {
    const queryClient = useQueryClient();
     const { user } = useAuth();


    // 🔥 MEJORADO: Manejo de errores 403
    const usuariosQuery = useQuery<User[], Error>({
        queryKey: ['usuarios'],
        queryFn: async () => {
            try {
                const data = await api.fetchUsuarios();
                return data;
            } catch (error: any) {
                if (error.response?.status === 403) {
                    console.warn('⚠️ Acceso denegado a usuarios. Mostrando solo usuario actual.');
                    // Si no tiene permisos, devolver solo el usuario actual
                    return user ? [user] : [];
                }
                throw error;
            }
        },
        retry: 1,
    });

    const createUsuarioMutation = useMutation<User, Error, UsuarioFormData>({
        mutationFn: api.createUsuario,
        onSuccess: (newUsuario) => {
            queryClient.invalidateQueries({ queryKey: ['usuarios'] });
            toast({
                title: '✅ Usuario creado',
                description: `El usuario "${newUsuario.username}" ha sido creado exitosamente.`,
            });
        },
        onError: (error: Error) => {
            toast({
                title: '❌ Error al crear usuario',
                description: error.message || 'No se pudo crear el usuario',
                variant: 'destructive',
            });
        },
    });

    const updateUsuarioMutation = useMutation<User, Error, { id: number; data: Partial<UsuarioFormData> }>({
        mutationFn: ({ id, data }) => api.updateUsuario(id, data),
        onSuccess: (updatedUsuario) => {
            queryClient.invalidateQueries({ queryKey: ['usuarios'] });
            toast({
                title: '✅ Usuario actualizado',
                description: `El usuario "${updatedUsuario.first_name}" ha sido actualizado.`,
            });
        },
        onError: (error: any) => {
            console.error('❌ Error completo al actualizar usuario:', error);
            console.error('🔍 Respuesta del servidor:', error.response?.data);

            let errorMessage = 'No se pudo actualizar el usuario';

            if (error.response?.data) {
                // Mostrar errores específicos del backend
                if (typeof error.response.data === 'object') {
                    const errorDetails = Object.entries(error.response.data)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ');
                    errorMessage = `Errores: ${errorDetails}`;
                } else if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                }
            }

            toast({
                title: '❌ Error al actualizar usuario',
                description: errorMessage,
                variant: 'destructive',
            });
        },
    });

    const deleteUsuarioMutation = useMutation<void, Error, number>({
        mutationFn: api.deleteUsuario,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['usuarios'] });
            toast({
                title: 'Usuario eliminado',
                description: 'El usuario se ha eliminado correctamente',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Error',
                description: error.message || 'Error al eliminar el usuario',
                variant: 'destructive',
            });
        },
    });

    return {
        usuarios: usuariosQuery.data || [],
               isLoading: usuariosQuery.isLoading,
               error: usuariosQuery.error,
               createUsuario: createUsuarioMutation.mutate,
        updateUsuario: updateUsuarioMutation.mutate,
        deleteUsuario: deleteUsuarioMutation.mutate,
        isCreating: createUsuarioMutation.isPending,
        isUpdating: updateUsuarioMutation.isPending,
        isDeleting: deleteUsuarioMutation.isPending,
    };
};