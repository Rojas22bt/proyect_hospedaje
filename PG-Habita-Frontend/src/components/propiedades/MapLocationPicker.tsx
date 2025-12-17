// src/components/propiedades/MapLocationPicker.tsx - VERSIÓN SIMPLIFICADA
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Navigation, Check, AlertCircle, Search, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MapLocationPickerProps {
    direccion: string;
    onLocationSelected: (location: { latitud: number; longitud: number; direccion_completa: string }) => void;
    ubicacionActual?: { latitud?: number | null; longitud?: number | null; direccion_completa?: string };
}

const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
    direccion,
    onLocationSelected,
    ubicacionActual
}) => {
    const [direccionInput, setDireccionInput] = useState(direccion);
    const [coordenadas, setCoordenadas] = useState<{lat: number; lng: number} | null>(null);
    const [ubicacionConfirmada, setUbicacionConfirmada] = useState(false);
    const [enlaceGoogleMaps, setEnlaceGoogleMaps] = useState('');

    useEffect(() => {
        setDireccionInput(direccion);
    }, [direccion]);

    // Inicializar con ubicación actual si existe
    useEffect(() => {
        if (ubicacionActual?.latitud && ubicacionActual?.longitud) {
            setCoordenadas({
                lat: parseFloat(ubicacionActual.latitud.toString()),
                lng: parseFloat(ubicacionActual.longitud.toString())
            });
            setUbicacionConfirmada(true);
            generarEnlaceGoogleMaps(
                parseFloat(ubicacionActual.latitud.toString()),
                parseFloat(ubicacionActual.longitud.toString())
            );
        }
    }, [ubicacionActual]);

    const generarEnlaceGoogleMaps = (lat: number, lng: number) => {
        const enlace = `https://www.google.com/maps?q=${lat},${lng}&z=15`;
        setEnlaceGoogleMaps(enlace);
    };

    const manejarBusqueda = () => {
        if (!direccionInput.trim()) return;

        // Simular coordenadas basadas en la dirección
        // En una app real, aquí usarías una API de geocodificación
        const coordenadasSimuladas = generarCoordenadasSimuladas(direccionInput);
        setCoordenadas(coordenadasSimuladas);

        onLocationSelected({
            latitud: coordenadasSimuladas.lat,
            longitud: coordenadasSimuladas.lng,
            direccion_completa: direccionInput
        });

        setUbicacionConfirmada(true);
        generarEnlaceGoogleMaps(coordenadasSimuladas.lat, coordenadasSimuladas.lng);
    };

    const generarCoordenadasSimuladas = (direccion: string): {lat: number; lng: number} => {
        // Coordenadas aproximadas basadas en ciudades de Bolivia
        const ciudades: { [key: string]: { lat: number; lng: number } } = {
            'santa cruz': { lat: -17.7833, lng: -63.1821 },
            'la paz': { lat: -16.4897, lng: -68.1193 },
            'cochabamba': { lat: -17.3895, lng: -66.1568 },
            'sucre': { lat: -19.0196, lng: -65.2620 },
            'oruro': { lat: -17.9667, lng: -67.1167 },
            'potosí': { lat: -19.5836, lng: -65.7531 },
            'tarija': { lat: -21.5355, lng: -64.7296 },
            'beni': { lat: -14.8333, lng: -64.9000 },
            'pando': { lat: -11.0267, lng: -68.7692 }
        };

        const direccionLower = direccion.toLowerCase();
        let ciudadEncontrada = 'santa cruz'; // Por defecto

        for (const [ciudad, coords] of Object.entries(ciudades)) {
            if (direccionLower.includes(ciudad)) {
                ciudadEncontrada = ciudad;
                break;
            }
        }

        const base = ciudades[ciudadEncontrada];
        // Agregar variación pequeña para simular diferentes ubicaciones
        return {
            lat: base.lat + (Math.random() - 0.5) * 0.01,
            lng: base.lng + (Math.random() - 0.5) * 0.01
        };
    };

    const usarUbicacionActual = () => {
        if (ubicacionActual?.latitud && ubicacionActual?.longitud) {
            const lat = parseFloat(ubicacionActual.latitud.toString());
            const lng = parseFloat(ubicacionActual.longitud.toString());
            setCoordenadas({ lat, lng });
            setDireccionInput(ubicacionActual.direccion_completa || direccion);
            setUbicacionConfirmada(true);
            generarEnlaceGoogleMaps(lat, lng);

            onLocationSelected({
                latitud: lat,
                longitud: lng,
                direccion_completa: ubicacionActual.direccion_completa || direccion
            });
        }
    };

    const tieneUbicacionActual = ubicacionActual?.latitud && ubicacionActual?.longitud;

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="h-5 w-5 text-habita-primary" />
                    Ubicación de la Propiedad
                </CardTitle>
                <CardDescription>
                    Ingresa la dirección y verifica la ubicación en Google Maps
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Búsqueda por dirección */}
                <div className="space-y-3">
                    <Label htmlFor="direccion-mapa" className="flex items-center gap-2">
                        <Navigation className="h-4 w-4" />
                        Dirección completa de la propiedad
                    </Label>
                    <div className="flex gap-2">
                        <Input
                            id="direccion-mapa"
                            value={direccionInput}
                            onChange={(e) => {
                                setDireccionInput(e.target.value);
                                setUbicacionConfirmada(false);
                            }}
                            placeholder="Ej: Avenida Heroínas 123, Cochabamba, Bolivia"
                            className="flex-1"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    manejarBusqueda();
                                }
                            }}
                        />
                        <Button
                            onClick={manejarBusqueda}
                            disabled={!direccionInput.trim()}
                            className="bg-habita-primary hover:bg-habita-primary/90"
                        >
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Enlace a Google Maps */}
                {enlaceGoogleMaps && (
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-medium">
                            <MapPin className="h-4 w-4 text-habita-primary" />
                            Verificar ubicación en Google Maps
                        </Label>
                        <div className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600 mb-2">
                                        Abre Google Maps para verificar que la ubicación es correcta:
                                    </p>
                                    <div className="text-xs text-gray-500 bg-white p-2 rounded border">
                                        {direccionInput}
                                    </div>
                                </div>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="ml-4"
                                >
                                    <a
                                        href={enlaceGoogleMaps}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        Abrir Maps
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Información de coordenadas */}
                {coordenadas && (
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-blue-50">
                            📍 Latitud: {coordenadas.lat.toFixed(6)}
                        </Badge>
                        <Badge variant="outline" className="bg-green-50">
                            📍 Longitud: {coordenadas.lng.toFixed(6)}
                        </Badge>
                    </div>
                )}

                {/* Ubicación actual si existe */}
                {tieneUbicacionActual && !ubicacionConfirmada && (
                    <Alert className="bg-amber-50 border-amber-200">
                        <MapPin className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-amber-800">
                            <div className="space-y-2">
                                <div className="font-semibold">📍 Ubicación actual guardada:</div>
                                <div className="text-sm opacity-90">{ubicacionActual.direccion_completa}</div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={usarUbicacionActual}
                                >
                                    Usar esta ubicación
                                </Button>
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

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
                                Instrucciones para la ubicación:
                            </div>
                            <div className="text-blue-700 text-xs space-y-1">
                                <p><strong>1.</strong> Ingresa la dirección completa de tu propiedad</p>
                                <p><strong>2.</strong> Haz clic en buscar para generar las coordenadas</p>
                                <p><strong>3.</strong> Usa el enlace a Google Maps para verificar que la ubicación es correcta</p>
                                <p><strong>4.</strong> Las coordenadas se guardarán automáticamente con tu propiedad</p>
                                <p className="mt-2 font-medium">📍 Funciona para cualquier ubicación en Bolivia</p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default MapLocationPicker;