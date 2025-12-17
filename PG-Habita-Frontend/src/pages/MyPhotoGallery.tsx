// src/pages/MyPhotoGallery.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Camera, MapPin, Building2, DollarSign, Users, Bed, Bath, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

// Componente separado para el carrusel
import MyPhotoCarousel from './MyPhotoCarousel';

export default function MyPhotoGallery() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedPropiedad, setSelectedPropiedad] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  const { data: propiedades = [], isLoading } = useQuery({
    queryKey: ['my-propiedades', user?.id],
    queryFn: () => api.fetchPropiedades(),
    enabled: !!user,
  });

  // Mutación para eliminar foto
  const deleteFileMutation = useMutation({
    mutationFn: (id: number) => api.deleteFile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propiedad-files'] });
      queryClient.invalidateQueries({ queryKey: ['propiedad-files-preview'] });
      toast({
        title: "✅ Foto eliminada",
        description: "La foto ha sido eliminada exitosamente",
      });
      setIsDeleteDialogOpen(false);
      setFileToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "❌ Error al eliminar",
        description: error.message || "No se pudo eliminar la foto",
        variant: "destructive",
      });
    },
  });

  const myPropiedades = propiedades.filter(propiedad =>
    propiedad.user === user?.id
  );

  const openPhotoCarousel = (propiedad) => {
    setSelectedPropiedad(propiedad);
  };

  const closeCarousel = () => {
    setSelectedPropiedad(null);
  };

  // Confirmar eliminación de foto
  const confirmDeleteFile = (file) => {
    setFileToDelete({ file, propiedad: selectedPropiedad });
    setIsDeleteDialogOpen(true);
  };

  // Función para descargar archivo
  const handleDownloadFile = (file) => {
    const link = document.createElement('a');
    link.href = file.archivo_url || file.archivo;
    link.download = file.nombre_archivo || 'foto';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
            <SimplePropertyCard
              key={propiedad.id}
              propiedad={propiedad}
              onViewPhotos={() => openPhotoCarousel(propiedad)}
            />
          ))}
        </div>
      )}

      {/* Carrusel separado en componente independiente */}
      <MyPhotoCarousel
        propiedad={selectedPropiedad}
        onClose={closeCarousel}
        onDeleteFile={confirmDeleteFile}
        onDownloadFile={handleDownloadFile}
      />

      {/* Diálogo de confirmación para eliminar foto */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 text-destructive">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <DialogTitle>Eliminar Foto</DialogTitle>
            </div>
            <DialogDescription className="pt-4">
              ¿Estás seguro de que deseas eliminar esta foto de tu propiedad
              <strong className="text-foreground"> "{fileToDelete?.propiedad?.nombre}"</strong>?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => fileToDelete && deleteFileMutation.mutate(fileToDelete.file.id)}
              disabled={deleteFileMutation.isPending}
              className="flex-1"
            >
              {deleteFileMutation.isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Eliminando...
                </>
              ) : (
                <>
                  Eliminar Foto
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente de tarjeta simple para propietarios
function SimplePropertyCard({ propiedad, onViewPhotos }) {
  const { data: files = [] } = useQuery({
    queryKey: ['propiedad-files-preview', propiedad.id],
    queryFn: () => api.fetchFilesByPropiedad(propiedad.id),
  });

  const mainImage = files.find(file => file.es_principal) || files[0];
  const hasPhotos = files.length > 0;

  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        {/* Imagen principal */}
        <div
          className="relative aspect-video bg-muted cursor-pointer"
          onClick={onViewPhotos}
        >
          {mainImage ? (
            <img
              src={mainImage.archivo_url || mainImage.archivo}
              alt={propiedad.nombre}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Camera className="h-12 w-12" />
            </div>
          )}

          {/* Badge de cantidad de fotos */}
          {hasPhotos && (
            <Badge className="absolute top-2 right-2 bg-black/70 text-white">
              <Camera className="h-3 w-3 mr-1" />
              {files.length}
            </Badge>
          )}
        </div>

        {/* Información de la propiedad */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg mb-1">{propiedad.nombre}</h3>
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <MapPin className="h-3 w-3 mr-1" />
              <span className="truncate">{propiedad.direccion}</span>
            </div>
          </div>

          {/* Características */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="capitalize">{propiedad.tipo}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>Bs {propiedad.precio_noche}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{propiedad.max_huespedes}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4 text-muted-foreground" />
              <span>{propiedad.cant_hab} hab.</span>
            </div>
          </div>

          {/* Botón para ver fotos */}
          <Button
            variant={hasPhotos ? "default" : "outline"}
            size="sm"
            onClick={onViewPhotos}
            className="w-full"
            disabled={!hasPhotos}
          >
            <Eye className="h-4 w-4 mr-2" />
            {hasPhotos ? `Gestionar ${files.length} Foto${files.length !== 1 ? 's' : ''}` : 'Sin Fotos'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}