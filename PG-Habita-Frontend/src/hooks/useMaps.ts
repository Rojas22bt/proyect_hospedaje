    // useMaps.ts - ACTUALIZADO
    import { useMutation } from '@tanstack/react-query';
    import api from '@/services/api';
    import { GeocodingResult, Propiedad } from '@/types/auth';
    import { toast } from './use-toast';

    interface GeocodingOptions {
        onSuccess?: (result: GeocodingResult) => void;
        onError?: (error: Error) => void;
    }

    export const useMaps = () => {
        const geocodificarMutation = useMutation<GeocodingResult, Error, string, GeocodingOptions>({
            mutationFn: api.geocodificarDireccion,
            onSuccess: (data, variables, context) => {
                if (data.exito) {
                    context?.onSuccess?.(data);
                } else {
                    toast({
                        title: '❌ Ubicación no encontrada',
                        description: data.error || 'No se pudo encontrar la ubicación exacta',
                        variant: 'destructive',
                    });
                    context?.onError?.(new Error(data.error || 'Ubicación no encontrada'));
                }
            },
            onError: (error: Error, variables, context) => {
                toast({
                    title: '❌ Error de geocodificación',
                    description: error.message || 'No se pudo obtener la ubicación',
                    variant: 'destructive',
                });
                context?.onError?.(error);
            },
        });

        const actualizarUbicacionMutation = useMutation<Propiedad, Error, { id: number; data: any }>({
            mutationFn: ({ id, data }) => api.actualizarUbicacionPropiedad(id, data),
            onSuccess: (propiedad) => {
                toast({
                    title: '📍 Ubicación actualizada',
                    description: `La ubicación de "${propiedad.nombre}" ha sido actualizada.`,
                });
            },
            onError: (error: Error) => {
                toast({
                    title: '❌ Error al actualizar ubicación',
                    description: error.message || 'No se pudo actualizar la ubicación',
                    variant: 'destructive',
                });
            },
        });

        return {
            geocodificar: (direccion: string, options?: GeocodingOptions) =>
                geocodificarMutation.mutate(direccion, options),
            actualizarUbicacion: actualizarUbicacionMutation.mutate,
            isGeocodificando: geocodificarMutation.isPending,
            isActualizandoUbicacion: actualizarUbicacionMutation.isPending,
            datosGeocodificacion: geocodificarMutation.data,
        };
    };