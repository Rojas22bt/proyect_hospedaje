// src/components/maps/InteractivePropertyMap.tsx
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Navigation, Check, Search, Crosshair } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para iconos de Leaflet - IMPORTANTE para react-leaflet v4
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Crear icono personalizado
const createCustomIcon = (color: string = 'red') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 25px;
        height: 25px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        position: relative;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      ">
        <div style="
          position: absolute;
          width: 6px;
          height: 6px;
          background: white;
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        "></div>
      </div>
    `,
    iconSize: [25, 25],
    iconAnchor: [12, 25],
  });
};

interface InteractivePropertyMapProps {
  onLocationSelected: (location: {
    latitud: number;
    longitud: number;
    direccion_completa: string;
    ciudad?: string;
    provincia?: string;
    departamento?: string;
    pais?: string;
  }) => void;
  ubicacionActual?: {
    latitud?: number | null;
    longitud?: number | null;
    direccion_completa?: string;
  };
  direccion?: string;
}

// Componente para manejar clicks en el mapa
function LocationMarker({
  onLocationSelect,
  onLocationFound
}: {
  onLocationSelect: (lat: number, lng: number) => void;
  onLocationFound: (location: any) => void;
}) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      const newPosition: [number, number] = [lat, lng];
      setPosition(newPosition);
      onLocationSelect(lat, lng);

      // Reverse geocoding al hacer click
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=es`
        );
        const data = await response.json();

        if (data) {
          onLocationFound({
            latitud: lat,
            longitud: lng,
            direccion_completa: data.display_name,
            ciudad: data.address?.city || data.address?.town || data.address?.village,
            provincia: data.address?.state || data.address?.county,
            departamento: data.address?.state,
            pais: data.address?.country || 'Bolivia'
          });
        }
      } catch (error) {
        console.error('Error en reverse geocoding:', error);
      }
    },
  });

  return position === null ? null : (
    <Marker
      position={position}
      icon={createCustomIcon('#dc2626')}
    />
  );
}

const InteractivePropertyMap: React.FC<InteractivePropertyMapProps> = ({
  onLocationSelected,
  ubicacionActual,
  direccion = ''
}) => {
  const [coordenadas, setCoordenadas] = useState<[number, number]>([-16.5000, -64.3333]); // Centro de Bolivia
  const [busqueda, setBusqueda] = useState(direccion);
  const [ubicacionConfirmada, setUbicacionConfirmada] = useState(false);
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState<any>(null);
  const mapRef = useRef<L.Map>(null);

  // Inicializar con ubicación actual si existe
  useEffect(() => {
    if (ubicacionActual?.latitud && ubicacionActual?.longitud) {
      const lat = parseFloat(ubicacionActual.latitud.toString());
      const lng = parseFloat(ubicacionActual.longitud.toString());
      setCoordenadas([lat, lng]);
      setUbicacionConfirmada(true);

      // Establecer ubicación seleccionada
      setUbicacionSeleccionada({
        latitud: lat,
        longitud: lng,
        direccion_completa: ubicacionActual.direccion_completa || 'Ubicación actual'
      });
    }
  }, [ubicacionActual]);

  // Buscar ubicación por dirección
  const buscarUbicacion = async () => {
    if (!busqueda.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(busqueda + ', Bolivia')}&limit=1&addressdetails=1&accept-language=es`
      );

      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);

        setCoordenadas([lat, lng]);

        // Mover el mapa a la nueva ubicación
        if (mapRef.current) {
          mapRef.current.setView([lat, lng], 15);
        }

        const locationData = {
          latitud: lat,
          longitud: lng,
          direccion_completa: result.display_name,
          ciudad: result.address?.city || result.address?.town || result.address?.village,
          provincia: result.address?.state || result.address?.county,
          departamento: result.address?.state,
          pais: result.address?.country || 'Bolivia'
        };

        setUbicacionSeleccionada(locationData);
        onLocationSelected(locationData);
        setUbicacionConfirmada(true);
      } else {
        alert('No se encontró la ubicación. Intenta con una dirección más específica.');
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
      alert('Error al buscar la ubicación. Verifica tu conexión a internet.');
    }
  };

  // Usar ubicación actual del dispositivo
  const usarUbicacionActual = () => {
    if (!navigator.geolocation) {
      alert('La geolocalización no es soportada por tu navegador');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setCoordenadas([lat, lng]);

        if (mapRef.current) {
          mapRef.current.setView([lat, lng], 15);
        }

        // Reverse geocoding
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=es`
          );
          const data = await response.json();

          if (data) {
            const locationData = {
              latitud: lat,
              longitud: lng,
              direccion_completa: data.display_name,
              ciudad: data.address?.city || data.address?.town || data.address?.village,
              provincia: data.address?.state || data.address?.county,
              departamento: data.address?.state,
              pais: data.address?.country || 'Bolivia'
            };

            setUbicacionSeleccionada(locationData);
            onLocationSelected(locationData);
            setUbicacionConfirmada(true);
            setBusqueda(data.display_name);
          }
        } catch (error) {
          console.error('Error en reverse geocoding:', error);
        }
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
        alert('No se pudo obtener tu ubicación actual. Asegúrate de tener los permisos de ubicación activados.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const manejarClickMapa = (lat: number, lng: number) => {
    setCoordenadas([lat, lng]);
    setUbicacionConfirmada(true);
  };

  const manejarUbicacionEncontrada = (location: any) => {
    setUbicacionSeleccionada(location);
    onLocationSelected(location);
    setUbicacionConfirmada(true);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5 text-habita-primary" />
          Selecciona la Ubicación Exacta
        </CardTitle>
        <CardDescription>
          Haz clic en el mapa para marcar la ubicación exacta de tu propiedad
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Búsqueda y controles */}
        <div className="space-y-3">
          <Label htmlFor="busqueda-mapa" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Buscar ubicación
          </Label>
          <div className="flex gap-2">
            <Input
              id="busqueda-mapa"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Ej: Avenida Heroínas 123, Cochabamba, Bolivia"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  buscarUbicacion();
                }
              }}
            />
            <Button
              onClick={buscarUbicacion}
              disabled={!busqueda.trim()}
              variant="outline"
              className="border-habita-primary text-habita-primary hover:bg-habita-primary hover:text-white"
            >
              <Navigation className="h-4 w-4" />
            </Button>
            <Button
              onClick={usarUbicacionActual}
              variant="outline"
              title="Usar mi ubicación actual"
            >
              <Crosshair className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mapa */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <MapPin className="h-4 w-4 text-habita-primary" />
            Haz clic en el mapa para colocar el marcador
          </Label>

          <div className="border-2 border-gray-300 rounded-lg overflow-hidden" style={{ height: '400px' }}>
            <MapContainer
              center={coordenadas}
              zoom={6}
              style={{ height: '100%', width: '100%' }}
              ref={mapRef}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              <LocationMarker
                onLocationSelect={manejarClickMapa}
                onLocationFound={manejarUbicacionEncontrada}
              />
            </MapContainer>
          </div>
        </div>

        {/* Información de la ubicación seleccionada */}
        {ubicacionSeleccionada && (
          <div className="space-y-3 p-4 border rounded-lg bg-blue-50">
            <h4 className="font-semibold text-blue-900 flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              Ubicación Seleccionada
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-800">Coordenadas:</span>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <Badge variant="outline" className="bg-white">
                    📍 Lat: {ubicacionSeleccionada.latitud.toFixed(6)}
                  </Badge>
                  <Badge variant="outline" className="bg-white">
                    📍 Lng: {ubicacionSeleccionada.longitud.toFixed(6)}
                  </Badge>
                </div>
              </div>

              <div>
                <span className="font-medium text-blue-800">Dirección:</span>
                <p className="text-blue-700 mt-1 text-xs">{ubicacionSeleccionada.direccion_completa}</p>
              </div>
            </div>

            {(ubicacionSeleccionada.ciudad || ubicacionSeleccionada.departamento) && (
              <div className="flex flex-wrap gap-2">
                {ubicacionSeleccionada.ciudad && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    🏙️ {ubicacionSeleccionada.ciudad}
                  </Badge>
                )}
                {ubicacionSeleccionada.departamento && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    🗺️ {ubicacionSeleccionada.departamento}
                  </Badge>
                )}
                {ubicacionSeleccionada.pais && (
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    🇧🇴 {ubicacionSeleccionada.pais}
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}

        {/* Estado de confirmación */}
        {ubicacionConfirmada && (
          <Alert className="bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 font-medium">
              ✅ Ubicación confirmada - Las coordenadas se guardarán con tu propiedad
            </AlertDescription>
          </Alert>
        )}

        {/* Instrucciones */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="space-y-2">
            <div className="font-semibold text-blue-900 text-sm">
              💡 Cómo usar el mapa:
            </div>
            <div className="text-blue-700 text-xs space-y-1">
              <p><strong>1.</strong> Usa la barra de búsqueda para encontrar una zona específica</p>
              <p><strong>2.</strong> Haz clic en el botón de ubicación (🎯) para usar tu posición actual</p>
              <p><strong>3.</strong> Haz clic exactamente donde está tu propiedad en el mapa</p>
              <p><strong>4.</strong> Verifica que la dirección mostrada sea correcta</p>
              <p><strong>5.</strong> Las coordenadas se guardarán automáticamente</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractivePropertyMap;