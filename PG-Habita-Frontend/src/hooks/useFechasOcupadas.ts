import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

export const useFechasOcupadas = (propiedadId: number | null) => {
    return useQuery({
        queryKey: ['fechas-ocupadas', propiedadId],
        queryFn: async () => {
            if (!propiedadId) {
                return { fechas_ocupadas: [] };
            }

            try {
                const data = await api.fetchFechasOcupadas(propiedadId);
                console.log(`📅 Fechas ocupadas para propiedad ${propiedadId}:`, data.fechas_ocupadas);
                return data;
            } catch (error) {
                console.error(`❌ Error obteniendo fechas ocupadas para propiedad ${propiedadId}:`, error);
                // En caso de error, retornar array vacío para no bloquear la UI
                return { fechas_ocupadas: [] };
            }
        },
        enabled: !!propiedadId,
        staleTime: 2 * 60 * 1000, // 2 minutos
        retry: 1,
    });
};