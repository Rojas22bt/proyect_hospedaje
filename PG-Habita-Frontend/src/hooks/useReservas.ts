import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Reserva, ReservaFormData, ReservaConDetalles } from '@/types/auth';
import api from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useNotificaciones } from './useNotificaciones'

interface ReservaConDetallesMejorada extends Reserva {
  usuario_info?: User;
  propiedad_info?: Propiedad;
  host_info?: User;
  // Campos de compatibilidad hacia atrás
  usuario?: User;
  propiedadInfo?: Propiedad;
}

export const useReservas = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { refetch: refetchNotificaciones } = useNotificaciones();

  // Obtener todas las reservas
  const {
    data: reservas = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['reservas'],
    queryFn: async (): Promise<Reserva[]> => {
      try {
        const data = await api.fetchReservas();
        console.log('📦 Reservas obtenidas:', data);
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('❌ Error obteniendo reservas:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Obtener una reserva específica
  const useReserva = (id: number) => {
    return useQuery({
      queryKey: ['reserva', id],
      queryFn: async (): Promise<ReservaConDetallesMejorada> => {
        if (!id) throw new Error('ID de reserva no válido');

        try {
          const data = await api.fetchReserva(id);
          console.log('📋 Reserva detallada obtenida:', data);


          const reservaNormalizada: ReservaConDetallesMejorada = {
            ...data,
            usuario: data.usuario_info || data.usuario,
            propiedadInfo: data.propiedad_info || data.propiedadInfo
          };

          return reservaNormalizada;
        } catch (error) {
          console.error(`❌ Error obteniendo reserva ${id}:`, error);
          throw error;
        }
      },
      enabled: !!id,
      staleTime: 1000 * 60 * 5,
    });
  };


  // Obtener fechas ocupadas de una propiedad
  const useFechasOcupadas = (propiedadId: number) => {
    return useQuery({
      queryKey: ['fechas-ocupadas', propiedadId],
      queryFn: async (): Promise<string[]> => {
        if (!propiedadId) return [];

        try {
          const data = await api.fetchFechasOcupadas(propiedadId);
          return data.fechas_ocupadas || [];
        } catch (error) {
          console.error(`❌ Error obteniendo fechas ocupadas para propiedad ${propiedadId}:`, error);
          return [];
        }
      },
      enabled: !!propiedadId,
      staleTime: 1000 * 60 * 10, // 10 minutos
    });
  };

  // Mutación para crear reserva
  const createReservaMutation = useMutation({
    mutationFn: async (data: ReservaFormData): Promise<Reserva> => {
      console.log('🔄 Creando reserva con datos:', data);

      // Validaciones básicas
      if (!data.propiedad || !data.user) {
        throw new Error('Propiedad y usuario son requeridos');
      }

      if (new Date(data.fecha_checkin) >= new Date(data.fecha_checkout)) {
        throw new Error('La fecha de check-out debe ser posterior al check-in');
      }

      const response = await api.createReserva(data);
      return response;
    },
    onSuccess: (data) => {
      console.log('✅ Reserva creada exitosamente:', data);

      // Invalidar queries para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['reservas'] });
      queryClient.invalidateQueries({ queryKey: ['fechas-ocupadas'] });

      // 🔥 REFRESCAR NOTIFICACIONES - La nueva reserva generará notificaciones automáticas
      refetchNotificaciones();

      toast({
        title: "✅ Reserva creada",
        description: `Tu reserva #${data.id} ha sido solicitada exitosamente`,
        variant: "default",
      });
    },
    onError: (error: any) => {
      console.error('❌ Error creando reserva:', error);

      let errorMessage = 'No se pudo crear la reserva';

      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.fechas) {
          errorMessage = error.response.data.fechas;
        } else if (error.response.data.fecha_checkout) {
          errorMessage = error.response.data.fecha_checkout;
        } else if (error.response.data.fecha_checkin) {
          errorMessage = error.response.data.fecha_checkin;
        }
      }

      toast({
        title: "❌ Error al crear reserva",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Mutación para actualizar reserva
  const updateReservaMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ReservaFormData> }): Promise<Reserva> => {
      console.log(`🔄 Actualizando reserva ${id} con datos:`, data);

      // Validación de fechas si se están actualizando
      if (data.fecha_checkin && data.fecha_checkout) {
        if (new Date(data.fecha_checkin) >= new Date(data.fecha_checkout)) {
          throw new Error('La fecha de check-out debe ser posterior al check-in');
        }
      }

      const response = await api.updateReserva(id, data);
      return response;
    },
    onSuccess: (data, variables) => {
      console.log('✅ Reserva actualizada exitosamente:', data);

      // Invalidar queries para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['reservas'] });
      queryClient.invalidateQueries({ queryKey: ['reserva', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['fechas-ocupadas'] });

      // 🔥 REFRESCAR NOTIFICACIONES - Los cambios de estado generarán notificaciones automáticas
      refetchNotificaciones();

      toast({
        title: "✅ Reserva actualizada",
        description: `La reserva #${data.id} ha sido actualizada exitosamente`,
        variant: "default",
      });
    },
    onError: (error: any) => {
      console.error('❌ Error actualizando reserva:', error);

      let errorMessage = 'No se pudo actualizar la reserva';

      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.fechas) {
          errorMessage = error.response.data.fechas;
        }
      }

      toast({
        title: "❌ Error al actualizar reserva",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Mutación para anular/reservar (cambiar estado a "rechazada")
  const anularReservaMutation = useMutation({
    mutationFn: async (reservaId: number): Promise<Reserva> => {
      console.log(`🔄 Anulando reserva ${reservaId}`);

      const response = await api.updateReserva(reservaId, {
        status: 'rechazada',
        pago_estado: 'reembolsado' // Si aplica reembolso automático
      });

      return response;
    },
    onSuccess: (data, reservaId) => {
      console.log('✅ Reserva anulada exitosamente:', data);

      // Invalidar queries para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['reservas'] });
      queryClient.invalidateQueries({ queryKey: ['reserva', reservaId] });
      queryClient.invalidateQueries({ queryKey: ['fechas-ocupadas'] });

      // 🔥 REFRESCAR NOTIFICACIONES - La anulación generará notificaciones automáticas
      refetchNotificaciones();

      toast({
        title: "✅ Reserva anulada",
        description: `La reserva #${data.id} ha sido anulada exitosamente`,
        variant: "default",
      });
    },
    onError: (error: any, reservaId) => {
      console.error(`❌ Error anulando reserva ${reservaId}:`, error);

      let errorMessage = 'No se pudo anular la reserva';

      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        }
      }

      toast({
        title: "❌ Error al anular reserva",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Mutación para cancelar reserva (cambiar estado a "cancelada")
  const cancelarReservaMutation = useMutation({
    mutationFn: async (reservaId: number): Promise<Reserva> => {
      console.log(`🔄 Cancelando reserva ${reservaId}`);

      const response = await api.updateReserva(reservaId, {
        status: 'cancelada',
        pago_estado: 'reembolsado' // Si aplica reembolso
      });

      return response;
    },
    onSuccess: (data, reservaId) => {
      console.log('✅ Reserva cancelada exitosamente:', data);

      // Invalidar queries para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['reservas'] });
      queryClient.invalidateQueries({ queryKey: ['reserva', reservaId] });
      queryClient.invalidateQueries({ queryKey: ['fechas-ocupadas'] });

      // 🔥 REFRESCAR NOTIFICACIONES - La cancelación generará notificaciones automáticas
      refetchNotificaciones();

      toast({
        title: "✅ Reserva cancelada",
        description: `La reserva #${data.id} ha sido cancelada exitosamente`,
        variant: "default",
      });
    },
    onError: (error: any, reservaId) => {
      console.error(`❌ Error cancelando reserva ${reservaId}:`, error);

      let errorMessage = 'No se pudo cancelar la reserva';

      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        }
      }

      toast({
        title: "❌ Error al cancelar reserva",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Mutación para confirmar reserva (cambiar estado a "confirmada")
  const confirmarReservaMutation = useMutation({
    mutationFn: async (reservaId: number): Promise<Reserva> => {
      console.log(`🔄 Confirmando reserva ${reservaId}`);

      const response = await api.updateReserva(reservaId, {
        status: 'confirmada'
      });

      return response;
    },
    onSuccess: (data, reservaId) => {
      console.log('✅ Reserva confirmada exitosamente:', data);

      // Invalidar queries para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['reservas'] });
      queryClient.invalidateQueries({ queryKey: ['reserva', reservaId] });

      // 🔥 REFRESCAR NOTIFICACIONES - La confirmación generará notificaciones automáticas
      refetchNotificaciones();

      toast({
        title: "✅ Reserva confirmada",
        description: `La reserva #${data.id} ha sido confirmada exitosamente`,
        variant: "default",
      });
    },
    onError: (error: any, reservaId) => {
      console.error(`❌ Error confirmando reserva ${reservaId}:`, error);

      let errorMessage = 'No se pudo confirmar la reserva';

      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        }
      }

      toast({
        title: "❌ Error al confirmar reserva",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Mutación para eliminar reserva
  const deleteReservaMutation = useMutation({
    mutationFn: async (reservaId: number): Promise<void> => {
      console.log(`🗑️ Eliminando reserva ${reservaId}`);
      await api.deleteReserva(reservaId);
    },
    onSuccess: (_, reservaId) => {
      console.log(`✅ Reserva ${reservaId} eliminada exitosamente`);

      // Invalidar queries para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['reservas'] });
      queryClient.invalidateQueries({ queryKey: ['fechas-ocupadas'] });

      toast({
        title: "✅ Reserva eliminada",
        description: "La reserva ha sido eliminada exitosamente",
        variant: "default",
      });
    },
    onError: (error: any, reservaId) => {
      console.error(`❌ Error eliminando reserva ${reservaId}:`, error);

      let errorMessage = 'No se pudo eliminar la reserva';

      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        }
      }

      toast({
        title: "❌ Error al eliminar reserva",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Filtrar reservas por estado
  const getReservasPorEstado = (estado: string): Reserva[] => {
    return reservas.filter(reserva => reserva.status === estado);
  };

  // Filtrar reservas del usuario actual
  const getMisReservas = (userId: number): Reserva[] => {
    return reservas.filter(reserva => reserva.user === userId);
  };

  // Filtrar reservas de las propiedades del usuario (para anfitriones)
  const getReservasDeMisPropiedades = (propiedadIds: number[]): Reserva[] => {
    return reservas.filter(reserva => propiedadIds.includes(reserva.propiedad));
  };
const loadReservaDetails = async (reservaId: number): Promise<ReservaConDetallesMejorada> => {
  try {
    console.log(`🔄 Cargando detalles de reserva ${reservaId}`);
    const response = await api.fetchReserva(reservaId);
    console.log('📋 Detalles de reserva cargados:', response);

    // Normalizar campos
    const reservaNormalizada: ReservaConDetallesMejorada = {
      ...response,
      usuario: response.usuario_info || response.usuario,
      propiedadInfo: response.propiedad_info || response.propiedadInfo
    };

    return reservaNormalizada;
  } catch (error) {
    console.error(`❌ Error cargando detalles de reserva ${reservaId}:`, error);
    throw error;
  }
};

  return {
    // Datos
    reservas,
    loadReservaDetails,

    // Estados de carga
    isLoading,
    error,

    // Funciones de consulta
    refetch,
    useReserva,
    useFechasOcupadas,

    // Funciones de filtrado
    getReservasPorEstado,
    getMisReservas,
    getReservasDeMisPropiedades,

    // Mutaciones
    createReserva: createReservaMutation.mutate,
    updateReserva: updateReservaMutation.mutate,
    anularReserva: anularReservaMutation.mutate,
    cancelarReserva: cancelarReservaMutation.mutate,
    confirmarReserva: confirmarReservaMutation.mutate,
    deleteReserva: deleteReservaMutation.mutate,

    // Estados de mutaciones
    isCreating: createReservaMutation.isPending,
    isUpdating: updateReservaMutation.isPending,
    isAnulando: anularReservaMutation.isPending,
    isCancelando: cancelarReservaMutation.isPending,
    isConfirmando: confirmarReservaMutation.isPending,
    isDeleting: deleteReservaMutation.isPending,

    // Datos de mutaciones (para acceso a respuestas)
    createdReserva: createReservaMutation.data,
    updatedReserva: updateReservaMutation.data,
    anuladaReserva: anularReservaMutation.data,
    canceladaReserva: cancelarReservaMutation.data,
    confirmadaReserva: confirmarReservaMutation.data,
  };
};

export default useReservas;