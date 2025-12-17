// src/hooks/usePropiedadesReservas.ts
import { useQuery } from '@tanstack/react-query';
import { Propiedad } from '@/types/auth';
import api from '@/services/api';

export const usePropiedadesReservas = () => {
  const {
    data: propiedades = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['propiedades-publicas'],
    queryFn: async (): Promise<Propiedad[]> => {
      try {
        console.log('🔄 Fetching propiedades PÚBLICAS para landing page...');
        
        // Usar la API pública para el landing page
        const data = await api.fetchPropiedadesPublicas();
        console.log('📦 Propiedades PÚBLICAS recibidas:', data);
        
        // Validar que sea un array
        if (!Array.isArray(data)) {
          console.warn('⚠️ La respuesta no es un array:', data);
          return [];
        }
        
        console.log('🔢 Total de propiedades públicas:', data.length);
        
        // 🔥 FILTRAR SOLO PROPIEDADES ACTIVAS Y DISPONIBLES
        const propiedadesActivas = data.filter(prop => {
          const estaDisponible = prop.esta_disponible !== false && 
                               prop.status !== false && 
                               prop.estado_baja === 'activa';
          
          console.log(`🏠 Propiedad ${prop.id}:`, {
            nombre: prop.nombre,
            status: prop.status,
            esta_disponible: prop.esta_disponible,
            estado_baja: prop.estado_baja,
            disponible: estaDisponible,
            latitud: prop.latitud,
            longitud: prop.longitud,
            tieneCoordenadas: !!(prop.latitud && prop.longitud)
          });
          
          return estaDisponible;
        });
        
        console.log('✅ Propiedades activas filtradas:', propiedadesActivas);
        console.log('🔢 Total de propiedades activas:', propiedadesActivas.length);
        
        // 🔥 DEBUG: Ver propiedades con coordenadas
        const propiedadesConCoordenadas = propiedadesActivas.filter(prop => 
          prop.latitud && prop.longitud
        );
        console.log('📍 Propiedades con coordenadas:', propiedadesConCoordenadas);
        
        return propiedadesActivas;
      } catch (error) {
        console.error('❌ Error obteniendo propiedades públicas:', error);
        
        // En caso de error, retornar array vacío para que el landing page funcione
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 2,
  });

  return {
    propiedades,
    isLoading,
    error,
    refetch,
  };
};

export default usePropiedadesReservas;