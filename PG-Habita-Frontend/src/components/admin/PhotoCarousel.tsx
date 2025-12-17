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
  Image as ImageIcon,
  Building2,
  MapPin,
  DollarSign,
  Users,
  Bed,
  Bath,
  Dog,
  CheckCircle,
  XCircle,
  MoreVertical,
  Eye,
  Star,
  Camera,
  Shield,
  AlertTriangle,
  Download,
  Grid3X3,
  List
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Propiedad, File } from '@/types/auth';
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
import PhotoCarousel from '@/components/admin/PhotoCarousel';

export default function AdminPhotoGallery() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<{file: File, propiedad: Propiedad} | null>(null);
  const [selectedPropiedad, setSelectedPropiedad] = useState<Propiedad | null>(null);
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Consulta para obtener todas las propiedades
  const { data: propiedades = [], isLoading } = useQuery({
    queryKey: ['all-propiedades-admin'],
    queryFn: () => api.fetchPropiedades(),
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

  // Filtrar propiedades
  const filteredPropiedades = propiedades.filter(propiedad => {
    const matchesSearch = propiedad.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      propiedad.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      propiedad.tipo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && propiedad.status) ||
      (filterStatus === 'inactive' && !propiedad.status);

    return matchesSearch && matchesStatus;
  });

  // Confirmar eliminación de foto
  const confirmDeleteFile = (file: File, propiedad: Propiedad) => {
    setFileToDelete({ file, propiedad });
    setIsDeleteDialogOpen(true);
  };

  // Abrir carrusel de fotos
  const openPhotoCarousel = (propiedad: Propiedad) => {
    setSelectedPropiedad(propiedad);
    setIsCarouselOpen(true);
  };

  // Cerrar carrusel
  const closeCarousel = () => {
    setIsCarouselOpen(false);
    setSelectedPropiedad(null);
  };

  // Función para descargar archivo
  const handleDownloadFile = (file: File) => {
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <div className="text-lg text-muted-foreground">Cargando propiedades...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Camera className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Gestión de Galerías</h1>
                  <p className="text-blue-100 text-lg">
                    Administra y modera las fotos de todas las propiedades
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                  <Shield className="h-4 w-4" />
                  <span>Moderación de contenido</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                  <Building2 className="h-4 w-4" />
                  <span>{propiedades.length} propiedades</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{propiedades.length}</div>
              <div className="text-blue-100">Propiedades totales</div>
            </div>
          </div>
        </div>

        {/* Panel de control */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Búsqueda y filtros */}
              <div className="flex-1 space-y-4">
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Buscar propiedades por nombre, dirección o tipo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-12 rounded-xl border-2 focus:border-primary transition-colors"
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="h-12 rounded-xl border-2">
                        <Filter className="h-4 w-4 mr-2" />
                        Filtros
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 p-4">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Estado</label>
                          <div className="space-y-2">
                            {[
                              { value: 'all', label: 'Todas las propiedades' },
                              { value: 'active', label: 'Solo activas' },
                              { value: 'inactive', label: 'Solo inactivas' }
                            ].map((option) => (
                              <div key={option.value} className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id={`status-${option.value}`}
                                  checked={filterStatus === option.value}
                                  onChange={() => setFilterStatus(option.value as any)}
                                  className="text-primary focus:ring-primary"
                                />
                                <label htmlFor={`status-${option.value}`} className="text-sm">
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Filtros rápidos */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Todas', count: propiedades.length, value: 'all' },
                    { label: 'Activas', count: propiedades.filter(p => p.status).length, value: 'active' },
                    { label: 'Inactivas', count: propiedades.filter(p => !p.status).length, value: 'inactive' },
                    { label: 'Con mascotas', count: propiedades.filter(p => p.pets).length, value: 'pets' }
                  ].map((filter) => (
                    <Button
                      key={filter.value}
                      variant={filterStatus === filter.value ? "default" : "outline"}
                      size="sm"
                      className="rounded-full"
                      onClick={() => setFilterStatus(filter.value as any)}
                    >
                      {filter.label}
                      <Badge variant="secondary" className="ml-2 bg-white/20">
                        {filter.count}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Controles de vista */}
              <div className="flex items-center gap-4">
                <div className="flex bg-muted rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-md"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-md"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas en tarjetas modernas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Total Propiedades',
              value: propiedades.length,
              icon: Building2,
              color: 'from-blue-500 to-blue-600',
              bgColor: 'bg-blue-50',
              textColor: 'text-blue-700'
            },
            {
              title: 'Propiedades Activas',
              value: propiedades.filter(p => p.status).length,
              icon: CheckCircle,
              color: 'from-green-500 to-green-600',
              bgColor: 'bg-green-50',
              textColor: 'text-green-700'
            },
            {
              title: 'Propiedades Inactivas',
              value: propiedades.filter(p => !p.status).length,
              icon: XCircle,
              color: 'from-amber-500 to-amber-600',
              bgColor: 'bg-amber-50',
              textColor: 'text-amber-700'
            },
            {
              title: 'Aceptan Mascotas',
              value: propiedades.filter(p => p.pets).length,
              icon: Dog,
              color: 'from-purple-500 to-purple-600',
              bgColor: 'bg-purple-50',
              textColor: 'text-purple-700'
            }
          ].map((stat, index) => (
            <Card key={index} className={`${stat.bgColor} border-0 shadow-sm hover:shadow-md transition-shadow`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                    <p className="text-sm text-muted-foreground mt-1">{stat.title}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Grid de propiedades */}
        {filteredPropiedades.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {searchTerm ? 'No se encontraron propiedades' : 'No hay propiedades registradas'}
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    {searchTerm
                      ? 'Intenta ajustar los términos de búsqueda o los filtros aplicados.'
                      : 'Cuando se registren propiedades, aparecerán aquí para su gestión.'
                    }
                  </p>
                </div>
                {searchTerm && (
                  <Button
                    variant="outline"
                    onClick={() => setSearchTerm('')}
                    className="rounded-full"
                  >
                    Limpiar búsqueda
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
              : 'grid-cols-1'
          }`}>
            {filteredPropiedades.map((propiedad) => (
              <PropertyPhotoCard
                key={propiedad.id}
                propiedad={propiedad}
                onViewPhotos={() => openPhotoCarousel(propiedad)}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}

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
                ¿Estás seguro de que deseas eliminar esta foto de la propiedad
                <strong className="text-foreground"> "{fileToDelete?.propiedad.nombre}"</strong>?
                Esta acción no se puede deshacer y la foto será removida permanentemente del sistema.
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
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar Foto
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Carrusel de fotos usando el componente PhotoCarousel */}
        {selectedPropiedad && (
          <PhotoCarouselWithData
            propiedad={selectedPropiedad}
            isOpen={isCarouselOpen}
            onClose={closeCarousel}
            onDeleteFile={(file) => confirmDeleteFile(file, selectedPropiedad)}
            onDownloadFile={handleDownloadFile}
          />
        )}
      </div>
    </div>
  );
}

// Componente de tarjeta para gestión de fotos
interface PropertyPhotoCardProps {
  propiedad: Propiedad;
  onViewPhotos: () => void;
  viewMode: 'grid' | 'list';
}

function PropertyPhotoCard({ propiedad, onViewPhotos, viewMode }: PropertyPhotoCardProps) {
  const { data: files = [] } = useQuery({
    queryKey: ['propiedad-files-preview', propiedad.id],
    queryFn: () => api.fetchFilesByPropiedad(propiedad.id),
  });

  const mainImage = files.find(file => file.es_principal) || files[0];
  const hasPhotos = files.length > 0;

  if (viewMode === 'list') {
    return (
      <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/20">
        <div className="flex">
          <div
            className="w-32 h-32 flex-shrink-0 relative cursor-pointer group"
            onClick={onViewPhotos}
          >
            {mainImage ? (
              <img
                src={mainImage.archivo_url || mainImage.archivo}
                alt={propiedad.nombre}
                className="w-full h-full object-cover rounded-l-lg group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 rounded-l-lg">
                <Camera className="h-8 w-8 text-slate-400" />
              </div>
            )}
          </div>

          <div className="flex-1 p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg text-foreground">{propiedad.nombre}</h3>
                  {!propiedad.status && (
                    <Badge variant="destructive" className="text-xs">
                      Inactiva
                    </Badge>
                  )}
                  {hasPhotos && (
                    <Badge variant="secondary" className="text-xs">
                      <Camera className="h-3 w-3 mr-1" />
                      {files.length} foto{files.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{propiedad.direccion}</span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    <span className="capitalize">{propiedad.tipo}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span>Bs {propiedad.precio_noche}/noche</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{propiedad.max_huespedes} huesp.</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={hasPhotos ? "default" : "outline"}
                  size="sm"
                  onClick={onViewPhotos}
                  className="rounded-full"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {hasPhotos ? `Gestionar (${files.length})` : 'Sin fotos'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-primary/20 group">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg text-foreground truncate">{propiedad.nombre}</h3>
              {!propiedad.status && (
                <Badge variant="destructive" className="text-xs flex-shrink-0">
                  Inactiva
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{propiedad.direccion}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div
          className="relative aspect-video bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl overflow-hidden cursor-pointer group/image"
          onClick={onViewPhotos}
        >
          {mainImage ? (
            <>
              <img
                src={mainImage.archivo_url || mainImage.archivo}
                alt={propiedad.nombre}
                className="w-full h-full object-cover group-hover/image:scale-110 transition-transform duration-500"
              />
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
              <Camera className="h-12 w-12 mb-2" />
              <span className="text-sm">Sin fotos</span>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="bg-black/70 text-white backdrop-blur-sm">
                <Camera className="h-3 w-3 mr-1" />
                {files.length} {files.length === 1 ? 'foto' : 'fotos'}
              </Badge>
              {mainImage?.es_principal && (
                <Badge variant="default" className="bg-green-600 text-white">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Principal
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
            <Building2 className="h-4 w-4 text-slate-600" />
            <span className="capitalize text-slate-700">{propiedad.tipo}</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
            <DollarSign className="h-4 w-4 text-slate-600" />
            <span className="text-slate-700">Bs {propiedad.precio_noche}</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
            <Users className="h-4 w-4 text-slate-600" />
            <span className="text-slate-700">{propiedad.max_huespedes}</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
            <Bed className="h-4 w-4 text-slate-600" />
            <span className="text-slate-700">{propiedad.cant_hab} hab.</span>
          </div>
        </div>

        <Button
          variant={hasPhotos ? "default" : "outline"}
          size="sm"
          onClick={onViewPhotos}
          className="w-full rounded-xl h-11 font-medium"
          disabled={!hasPhotos}
        >
          <Eye className="h-4 w-4 mr-2" />
          {hasPhotos ? `Gestionar ${files.length} Foto${files.length !== 1 ? 's' : ''}` : 'Sin Fotos'}
        </Button>
      </CardContent>
    </Card>
  );
}

// Componente wrapper para el carrusel con datos
function PhotoCarouselWithData({ propiedad, isOpen, onClose, onDeleteFile, onDownloadFile }: any) {
  const { data: files = [] } = useQuery({
    queryKey: ['propiedad-files', propiedad.id],
    queryFn: () => api.fetchFilesByPropiedad(propiedad.id),
    enabled: isOpen,
  });

  return (
    <PhotoCarousel
      files={files}
      isOpen={isOpen}
      onClose={onClose}
      onDeleteFile={onDeleteFile}
      onDownloadFile={onDownloadFile}
      showAdminActions={true}
    />
  );
}