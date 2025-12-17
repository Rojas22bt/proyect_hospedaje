import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Filter,
  Trash2,
  Eye,
  Image as ImageIcon,
  Building2,
  User,
  MapPin,
  DollarSign,
  Users,
  Bed,
  Bath,
  Dog,
  CheckCircle,
  XCircle,
  MoreVertical,
  Download
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Propiedad, File } from '@/types/auth';
import api from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { PhotoCarousel } from '@/components/propiedades/PhotoCarousel';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

export function AdminPhotoGallery() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPropiedad, setSelectedPropiedad] = useState<Propiedad | null>(null);
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [propiedadToDelete, setPropiedadToDelete] = useState<Propiedad | null>(null);
  const [fileToDelete, setFileToDelete] = useState<File | null>(null);
  const [isFileDeleteDialogOpen, setIsFileDeleteDialogOpen] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Consulta para obtener todas las propiedades
  const { data: propiedades = [], isLoading } = useQuery({
    queryKey: ['all-propiedades-admin'],
    queryFn: () => api.fetchPropiedades(),
  });

  // Consulta para obtener archivos de una propiedad específica
  const { data: propiedadFiles = [] } = useQuery({
    queryKey: ['propiedad-files', selectedPropiedad?.id],
    queryFn: () => selectedPropiedad ? api.fetchFilesByPropiedad(selectedPropiedad.id) : [],
    enabled: !!selectedPropiedad,
  });

  // Mutación para eliminar propiedad
  const deletePropiedadMutation = useMutation({
    mutationFn: (id: number) => api.deletePropiedad(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-propiedades-admin'] });
      toast({
        title: "✅ Propiedad eliminada",
        description: "La propiedad ha sido eliminada exitosamente",
      });
      setIsDeleteDialogOpen(false);
      setPropiedadToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "❌ Error al eliminar",
        description: error.message || "No se pudo eliminar la propiedad",
        variant: "destructive",
      });
    },
  });

  // Mutación para eliminar archivo
  const deleteFileMutation = useMutation({
    mutationFn: (fileId: number) => api.deleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propiedad-files', selectedPropiedad?.id] });
      toast({
        title: "✅ Foto eliminada",
        description: "La foto ha sido eliminada exitosamente",
      });
      setIsFileDeleteDialogOpen(false);
      setFileToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "❌ Error al eliminar foto",
        description: error.message || "No se pudo eliminar la foto",
        variant: "destructive",
      });
    },
  });

  // Filtrar propiedades
  const filteredPropiedades = propiedades.filter(propiedad =>
    propiedad.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    propiedad.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    propiedad.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Abrir carousel de fotos
  const openCarousel = (propiedad: Propiedad) => {
    setSelectedPropiedad(propiedad);
    setIsCarouselOpen(true);
  };

  // Confirmar eliminación de propiedad
  const confirmDeletePropiedad = (propiedad: Propiedad) => {
    setPropiedadToDelete(propiedad);
    setIsDeleteDialogOpen(true);
  };

  // Confirmar eliminación de archivo
  const confirmDeleteFile = (file: File) => {
    setFileToDelete(file);
    setIsFileDeleteDialogOpen(true);
  };

  // Descargar imagen
  const downloadImage = (file: File) => {
    const link = document.createElement('a');
    link.href = file.archivo_url || file.archivo;
    link.download = file.nombre_archivo;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Cargando propiedades...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl flex items-center gap-2">
            <ImageIcon className="h-8 w-8" />
            Administración de Propiedades y Fotos
          </CardTitle>
          <CardDescription>
            Gestiona todas las propiedades del sistema, visualiza fotos y elimina contenido inapropiado
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Barra de búsqueda y estadísticas */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar propiedades por nombre, dirección o tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-blue-900">{propiedades.length}</p>
                    <p className="text-sm text-blue-700">Total Propiedades</p>
                  </div>
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-green-900">
                      {propiedades.filter(p => p.status).length}
                    </p>
                    <p className="text-sm text-green-700">Activas</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-amber-900">
                      {propiedades.filter(p => !p.status).length}
                    </p>
                    <p className="text-sm text-amber-700">Inactivas</p>
                  </div>
                  <XCircle className="h-8 w-8 text-amber-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-purple-900">
                      {propiedades.filter(p => p.pets).length}
                    </p>
                    <p className="text-sm text-purple-700">Aceptan Mascotas</p>
                  </div>
                  <Dog className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Grid de propiedades */}
      {filteredPropiedades.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground text-lg">
              {searchTerm ? 'No se encontraron propiedades que coincidan con tu búsqueda' : 'No hay propiedades registradas en el sistema'}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPropiedades.map((propiedad) => (
            <PropertyAdminCard
              key={propiedad.id}
              propiedad={propiedad}
              onViewPhotos={() => openCarousel(propiedad)}
              onDelete={() => confirmDeletePropiedad(propiedad)}
            />
          ))}
        </div>
      )}

      {/* Carousel de fotos */}
      {selectedPropiedad && (
        <PhotoCarousel
          files={propiedadFiles}
          isOpen={isCarouselOpen}
          onClose={() => setIsCarouselOpen(false)}
          onDeleteFile={confirmDeleteFile}
          onDownloadFile={downloadImage}
          showAdminActions={true}
        />
      )}

      {/* Diálogo de confirmación para eliminar propiedad */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Eliminar Propiedad
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar la propiedad
              <strong> "{propiedadToDelete?.nombre}"</strong>? Esta acción no se puede deshacer y se eliminarán todas las fotos asociadas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => propiedadToDelete && deletePropiedadMutation.mutate(propiedadToDelete.id)}
              disabled={deletePropiedadMutation.isPending}
            >
              {deletePropiedadMutation.isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar Propiedad
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar archivo */}
      <Dialog open={isFileDeleteDialogOpen} onOpenChange={setIsFileDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Eliminar Foto
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta foto? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {fileToDelete && (
            <div className="flex justify-center">
              <img
                src={fileToDelete.archivo_url || fileToDelete.archivo}
                alt={fileToDelete.nombre_archivo}
                className="max-h-48 rounded-lg border"
              />
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsFileDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => fileToDelete && deleteFileMutation.mutate(fileToDelete.id)}
              disabled={deleteFileMutation.isPending}
            >
              {deleteFileMutation.isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
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

// 🔥 NUEVO COMPONENTE: Tarjeta de propiedad para administradores
interface PropertyAdminCardProps {
  propiedad: Propiedad;
  onViewPhotos: () => void;
  onDelete: () => void;
}

function PropertyAdminCard({ propiedad, onViewPhotos, onDelete }: PropertyAdminCardProps) {
  const [imageError, setImageError] = useState(false);
  const { data: files = [] } = useQuery({
    queryKey: ['propiedad-files-preview', propiedad.id],
    queryFn: () => api.fetchFilesByPropiedad(propiedad.id),
  });

  const mainImage = files.find(file => file.es_principal) || files[0];

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl truncate flex items-center gap-2">
              {propiedad.nombre}
              {!propiedad.status && (
                <Badge variant="destructive" className="text-xs">
                  Inactiva
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{propiedad.direccion}</span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onViewPhotos}>
                <Eye className="h-4 w-4 mr-2" />
                Ver Fotos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Propiedad
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Imagen principal */}
        <div
          className="relative aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer group"
          onClick={onViewPhotos}
        >
          {mainImage && !imageError ? (
            <img
              src={mainImage.archivo_url || mainImage.archivo}
              alt={propiedad.nombre}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
              <Building2 className="h-12 w-12 text-blue-300" />
            </div>
          )}

          {/* Overlay con información de fotos */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-end justify-end p-2">
            <Badge variant="secondary" className="bg-black/70 text-white">
              <ImageIcon className="h-3 w-3 mr-1" />
              {files.length} {files.length === 1 ? 'foto' : 'fotos'}
            </Badge>
          </div>
        </div>

        {/* Información de la propiedad */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="capitalize">{propiedad.tipo}</span>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>Bs {propiedad.precio_noche}/noche</span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{propiedad.max_huespedes} huéspedes</span>
          </div>

          <div className="flex items-center gap-2">
            <Bed className="h-4 w-4 text-muted-foreground" />
            <span>{propiedad.cant_hab} hab.</span>
          </div>

          <div className="flex items-center gap-2">
            <Bath className="h-4 w-4 text-muted-foreground" />
            <span>{propiedad.cant_bath} baños</span>
          </div>

          <div className="flex items-center gap-2">
            <Dog className="h-4 w-4 text-muted-foreground" />
            <span>{propiedad.pets ? 'Sí' : 'No'}</span>
          </div>
        </div>

        {/* Servicios básicos */}
        {propiedad.servicios_basicos && propiedad.servicios_basicos.length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Servicios:</p>
            <div className="flex flex-wrap gap-1">
              {propiedad.servicios_basicos.slice(0, 3).map((servicio, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {servicio}
                </Badge>
              ))}
              {propiedad.servicios_basicos.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{propiedad.servicios_basicos.length - 3} más
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onViewPhotos}
          >
            <Eye className="h-4 w-4 mr-2" />
            Ver Fotos
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}