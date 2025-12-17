// src/components/maps/GoogleMapsProperties.tsx
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Propiedad } from '@/types/auth';
import { MapPin, Home, Building2, Trees, ExternalLink, Navigation, Bed, Bath, Dog, Users, ArrowRight, X } from 'lucide-react';

interface GoogleMapsPropertiesProps {
    propiedades: Propiedad[];
    onPropertyClick?: (propiedad: Propiedad) => void;
}

const GoogleMapsProperties: React.FC<GoogleMapsPropertiesProps> = ({ propiedades, onPropertyClick }) => {
    const [selectedCity, setSelectedCity] = useState('Santa Cruz');
    const [selectedProperty, setSelectedProperty] = useState<Propiedad | null>(null);

    // Ciudades principales de Bolivia con coordenadas
    const ciudadesBolivia = {
        'Santa Cruz': { lat: -17.7833, lng: -63.1821, zoom: 12 },
        'La Paz': { lat: -16.4897, lng: -68.1193, zoom: 13 },
        'Cochabamba': { lat: -17.3895, lng: -66.1568, zoom: 13 },
        'Sucre': { lat: -19.0196, lng: -65.2620, zoom: 14 },
        'Oruro': { lat: -17.9667, lng: -67.1167, zoom: 14 },
        'Potosí': { lat: -19.5836, lng: -65.7531, zoom: 14 },
        'Tarija': { lat: -21.5355, lng: -64.7296, zoom: 14 },
        'Trinidad': { lat: -14.8333, lng: -64.9000, zoom: 12 },
        'Cobija': { lat: -11.0267, lng: -68.7692, zoom: 12 }
    };

    // Propiedades con coordenadas válidas
    const propiedadesConCoordenadas = propiedades.filter(prop =>
        prop.latitud && prop.longitud && prop.latitud !== 0 && prop.longitud !== 0
    );

    const propiedadesFiltradas = propiedadesConCoordenadas.filter(prop =>
        prop.ciudad?.toLowerCase().includes(selectedCity.toLowerCase()) ||
        prop.departamento?.toLowerCase().includes(selectedCity.toLowerCase()) ||
        selectedCity === 'Todas'
    );

    const generateGoogleMapsLink = (propiedad: Propiedad) => {
        if (propiedad.latitud && propiedad.longitud) {
            return `https://www.google.com/maps?q=${propiedad.latitud},${propiedad.longitud}&z=15`;
        }

        // Si no tiene coordenadas, buscar por dirección
        const direccion = encodeURIComponent(
            `${propiedad.direccion_completa || propiedad.nombre}, ${propiedad.ciudad || 'Bolivia'}`
        );
        return `https://www.google.com/maps/search/?api=1&query=${direccion}`;
    };

    const generateCityMapsLink = (city: string) => {
        const ciudad = encodeURIComponent(`${city}, Bolivia`);
        return `https://www.google.com/maps/place/${ciudad}`;
    };

    const getPropertyIcon = (tipo: string) => {
        switch (tipo) {
            case 'Casa': return <Home className="h-4 w-4 text-green-500" />;
            case 'Departamento': return <Building2 className="h-4 w-4 text-blue-500" />;
            case 'Cabaña': return <Trees className="h-4 w-4 text-amber-500" />;
            default: return <MapPin className="h-4 w-4 text-gray-500" />;
        }
    };

    const getPropertyColor = (tipo: string) => {
        switch (tipo) {
            case 'Casa': return 'bg-green-100 text-green-800 border-green-200';
            case 'Departamento': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Cabaña': return 'bg-amber-100 text-amber-800 border-amber-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="w-full space-y-6">
            <Card className="w-full overflow-hidden border-2 border-gray-200 shadow-lg">
                <CardContent className="p-0">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-habita-primary to-red-600 text-white p-4">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div>
                                <h3 className="font-bold text-lg">🗺️ Mapa de Propiedades</h3>
                                <p className="text-white/80 text-sm">
                                    Explora propiedades en diferentes ciudades de Bolivia
                                </p>
                            </div>

                            {/* Selector de ciudades */}
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant={selectedCity === 'Todas' ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedCity('Todas')}
                                    className={`
                                        text-xs h-8
                                        ${selectedCity === 'Todas'
                                            ? 'bg-white text-habita-primary hover:bg-white/90'
                                            : 'bg-white/20 text-white hover:bg-white/30 border-white/50'
                                        }
                                    `}
                                >
                                    Todas
                                </Button>
                                {Object.keys(ciudadesBolivia).map(ciudad => (
                                    <Button
                                        key={ciudad}
                                        variant={selectedCity === ciudad ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSelectedCity(ciudad)}
                                        className={`
                                            text-xs h-8
                                            ${selectedCity === ciudad
                                                ? 'bg-white text-habita-primary hover:bg-white/90'
                                                : 'bg-white/20 text-white hover:bg-white/30 border-white/50'
                                            }
                                        `}
                                    >
                                        {ciudad}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Contenido principal */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            {/* Panel de información */}
                            <div className="xl:col-span-1 space-y-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center gap-3">
                                        <Navigation className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <h4 className="font-semibold text-blue-900 text-sm">
                                                Propiedades en {selectedCity}
                                            </h4>
                                            <p className="text-blue-700 text-xs">
                                                {propiedadesFiltradas.length} de {propiedadesConCoordenadas.length} propiedades con ubicación
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Estadísticas rápidas */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white border rounded-lg p-3 text-center">
                                        <div className="text-lg font-bold text-habita-primary">
                                            {propiedadesFiltradas.length}
                                        </div>
                                        <div className="text-xs text-gray-600">Propiedades</div>
                                    </div>
                                    <div className="bg-white border rounded-lg p-3 text-center">
                                        <div className="text-lg font-bold text-green-500">
                                            {propiedadesFiltradas.filter(p => p.tipo === 'Casa').length}
                                        </div>
                                        <div className="text-xs text-gray-600">Casas</div>
                                    </div>
                                    <div className="bg-white border rounded-lg p-3 text-center">
                                        <div className="text-lg font-bold text-blue-500">
                                            {propiedadesFiltradas.filter(p => p.tipo === 'Departamento').length}
                                        </div>
                                        <div className="text-xs text-gray-600">Deptos.</div>
                                    </div>
                                    <div className="bg-white border rounded-lg p-3 text-center">
                                        <div className="text-lg font-bold text-amber-500">
                                            {propiedadesFiltradas.filter(p => p.tipo === 'Cabaña').length}
                                        </div>
                                        <div className="text-xs text-gray-600">Cabañas</div>
                                    </div>
                                </div>

                                {/* Lista de propiedades */}
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {propiedadesFiltradas.length > 0 ? (
                                        propiedadesFiltradas.map(propiedad => (
                                            <Card
                                                key={propiedad.id}
                                                className="border hover:border-habita-primary transition-all duration-200 cursor-pointer hover:shadow-md"
                                                onClick={() => {
                                                    setSelectedProperty(propiedad);
                                                    onPropertyClick?.(propiedad);
                                                }}
                                            >
                                                <CardContent className="p-3">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                {getPropertyIcon(propiedad.tipo)}
                                                                <h4 className="font-semibold text-gray-900 text-sm truncate">
                                                                    {propiedad.nombre}
                                                                </h4>
                                                            </div>

                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-3 text-xs text-gray-600">
                                                                    <div className="flex items-center gap-1">
                                                                        <Bed className="h-3 w-3" />
                                                                        <span>{propiedad.cant_hab}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <Bath className="h-3 w-3" />
                                                                        <span>{propiedad.cant_bath}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <Users className="h-3 w-3" />
                                                                        <span>{propiedad.max_huespedes}</span>
                                                                    </div>
                                                                </div>

                                                                <div className="text-sm font-bold text-habita-primary">
                                                                    Bs {propiedad.precio_noche.toLocaleString()}/noche
                                                                </div>

                                                                {propiedad.ciudad && (
                                                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                                                        <MapPin className="h-3 w-3" />
                                                                        <span className="truncate">
                                                                            {propiedad.ciudad}
                                                                            {propiedad.departamento && `, ${propiedad.departamento}`}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col gap-1 ml-2">
                                                            <Badge className={`text-xs ${getPropertyColor(propiedad.tipo)}`}>
                                                                {propiedad.tipo}
                                                            </Badge>
                                                            <Button
                                                                asChild
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-6 w-6 p-0"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    window.open(generateGoogleMapsLink(propiedad), '_blank');
                                                                }}
                                                            >
                                                                <a
                                                                    href={generateGoogleMapsLink(propiedad)}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    title="Ver en Google Maps"
                                                                >
                                                                    <ExternalLink className="h-3 w-3" />
                                                                </a>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <MapPin className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                            <p className="text-sm">No hay propiedades en {selectedCity}</p>
                                            <p className="text-xs text-gray-400">Selecciona otra ciudad o "Todas"</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Mapa y detalles */}
                            <div className="xl:col-span-2 space-y-6">
                                {/* Enlace a Google Maps de la ciudad */}
                                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <MapPin className="h-6 w-6 text-green-600" />
                                            <div>
                                                <h4 className="font-semibold text-gray-900">
                                                    Ver {selectedCity} en Google Maps
                                                </h4>
                                                <p className="text-gray-600 text-sm">
                                                    Explora la ciudad y sus alrededores
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            asChild
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <a
                                                href={generateCityMapsLink(selectedCity)}
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

                                {/* Propiedad seleccionada o placeholder del mapa */}
                                {selectedProperty ? (
                                    <Card className="border-2 border-habita-primary/20 shadow-lg">
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    {getPropertyIcon(selectedProperty.tipo)}
                                                    <div>
                                                        <h3 className="font-bold text-xl text-gray-900">
                                                            {selectedProperty.nombre}
                                                        </h3>
                                                        <p className="text-gray-600 text-sm">
                                                            {selectedProperty.tipo} • {selectedProperty.ciudad || 'Bolivia'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        asChild
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <a
                                                            href={generateGoogleMapsLink(selectedProperty)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2"
                                                        >
                                                            <ExternalLink className="h-4 w-4" />
                                                            Maps
                                                        </a>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setSelectedProperty(null)}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 mb-2">Descripción</h4>
                                                        <p className="text-gray-700 text-sm leading-relaxed">
                                                            {selectedProperty.descripcion}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 mb-2">Características</h4>
                                                        <div className="flex flex-wrap gap-1">
                                                            {selectedProperty.caracteristicas?.slice(0, 6).map((caracteristica, idx) => (
                                                                <Badge key={idx} variant="secondary" className="text-xs">
                                                                    {caracteristica}
                                                                </Badge>
                                                            ))}
                                                            {selectedProperty.caracteristicas && selectedProperty.caracteristicas.length > 6 && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    +{selectedProperty.caracteristicas.length - 6} más
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="bg-gray-50 rounded-lg p-4">
                                                        <h4 className="font-semibold text-gray-900 mb-3">Detalles</h4>
                                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <Bed className="h-4 w-4 text-gray-500" />
                                                                <span>{selectedProperty.cant_hab} hab.</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Bath className="h-4 w-4 text-gray-500" />
                                                                <span>{selectedProperty.cant_bath} baños</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Users className="h-4 w-4 text-gray-500" />
                                                                <span>{selectedProperty.max_huespedes} huesp.</span>
                                                            </div>
                                                            {selectedProperty.pets && (
                                                                <div className="flex items-center gap-2">
                                                                    <Dog className="h-4 w-4 text-gray-500" />
                                                                    <span>Mascotas</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <Button
                                                        className="w-full bg-habita-primary hover:bg-habita-primary/90"
                                                        onClick={() => onPropertyClick?.(selectedProperty)}
                                                    >
                                                        Ver detalles completos
                                                        <ArrowRight className="h-4 w-4 ml-2" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    /* Placeholder del mapa cuando no hay propiedad seleccionada */
                                    <div className="bg-gradient-to-br from-blue-50 to-green-50 border-2 border-dashed border-gray-300 rounded-lg h-64 flex items-center justify-center">
                                        <div className="text-center">
                                            <MapPin className="h-12 w-12 text-habita-primary mx-auto mb-3" />
                                            <h4 className="font-semibold text-gray-900 mb-1">
                                                {selectedCity}, Bolivia
                                            </h4>
                                            <p className="text-gray-600 text-sm mb-3">
                                                Selecciona una propiedad para ver detalles
                                            </p>
                                            <Button
                                                asChild
                                                variant="outline"
                                            >
                                                <a
                                                    href={generateCityMapsLink(selectedCity)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                    Explorar {selectedCity} en Maps
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default GoogleMapsProperties;