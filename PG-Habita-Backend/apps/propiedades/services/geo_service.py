import logging
import requests
from typing import Dict, List, Optional, Tuple
from django.core.cache import cache
from .maps_service import OpenStreetMapService

logger = logging.getLogger(__name__)


class GeoService:

    @staticmethod
    def actualizar_geodatos_propiedad(propiedad, direccion: Optional[str] = None) -> Tuple[bool, Dict]:
        """
        Actualiza los datos geográficos de una propiedad con manejo mejorado de errores
        """
        try:
            if not direccion:
                direccion = propiedad.direccion_completa

            if not direccion or not direccion.strip():
                return False, {'error': 'La dirección no puede estar vacía'}

            # Intentar geocodificación
            resultado = OpenStreetMapService.obtener_coordenadas(direccion)

            if resultado['exito']:
                # Actualizar campos de la propiedad
                propiedad.latitud = resultado['latitud']
                propiedad.longitud = resultado['longitud']
                propiedad.direccion_completa = resultado.get('direccion_completa', '')
                propiedad.ciudad = resultado.get('ciudad', '')
                propiedad.provincia = resultado.get('provincia', '')
                propiedad.departamento = resultado.get('departamento', '')
                propiedad.pais = resultado.get('pais', 'Bolivia')

                # Determinar si es destino turístico
                propiedad.es_destino_turistico = GeoService._es_destino_turistico(
                    resultado.get('ciudad', ''),
                    resultado.get('departamento', '')
                )

                logger.info(f"✅ Propiedad {propiedad.nombre} geocodificada exitosamente")
                return True, resultado
            else:
                logger.warning(f"⚠️ No se pudo geocodificar propiedad {propiedad.nombre}: {resultado.get('error')}")
                return False, resultado

        except Exception as e:
            logger.error(f"❌ Error en geocodificación para propiedad {propiedad.nombre}: {str(e)}")
            return False, {'error': f'Error interno: {str(e)}'}

    @staticmethod
    def validar_coordenadas_bolivia(latitud: float, longitud: float) -> bool:
        """
        Valida que las coordenadas estén dentro de Bolivia
        """
        # Límites aproximados de Bolivia
        lat_min, lat_max = -22.9, -9.7
        lng_min, lng_max = -69.6, -57.5

        return (lat_min <= latitud <= lat_max and
                lng_min <= longitud <= lng_max)

    @staticmethod
    def obtener_ciudades_bolivia() -> List[Dict]:
        """
        Retorna lista de ciudades principales de Bolivia para autocompletado
        """
        ciudades = [
            {"nombre": "Santa Cruz de la Sierra", "departamento": "Santa Cruz", "lat": -17.7833, "lng": -63.1821},
            {"nombre": "La Paz", "departamento": "La Paz", "lat": -16.4897, "lng": -68.1193},
            {"nombre": "El Alto", "departamento": "La Paz", "lat": -16.5048, "lng": -68.1633},
            {"nombre": "Cochabamba", "departamento": "Cochabamba", "lat": -17.3895, "lng": -66.1568},
            {"nombre": "Sucre", "departamento": "Chuquisaca", "lat": -19.0196, "lng": -65.2620},
            {"nombre": "Oruro", "departamento": "Oruro", "lat": -17.9667, "lng": -67.1167},
            {"nombre": "Tarija", "departamento": "Tarija", "lat": -21.5355, "lng": -64.7296},
            {"nombre": "Potosí", "departamento": "Potosí", "lat": -19.5836, "lng": -65.7531},
            {"nombre": "Sacaba", "departamento": "Cochabamba", "lat": -17.4042, "lng": -66.0408},
            {"nombre": "Quillacollo", "departamento": "Cochabamba", "lat": -17.3972, "lng": -66.2786},
            {"nombre": "Montero", "departamento": "Santa Cruz", "lat": -17.3333, "lng": -63.2500},
            {"nombre": "Trinidad", "departamento": "Beni", "lat": -14.8333, "lng": -64.9000},
            {"nombre": "Warnes", "departamento": "Santa Cruz", "lat": -17.5167, "lng": -63.1667},
            {"nombre": "Yacuiba", "departamento": "Tarija", "lat": -22.0167, "lng": -63.6833},
            {"nombre": "Riberalta", "departamento": "Beni", "lat": -11.0000, "lng": -66.0667},
        ]

        return ciudades

    @staticmethod
    def buscar_sugerencias_ubicacion(query: str) -> List[Dict]:
        """
        Busca sugerencias de ubicación para autocompletado
        """
        cache_key = f"suggestions_{query.lower().replace(' ', '_')}"
        cached = cache.get(cache_key)

        if cached:
            return cached

        try:
            response = requests.get(
                "https://nominatim.openstreetmap.org/search",
                params={
                    'q': f"{query}, Bolivia",
                    'format': 'json',
                    'limit': 8,
                    'addressdetails': 1,
                    'countrycodes': 'bo',
                    'accept-language': 'es'
                },
                headers={
                    'User-Agent': 'HabitaApp/1.0',
                    'Referer': 'https://habita.com'
                },
                timeout=5
            )

            if response.status_code == 200:
                data = response.json()
                sugerencias = []

                for item in data:
                    address = item.get('address', {})
                    sugerencias.append({
                        'nombre': item['display_name'],
                        'latitud': float(item['lat']),
                        'longitud': float(item['lon']),
                        'ciudad': address.get('city') or address.get('town') or address.get('village'),
                        'departamento': address.get('state'),
                        'tipo': address.get('type', 'ubicación')
                    })

                cache.set(cache_key, sugerencias, 60 * 60 * 24)  # Cache por 24 horas
                return sugerencias

            return []

        except Exception as e:
            logger.error(f"Error buscando sugerencias: {str(e)}")
            return []

    @staticmethod
    def _es_destino_turistico(ciudad: str, departamento: str) -> bool:
        """
        Determina si una ubicación es destino turístico en Bolivia
        """
        destinos_turisticos = {
            # Ciudades turísticas
            'santa cruz de la sierra': True,
            'la paz': True,
            'sucre': True,
            'cochabamba': True,
            'potosí': True, 'potosi': True,
            'oruro': True,
            'tarija': True,

            # Destinos naturales y culturales
            'uyuni': True, 'salar de uyuni': True,
            'copacabana': True, 'lago titicaca': True,
            'samaipata': True, 'el fuerte de samaipata': True,
            'rurrenabaque': True, 'madidi': True,
            'coroico': True, 'los yungas': True,
            'torotoro': True,
            'tupiza': True,
            'san ignacio de velasco': True, 'misiones jesuíticas': True,
            'valle de la luna': True,
            'tiwanaku': True,

            # Departamentos completos
            'santa cruz': True,
            'la paz': True,
            'chuquisaca': True,
            'cochabamba': True,
            'potosí': True, 'potosi': True,
            'oruro': True,
            'tarija': True,
            'beni': True,
            'pando': True,
        }

        ciudad_key = ciudad.lower().strip() if ciudad else ''
        depto_key = departamento.lower().strip() if departamento else ''

        return (ciudad_key in destinos_turisticos or
                depto_key in destinos_turisticos)