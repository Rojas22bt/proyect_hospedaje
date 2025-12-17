// PropertyCard.tsx - CORREGIDO
import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Image, MapPin, Users, Bath, Bed, PawPrint } from 'lucide-react';
import { Propiedad } from '@/types/auth';
import PhotoCarousel from '@/components/admin/PhotoCarousel'
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

interface PropertyCardProps {
  propiedad: Propiedad;
  onViewDetails?: (propiedad: Propiedad) => void;
  showActions?: boolean;
}

export default function PropertyCard({ propiedad, onViewDetails, showActions = false }: PropertyCardProps) {
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);

  const { data: files = [], isLoading } = useQuery({
    queryKey: ['property-files', propiedad.id],
    queryFn: () => api.fetchFilesByPropiedad(propiedad.id),
    enabled: isCarouselOpen,
  });

  const mainImage = files.find(file => file.es_principal) || files[0];

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB'
    }).format(amount);
  };

  // 🔥 CORRECCIÓN: Usar caracteristicas en lugar de servicios_basicos
  const caracteristicas = propiedad.caracteristicas || [];

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
        <div className="relative">
          {/* Imagen principal */}
          <div
            className="aspect-video bg-muted cursor-pointer relative group"
            onClick={() => setIsCarouselOpen(true)}
          >
            {mainImage ? (
              <img
                src={mainImage.archivo_url || mainImage.archivo}
                alt={propiedad.nombre}
                className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <Image className="h-12 w-12" />
              </div>
            )}

            {/* Overlay hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-sm font-medium">
                Ver {files.length} {files.length === 1 ? 'foto' : 'fotos'}
              </div>
            </div>

            {/* Badge de imágenes */}
            {files.length > 0 && (
              <Badge className="absolute top-2 right-2 bg-primary/90 hover:bg-primary">
                {files.length} {files.length === 1 ? 'foto' : 'fotos'}
              </Badge>
            )}

            {/* Estado de disponibilidad */}
            <div className="absolute top-2 left-2">
              <Badge variant={propiedad.status ? "default" : "destructive"}>
                {propiedad.status ? "Disponible" : "No disponible"}
              </Badge>
            </div>
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2">
              {propiedad.nombre}
            </h3>

            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="truncate">{propiedad.direccion}</span>
            </div>
          </div>

          {/* Características */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Bed className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{propiedad.cant_hab}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Bath className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{propiedad.cant_bath}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{propiedad.max_huespedes}</span>
              </div>
              {propiedad.pets && (
                <div className="flex items-center space-x-1">
                  <PawPrint className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* Servicios - CORREGIDO */}
          <div className="flex flex-wrap gap-1">
            {caracteristicas.slice(0, 3).map((caracteristica) => (
              <Badge key={caracteristica} variant="secondary" className="text-xs">
                {caracteristica}
              </Badge>
            ))}
            {caracteristicas.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{caracteristicas.length - 3}
              </Badge>
            )}
          </div>

          {/* Descripción */}
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {propiedad.descripcion}
          </p>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(propiedad.precio_noche)}
            </span>
            <span className="text-sm text-muted-foreground">/noche</span>
          </div>

          {showActions && (
            <Button onClick={() => onViewDetails?.(propiedad)} size="sm">
              Ver Detalles
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Carrusel de fotos */}
      <PhotoCarousel
        files={files}
        isOpen={isCarouselOpen}
        onClose={() => setIsCarouselOpen(false)}
      />
    </>
  );
}