
import requests
from django.core.cache import cache
import time


class OpenStreetMapService:
    @staticmethod
    def obtener_coordenadas(direccion):
        """
        Obtiene latitud y longitud usando Nominatim - Adaptado para Bolivia
        """
        # Verificar cache primero
        cache_key = f"geocoding_{direccion.replace(' ', '_').lower()}"
        cached_result = cache.get(cache_key)
        if cached_result:
            return cached_result

        url = "https://nominatim.openstreetmap.org/search"

        # Parámetros específicos para Bolivia
        params = {
            'q': f"{direccion}, Santa Cruz, Bolivia",
            'format': 'json',
            'limit': 1,
            'addressdetails': 1,
            'countrycodes': 'bo',  # Priorizar Bolivia
            'accept-language': 'es'  # Resultados en español
        }

        # Headers requeridos por Nominatim
        headers = {
            'User-Agent': 'HabitaApp/1.0 (habita@example.com)',
            'Referer': 'https://habita.com'
        }

        try:
            # Respeta el rate limiting (1 request/segundo)
            time.sleep(1)

            response = requests.get(url, params=params, headers=headers, timeout=10)

            if response.status_code == 200:
                data = response.json()

                if data:
                    resultado = data[0]

                    # Extraer información de ubicación
                    direccion_completa = resultado.get('display_name', '')
                    ciudad = ''
                    provincia = ''
                    departamento = ''

                    address = resultado.get('address', {})

                    # Buscar ciudad/municipio (estructura boliviana)
                    ciudad = (address.get('city') or
                              address.get('town') or
                              address.get('village') or
                              address.get('municipality') or
                              '')

                    # Buscar provincia
                    provincia = address.get('state_district') or ''

                    # Buscar departamento
                    departamento = address.get('state') or ''

                    respuesta = {
                        'latitud': float(resultado['lat']),
                        'longitud': float(resultado['lon']),
                        'direccion_completa': direccion_completa,
                        'ciudad': ciudad,
                        'provincia': provincia,
                        'departamento': departamento,
                        'pais': 'Bolivia',
                        'exito': True
                    }

                    # Cache por 30 días
                    cache.set(cache_key, respuesta, 60 * 60 * 24 * 30)
                    return respuesta
                else:
                    respuesta = {'exito': False, 'error': 'Dirección no encontrada'}
                    cache.set(cache_key, respuesta, 60 * 60 * 24)
                    return respuesta

            else:
                respuesta = {'exito': False, 'error': f'Error HTTP {response.status_code}'}
                cache.set(cache_key, respuesta, 60 * 60)
                return respuesta

        except requests.exceptions.Timeout:
            respuesta = {'exito': False, 'error': 'Timeout - Servicio no disponible'}
            cache.set(cache_key, respuesta, 60 * 10)
            return respuesta
        except Exception as e:
            respuesta = {'exito': False, 'error': f'Error: {str(e)}'}
            cache.set(cache_key, respuesta, 60 * 60)
            return respuesta


# 🔥 AGREGAR ESTA LÍNEA PARA MANTENER COMPATIBILIDAD
GoogleMapsService = OpenStreetMapService