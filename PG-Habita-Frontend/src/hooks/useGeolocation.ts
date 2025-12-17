// src/hooks/useGeolocation.ts
import { useState, useCallback } from 'react';
import { useMaps } from './useMaps';

export const useGeolocation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { geocodificar } = useMaps();

  const getCurrentLocation = useCallback((): Promise<{
    latitud: number;
    longitud: number;
    direccion_completa: string;
  }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('La geolocalización no es soportada por tu navegador'));
        return;
      }

      setIsLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;

            // Reverse geocoding
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=es`
            );

            const data = await response.json();

            resolve({
              latitud: latitude,
              longitud: longitude,
              direccion_completa: data.display_name || 'Ubicación actual'
            });
          } catch (err) {
            reject(err);
          } finally {
            setIsLoading(false);
          }
        },
        (err) => {
          setIsLoading(false);
          setError('No se pudo obtener tu ubicación actual');
          reject(err);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }, []);

  const searchLocation = useCallback(async (query: string) => {
    if (!query.trim()) {
      throw new Error('La búsqueda no puede estar vacía');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Bolivia')}&limit=5&addressdetails=1&accept-language=es`
      );

      if (!response.ok) {
        throw new Error('Error en la búsqueda');
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        throw new Error('No se encontraron resultados para la búsqueda');
      }

      return data.map((result: any) => ({
        latitud: parseFloat(result.lat),
        longitud: parseFloat(result.lon),
        direccion_completa: result.display_name,
        ciudad: result.address?.city || result.address?.town || result.address?.village,
        provincia: result.address?.state || result.address?.county,
        departamento: result.address?.state,
        pais: result.address?.country || 'Bolivia'
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en la búsqueda');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getCurrentLocation,
    searchLocation,
    isLoading,
    error,
    clearError: () => setError(null)
  };
};