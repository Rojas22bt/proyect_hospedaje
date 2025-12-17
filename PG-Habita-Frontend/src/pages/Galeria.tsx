import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import  PropertyCard  from '@/components/propiedades/PropertyCard';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';

export default function MyPhotoGallery() {
  const { user } = useAuth();

  const { data: propiedades = [], isLoading } = useQuery({
    queryKey: ['my-propiedades', user?.id],
    queryFn: () => api.fetchPropiedades(),
    enabled: !!user,
  });

  const myPropiedades = propiedades.filter(propiedad =>
    propiedad.user === user?.id
  );

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Cargando tus propiedades...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Mi Galería de Fotos</CardTitle>
          <p className="text-muted-foreground">
            Gestiona y visualiza las fotos de tus propiedades
          </p>
        </CardHeader>
      </Card>

      {myPropiedades.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">
              No tienes propiedades registradas
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myPropiedades.map((propiedad) => (
            <PropertyCard
              key={propiedad.id}
              propiedad={propiedad}
              showActions={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}