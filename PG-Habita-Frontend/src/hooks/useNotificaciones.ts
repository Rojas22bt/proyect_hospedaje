import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Notificacion, NotificacionFormData } from '@/types/auth';
import api from '@/services/api';
import { toast } from '@/hooks/use-toast';

// 🔥 FUNCIONES DE FETCH MEJORADAS CON MANEJO DE ERRORES
const fetchNotificaciones = async (): Promise<Notificacion[]> => {
  try {
    const response = await api.fetchNotificaciones();

    // Validar que la respuesta sea un array
    if (!Array.isArray(response)) {
      console.warn('⚠️ La respuesta de notificaciones no es un array:', response);
      return [];
    }

    return response;
  } catch (error: any) {
    console.error('❌ Error fetching notificaciones:', error);

    // Manejar errores específicos
    if (error instanceof SyntaxError) {
      console.error('Error de parsing JSON en notificaciones');
    }

    return [];
  }
};

const fetchNotificacionesNoLeidas = async (): Promise<Notificacion[]> => {
  try {
    console.log('🔍 Iniciando fetch de notificaciones no leídas...');

    const response = await api.fetchNotificacionesNoLeidas();

    // 🔥 DETECCIÓN MEJORADA DE ERRORES
    if (typeof response === 'string') {
      if (response.includes('<!DOCTYPE html>')) {
        console.error('❌ ERROR CRÍTICO: La API está devolviendo HTML en lugar de JSON');
        console.error('🔍 Esto indica que:');
        console.error('   1. VITE_API_URL está mal configurado');
        console.error('   2. El backend no está corriendo');
        console.error('   3. Hay un problema de CORS');

        // Mostrar información de diagnóstico
        console.log('📊 DIAGNÓSTICO:');
        console.log('   - VITE_API_URL:', import.meta.env.VITE_API_URL);
        console.log('   - Backend esperado: http://localhost:8000');
        console.log('   - Frontend: http://localhost:8081');

        return [];
      }
    }

    if (!Array.isArray(response)) {
      console.warn('⚠️ La respuesta de notificaciones no es un array:', typeof response, response);
      return [];
    }

    console.log(`✅ Notificaciones cargadas: ${response.length} notificaciones`);
    return response;

  } catch (error: any) {
    console.error('❌ Error fetching notificaciones no leídas:', error);

    // 🔥 DETECTAR ERRORES ESPECÍFICOS
    if (error.message?.includes('Failed to fetch')) {
      console.error('🚨 ERROR DE RED: No se puede conectar al backend');
      console.error('   Verifica que el backend esté ejecutándose en http://localhost:8000');
    }

    if (error.code === 'ERR_NETWORK') {
      console.error('🚨 ERROR DE RED: No hay conexión con el backend');
    }

    if (error.response?.status === 404) {
      console.error('🚨 ERROR 404: Endpoint no encontrado');
      console.error('   Verifica que la ruta /api/notificaciones/no-leidas/ exista en el backend');
    }

    return [];
  }
};

const countNotificacionesNoLeidas = async (): Promise<{ count: number }> => {
  try {
    const notificaciones = await fetchNotificacionesNoLeidas();
    return { count: notificaciones.length };
  } catch (error) {
    console.error('❌ Error contando notificaciones:', error);
    return { count: 0 };
  }
};

export const useNotificaciones = () => {
  const queryClient = useQueryClient();

  // Obtener todas las notificaciones
  const {
    data: notificaciones = [],
    isLoading: isLoadingAll,
    error: errorAll,
    refetch: refetchAll,
  } = useQuery({
    queryKey: ['notificaciones'],
    queryFn: fetchNotificaciones,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Obtener notificaciones no leídas
  const {
    data: notificacionesNoLeidas = [],
    isLoading: isLoadingNoLeidas,
    error: errorNoLeidas,
    refetch: refetchNoLeidas,
  } = useQuery({
    queryKey: ['notificaciones', 'no-leidas'],
    queryFn: fetchNotificacionesNoLeidas,
    retry: 1,
    staleTime: 1000 * 30, // 30 segundos
    refetchInterval: 1000 * 60, // Refrescar cada minuto
  });

  // Contar notificaciones no leídas
  const {
    data: countData = { count: 0 },
    isLoading: isLoadingCount,
    error: errorCount,
    refetch: refetchCount,
  } = useQuery({
    queryKey: ['notificaciones', 'count'],
    queryFn: countNotificacionesNoLeidas,
    retry: 1,
    staleTime: 1000 * 30, // 30 segundos
  });

  // Mutación para crear notificación personalizada
  const createNotificacionMutation = useMutation({
    mutationFn: (data: NotificacionFormData) => api.createNotificacion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
      queryClient.invalidateQueries({ queryKey: ['notificaciones', 'no-leidas'] });
      queryClient.invalidateQueries({ queryKey: ['notificaciones', 'count'] });

      toast({
        title: "✅ Notificación enviada",
        description: "La notificación se ha creado exitosamente",
      });
    },
    onError: (error: any) => {
      console.error('❌ Error creando notificación:', error);

      let errorMessage = 'No se pudo crear la notificación';

      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        }
      }

      toast({
        title: "❌ Error al crear notificación",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Mutación para marcar como leída
  const marcarLeidaMutation = useMutation({
    mutationFn: async ({ id, leida = true }: { id: number; leida?: boolean }) => {
      await api.marcarNotificacionLeida(id, { leida });
    },
    onSuccess: (_, variables) => {
      // Actualizar el estado local inmediatamente
      queryClient.setQueryData(['notificaciones', 'no-leidas'], (old: Notificacion[] = []) =>
        old.filter(notif => notif.id !== variables.id)
      );

      queryClient.setQueryData(['notificaciones'], (old: Notificacion[] = []) =>
        old.map(notif =>
          notif.id === variables.id ? { ...notif, leida: true } : notif
        )
      );

      // Invalidar para refrescar desde el servidor
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
      queryClient.invalidateQueries({ queryKey: ['notificaciones', 'no-leidas'] });
      queryClient.invalidateQueries({ queryKey: ['notificaciones', 'count'] });
    },
    onError: (error: any, variables) => {
      console.error(`❌ Error marcando notificación ${variables.id} como leída:`, error);

      toast({
        title: "Error",
        description: "No se pudo marcar la notificación como leída",
        variant: "destructive",
      });
    },
  });

  // Mutación para marcar todas como leídas
  const marcarTodasLeidasMutation = useMutation({
    mutationFn: () => api.marcarTodasLeidas(),
    onSuccess: () => {
      // Actualizar estado local inmediatamente
      queryClient.setQueryData(['notificaciones', 'no-leidas'], []);
      queryClient.setQueryData(['notificaciones'], (old: Notificacion[] = []) =>
        old.map(notif => ({ ...notif, leida: true }))
      );

      // Invalidar para refrescar
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
      queryClient.invalidateQueries({ queryKey: ['notificaciones', 'no-leidas'] });
      queryClient.invalidateQueries({ queryKey: ['notificaciones', 'count'] });

      toast({
        title: "✅ Notificaciones leídas",
        description: "Todas las notificaciones han sido marcadas como leídas",
      });
    },
    onError: (error: any) => {
      console.error('❌ Error marcando todas las notificaciones como leídas:', error);

      toast({
        title: "Error",
        description: "No se pudieron marcar las notificaciones como leídas",
        variant: "destructive",
      });
    },
  });

  // Mutación para eliminar notificación
  const deleteNotificacionMutation = useMutation({
    mutationFn: (id: number) => api.deleteNotificacion(id),
    onSuccess: (_, id) => {
      // Actualizar estado local inmediatamente
      queryClient.setQueryData(['notificaciones', 'no-leidas'], (old: Notificacion[] = []) =>
        old.filter(notif => notif.id !== id)
      );

      queryClient.setQueryData(['notificaciones'], (old: Notificacion[] = []) =>
        old.filter(notif => notif.id !== id)
      );

      // Invalidar para refrescar
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
      queryClient.invalidateQueries({ queryKey: ['notificaciones', 'no-leidas'] });
      queryClient.invalidateQueries({ queryKey: ['notificaciones', 'count'] });

      toast({
        title: "✅ Notificación eliminada",
        description: "La notificación ha sido eliminada",
      });
    },
    onError: (error: any, id) => {
      console.error(`❌ Error eliminando notificación ${id}:`, error);

      toast({
        title: "Error",
        description: "No se pudo eliminar la notificación",
        variant: "destructive",
      });
    },
  });

  // 🔥 FUNCIÓN PARA REFRESCAR TODAS LAS NOTIFICACIONES
  const refetchAllNotificaciones = () => {
    refetchAll();
    refetchNoLeidas();
    refetchCount();
  };

  return {
    // Datos - CON VALIDACIÓN EXTRA
    notificaciones: Array.isArray(notificaciones) ? notificaciones : [],
    notificacionesNoLeidas: Array.isArray(notificacionesNoLeidas) ? notificacionesNoLeidas : [],
    countNoLeidas: countData.count,

    // Estados de carga
    isLoading: isLoadingAll || isLoadingNoLeidas || isLoadingCount,
    isLoadingAll,
    isLoadingNoLeidas,
    isLoadingCount,

    // Errores
    errorAll,
    errorNoLeidas,
    errorCount,

    // Funciones de refetch
    refetch: refetchAll,
    refetchNoLeidas,
    refetchCount,
    refetchAll: refetchAllNotificaciones,

    // Mutaciones
    createNotificacion: createNotificacionMutation.mutate,
    marcarLeida: marcarLeidaMutation.mutate,
    marcarTodasLeidas: marcarTodasLeidasMutation.mutate,
    deleteNotificacion: deleteNotificacionMutation.mutate,

    // Estados de mutaciones
    isCreating: createNotificacionMutation.isPending,
    isMarcandoLeida: marcarLeidaMutation.isPending,
    isMarcandoTodas: marcarTodasLeidasMutation.isPending,
    isEliminando: deleteNotificacionMutation.isPending,
  };
};