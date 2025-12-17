import { useQuery } from '@tanstack/react-query';
import { Propiedad } from '@/types/auth';

export const usePropiedadesReservas = () => {
    const propiedadesReservasQuery = useQuery<Propiedad[], Error>({
        queryKey: ['propiedades-reservas'],
        queryFn: async () => {
            try {
                console.log('🔄 Fetching propiedades PÚBLICAS para reservas...');

                // 🔥 CAMBIA ESTA URL: Usa el endpoint público
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/propiedades/public/`);

                if (!response.ok) {
                    throw new Error('Error al cargar las propiedades públicas');
                }

                const propiedades = await response.json();

                // 🔥 DEBUG: Ver qué propiedades estamos recibiendo
                console.log('📦 Propiedades PÚBLICAS recibidas:', propiedades);
                console.log('🔢 Total de propiedades públicas:', propiedades.length);

                // Filtrar solo propiedades activas (por si acaso)
                const propiedadesActivas = propiedades.filter((prop: Propiedad) => prop.status === true);

                console.log('✅ Propiedades activas filtradas:', propiedadesActivas);
                console.log('🔢 Total de propiedades activas:', propiedadesActivas.length);

                // 🔥 DEBUG: Ver detalles de cada propiedad y sus usuarios
                propiedadesActivas.forEach((prop: Propiedad, index: number) => {
                    console.log(`🏠 Propiedad ${index + 1}:`, {
                        id: prop.id,
                        nombre: prop.nombre,
                        status: prop.status,
                        user: prop.user,
                        precio: prop.precio_noche,
                        usuario: `Usuario ${prop.user}`
                    });
                });

                return propiedadesActivas;

            } catch (error) {
                console.error('❌ Error en usePropiedadesReservas:', error);
                throw new Error(error instanceof Error ? error.message : 'Error desconocido al cargar propiedades para reservas');
            }
        },
    });

    return {
        propiedades: propiedadesReservasQuery.data || [],
        isLoading: propiedadesReservasQuery.isLoading,
        error: propiedadesReservasQuery.error,
    };
};