// components/maps/MapWithPin.tsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Navigation, Check, AlertCircle, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import 'leaflet/dist/leaflet.css';

// Fix para los iconos de Leaflet en React
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.divIcon({
  html: `
    <div style="
      background-color: #dc2626;
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

L.Marker.prototype.options.icon = DefaultIcon;

interface MapWithPinProps {
  onLocationSelected: (location: {
    latitud: number;
    longitud: number;
    direccion_completa: string;
    ciudad?: string;
    departamento?: string;
    pais?: string;
  }) => void;
  ubicacionActual?: {
    latitud?: number | null;
    longitud?: number | null;
    direccion_completa?: string;
  };
}

// Componente para detectar clicks en el mapa
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });
  return null;
}

const MapWithPin: React.FC<MapWithPinProps> = ({ onLocationSelected, ubicacionActual }) => {
  // Coordenadas por defecto (centro de Bolivia)
  const [coordenadas, setCoordenadas] = useState<[number, number]>([-16.5000, -64.3333]);
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);
  const [ubicacionConfirmada, setUbicacionConfirmada] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  // Inicializar con ubicación actual si existe
  useEffect(() => {
    if (ubicacionActual?.latitud && ubicacionActual?.longitud) {
      const lat = parseFloat(ubicacionActual.latitud.toString());
      const lng = parseFloat(ubicacionActual.longitud.toString());
      setCoordenadas([lat, lng]);
      setMarkerPosition([lat, lng]);
      setUbicacionConfirmada(true);
    }
  }, [ubicacionActual]);

  const manejarClickMapa = (lat: number, lng: number) => {
    setCoordenadas([lat, lng]);
    setMarkerPosition([lat, lng]);

    // Generar dirección aproximada
    const direccionAproximada = `Ubicación seleccionada (${lat.toFixed(6)}, ${lng.toFixed(6)})`;

    onLocationSelected({
      latitud: lat,
      longitud: lng,
      direccion_completa: direccionAproximada
    });

    setUbicacionConfirmada(true);
  };

  const buscarUbicacion = async () => {
    if (!busqueda.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(busqueda + ', Bolivia')}&limit=1`
      );

      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);

        setCoordenadas([lat, lng]);
        setMarkerPosition([lat, lng]);

        onLocationSelected({
          latitud: lat,
          longitud: lng,
          direccion_completa: result.display_name,
          ciudad: result.address?.city || result.address?.town,
          departamento: result.address?.state,
          pais: result.address?.country
        });

        setUbicacionConfirmada(true);
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
    }
  };

  const usarUbicacionActual = () => {
    if (ubicacionActual?.latitud && ubicacionActual?.longitud) {
      const lat = parseFloat(ubicacionActual.latitud.toString());
      const lng = parseFloat(ubicacionActual.longitud.toString());
      setCoordenadas([lat, lng]);
      setMarkerPosition([lat, lng]);
      setUbicacionConfirmada(true);

      onLocationSelected({
        latitud: lat,
        longitud: lng,
        direccion_completa: ubicacionActual.direccion_completa || 'Ubicación actual'
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5 text-habita-primary" />
          Selecciona la Ubicación en el Mapa
        </CardTitle>
        <CardDescription>
          Haz clic en el mapa para colocar el pin exacto de tu propiedad
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Búsqueda por dirección */}
        <div className="space-y-3">
          <Label htmlFor="busqueda-mapa" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Buscar ubicación (opcional)
          </Label>
          <div className="flex gap-2">
            <Input
              id="busqueda-mapa"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Ej: Cochabamba, La Paz, Santa Cruz..."
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
          </div>
        </div>

        {/* Mapa Leaflet */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <MapPin className="h-4 w-4 text-habita-primary" />
            Haz clic en el mapa para colocar el pin
          </Label>

          <div className="border-2 border-gray-300 rounded-lg overflow-hidden" style={{ height: '400px' }}>
            <MapContainer
              center={coordenadas}
              zoom={6}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              <MapClickHandler onLocationSelect={manejarClickMapa} />

              {markerPosition && (
                <Marker position={markerPosition} />
              )}
            </MapContainer>
          </div>

          {/* Información de coordenadas */}
          {markerPosition && (
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="outline" className="bg-blue-50">
                📍 Lat: {markerPosition[0].toFixed(6)}
              </Badge>
              <Badge variant="outline" className="bg-green-50">
                📍 Lng: {markerPosition[1].toFixed(6)}
              </Badge>
            </div>
          )}
        </div>

        {/* Estado de confirmación */}
        {ubicacionConfirmada && (
          <Alert className="bg-green-50 border-green-200 animate-fade-in">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 font-medium">
              ✅ Ubicación confirmada - Las coordenadas se guardarán con tu propiedad
            </AlertDescription>
          </Alert>
        )}

        {/* Información importante */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <div className="font-semibold text-blue-900 text-sm">
                Instrucciones:
              </div>
              <div className="text-blue-700 text-xs">
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Haz clic</strong> en cualquier parte del mapa para colocar el pin</li>
                  <li><strong>Busca</strong> una ciudad o zona específica usando la barra de búsqueda</li>
                  <li><strong>Arrastra</strong> el mapa para navegar a diferentes áreas</li>
                  <li><strong>Zoom</strong> para mayor precisión en la ubicación</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MapWithPin;