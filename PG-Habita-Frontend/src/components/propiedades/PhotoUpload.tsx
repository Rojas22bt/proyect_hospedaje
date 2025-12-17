import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Upload,
  X,
  Eye,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  Loader2,
  Trash2,
  CheckSquare,
  Square
} from 'lucide-react'; // ✅ CORREGIDO: Sin 'Select'
import { useToast } from '@/hooks/use-toast';
import { File } from '@/types/auth';
import { cn } from '@/lib/utils';
import api from '@/services/api';

interface PhotoUploadProps {
  propiedadId?: number;
  onFilesUploaded?: (files: File[]) => void;
  existingFiles?: File[];
  maxFiles?: number;
  mode?: 'create' | 'edit';
}

// Sistema de filtrado de contenido
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MIN_DIMENSION = 400; // Mínimo 400px

export function PhotoUpload({
  propiedadId,
  onFilesUploaded,
  existingFiles = [],
  maxFiles = 10,
  mode = 'create'
}: PhotoUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>(existingFiles);
  const [previewFiles, setPreviewFiles] = useState<{file: globalThis.File; url: string}[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]); // IDs de archivos seleccionados
  const [isSelectMode, setIsSelectMode] = useState(false); // Modo selección múltiple
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // 🔥 CARGAR FOTOS EXISTENTES AL EDITAR
 useEffect(() => {
     if (mode === 'edit' && propiedadId && uploadedFiles.length === 0) {
       loadExistingFiles();
     }
   }, [propiedadId, mode]);

   // 🔥 CORREGIDO: Función mejorada para cargar archivos existentes
   const loadExistingFiles = async () => {
     if (!propiedadId) return;

     setIsLoadingExisting(true);
     try {
       console.log('📸 Cargando archivos existentes para propiedad:', propiedadId);
       const files = await api.fetchFilesByPropiedad(propiedadId);
       console.log('📁 Archivos cargados:', files);
       setUploadedFiles(files);

       // 🔥 CORRECCIÓN: Solo llamar si la función existe
       if (onFilesUploaded && typeof onFilesUploaded === 'function') {
         onFilesUploaded(files);
       }
     } catch (error) {
       console.error('❌ Error loading existing files:', error);
       toast({
         title: "Error",
         description: "No se pudieron cargar las fotos existentes",
         variant: "destructive",
       });
     } finally {
       setIsLoadingExisting(false);
     }
   };


   const notifyParent = (files: File[]) => {
     if (onFilesUploaded && typeof onFilesUploaded === 'function') {
       onFilesUploaded(files);
     }
   };

  // 🔥 TOGGLE SELECCIÓN INDIVIDUAL
  const toggleFileSelection = (fileId: number) => {
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  // 🔥 SELECCIONAR/DESELECCIONAR TODOS
  const toggleSelectAll = () => {
    if (selectedFiles.length === uploadedFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(uploadedFiles.map(file => file.id));
    }
  };

  // 🔥 ELIMINACIÓN MÚLTIPLE
  const deleteSelectedFiles = async () => {
    if (selectedFiles.length === 0) return;

    try {
      setIsUploading(true);

      // Eliminar archivos en paralelo
      const deletePromises = selectedFiles.map(fileId => api.deleteFile(fileId));
      await Promise.all(deletePromises);

      // Actualizar estado local
      const updatedFiles = uploadedFiles.filter(file => !selectedFiles.includes(file.id));
      setUploadedFiles(updatedFiles);
      setSelectedFiles([]);
      setIsSelectMode(false);

      // Notificar al componente padre
      onFilesUploaded(updatedFiles);

      toast({
        title: "✅ Fotos eliminadas",
        description: `${selectedFiles.length} foto(s) han sido eliminadas correctamente`,
      });

    } catch (error: any) {
      console.error('❌ Error eliminando archivos:', error);

      let errorMessage = "No se pudieron eliminar algunas fotos";
      if (error.response?.data) {
        errorMessage = Object.values(error.response.data).flat().join(', ');
      }

      toast({
        title: "❌ Error al eliminar",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Validar archivo antes de subir
  const validateFile = async (file: globalThis.File): Promise<{valid: boolean; error?: string}> => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `Tipo de archivo no permitido. Formatos aceptados: JPEG, PNG, WebP`
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `El archivo es demasiado grande. Máximo permitido: 5MB`
      };
    }

    try {
      const dimensions = await getImageDimensions(file);
      if (dimensions.width < MIN_DIMENSION || dimensions.height < MIN_DIMENSION) {
        return {
          valid: false,
          error: `La imagen es muy pequeña. Mínimo requerido: ${MIN_DIMENSION}x${MIN_DIMENSION}px`
        };
      }
    } catch (error) {
      return {
        valid: false,
        error: 'No se pudo verificar las dimensiones de la imagen'
      };
    }

    return { valid: true };
  };

  // Obtener dimensiones de la imagen
  const getImageDimensions = (file: globalThis.File): Promise<{width: number; height: number}> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Error al cargar la imagen'));
      };

      img.src = url;
    });
  };

  // Manejar selección de archivos
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    // Verificar límite de archivos
    const totalFiles = uploadedFiles.length + previewFiles.length + files.length;
    if (totalFiles > maxFiles) {
      toast({
        title: "Límite excedido",
        description: `Solo puedes subir máximo ${maxFiles} fotos por propiedad. Ya tienes ${uploadedFiles.length} fotos.`,
        variant: "destructive",
      });
      return;
    }

    const validFiles: {file: globalThis.File; url: string}[] = [];
    const errors: string[] = [];

    for (const file of files) {
      const validation = await validateFile(file);

      if (validation.valid) {
        const url = URL.createObjectURL(file);
        validFiles.push({ file, url });
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    }

    // Mostrar errores
    if (errors.length > 0) {
      toast({
        title: "Archivos rechazados",
        description: errors.slice(0, 3).join('\n') + (errors.length > 3 ? `\n...y ${errors.length - 3} más` : ''),
        variant: "destructive",
      });
    }

    // Agregar archivos válidos a previsualización
    if (validFiles.length > 0) {
      setPreviewFiles(prev => [...prev, ...validFiles]);
      toast({
        title: "Archivos listos para subir",
        description: `${validFiles.length} archivo(s) validado(s) correctamente`,
      });
    }

    // Limpiar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Eliminar archivo de previsualización
  const removePreviewFile = (index: number) => {
    setPreviewFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].url);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  // 🔥 ELIMINAR TODAS LAS FOTOS PENDIENTES
  const removeAllPreviewFiles = () => {
    previewFiles.forEach(preview => URL.revokeObjectURL(preview.url));
    setPreviewFiles([]);
    toast({
      title: "Subida cancelada",
      description: "Todos los archivos pendientes han sido removidos",
    });
  };

  // Subir archivos
  const uploadFiles = async () => {
      if (previewFiles.length === 0 || !propiedadId) {
        toast({
          title: "Error",
          description: "No hay archivos para subir o falta el ID de la propiedad",
          variant: "destructive",
        });
        return;
      }

      setIsUploading(true);

      try {
        const formData = new FormData();

        previewFiles.forEach(({ file }) => {
          formData.append('archivos', file);
        });

        formData.append('propiedad_id', propiedadId.toString());
        formData.append('es_principal', 'false');

        const response = await api.uploadFiles(formData);

        // Actualizar estado con los archivos reales del servidor
        const newUploadedFiles = [...uploadedFiles, ...response];
        setUploadedFiles(newUploadedFiles);
        setPreviewFiles([]);

        // 🔥 CORRECCIÓN: Usar la función de notificación
        notifyParent(newUploadedFiles);

        toast({
          title: "✅ Fotos subidas exitosamente",
          description: `${previewFiles.length} foto(s) han sido agregadas a la propiedad`,
        });

      } catch (error: any) {
        console.error('❌ Error uploading files:', error);
        // ... manejo de errores ...
      } finally {
        setIsUploading(false);
      }
    };

    // Eliminar archivo individual - CORREGIDO
    const removeUploadedFile = async (fileId: number) => {
      try {
        await api.deleteFile(fileId);

        const updatedFiles = uploadedFiles.filter(file => file.id !== fileId);
        setUploadedFiles(updatedFiles);
        setSelectedFiles(prev => prev.filter(id => id !== fileId));

        // 🔥 CORRECCIÓN: Usar la función de notificación
        notifyParent(updatedFiles);

        toast({
          title: "✅ Foto eliminada",
          description: "La foto ha sido removida de la propiedad",
        });
      } catch (error: any) {
        console.error('❌ Error al eliminar archivo:', error);
      let errorMessage = "No se pudo eliminar la foto";
      if (error.response?.data) {
        errorMessage = Object.values(error.response.data).flat().join(', ');
      }

      toast({
        title: "❌ Error al eliminar",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Establecer como imagen principal
  const setAsPrincipal = async (fileId: number) => {
    try {
      const updatedFile = await api.setPrincipalImage(fileId);

      const updatedFiles = uploadedFiles.map(file =>
        file.id === fileId
          ? { ...file, es_principal: true }
          : { ...file, es_principal: false }
      );

      setUploadedFiles(updatedFiles);
      onFilesUploaded(updatedFiles);

      toast({
        title: "✅ Imagen principal actualizada",
        description: "La imagen se ha establecido como principal",
      });
    } catch (error: any) {
      console.error('❌ Error al establecer como principal:', error);

      let errorMessage = "No se pudo establecer como imagen principal";
      if (error.response?.data) {
        errorMessage = Object.values(error.response.data).flat().join(', ');
      }

      toast({
        title: "❌ Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Ver archivo en tamaño completo
  const viewFile = (file: File) => {
    const imageUrl = file.archivo_url || file.archivo;
    window.open(imageUrl, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Fotos de la Propiedad
          {mode === 'edit' && (
            <Badge variant="secondary" className="ml-2">
              Editando
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {mode === 'create'
            ? "Sube fotos de alta calidad de tu propiedad. Mínimo 400x400px, máximo 5MB por foto."
            : "Gestiona las fotos de tu propiedad. Puedes seleccionar múltiples fotos para eliminarlas en lote."
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Área de subida - SOLO SI HAY ESPACIO DISPONIBLE */}
        {(uploadedFiles.length + previewFiles.length) < maxFiles && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
            <Input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handleFileSelect}
              className="hidden"
              id="photo-upload"
              disabled={isUploading}
            />
            <Label
              htmlFor="photo-upload"
              className={cn(
                "cursor-pointer flex flex-col items-center gap-2",
                isUploading && "opacity-50 cursor-not-allowed"
              )}
            >
              <Upload className="h-8 w-8 text-gray-400" />
              <div>
                <p className="font-medium">Haz clic para seleccionar fotos</p>
                <p className="text-sm text-gray-500">
                  o arrastra y suelta aquí
                </p>
              </div>
              <Badge variant="secondary" className="mt-2">
                {uploadedFiles.length + previewFiles.length} / {maxFiles} fotos
              </Badge>
              <p className="text-xs text-gray-500 mt-1">
                Espacio disponible: {maxFiles - (uploadedFiles.length + previewFiles.length)} fotos
              </p>
            </Label>
          </div>
        )}

        {/* Previsualización de archivos pendientes */}
        {previewFiles.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm text-gray-700">
                Fotos pendientes de subir ({previewFiles.length})
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={removeAllPreviewFiles}
                disabled={isUploading}
              >
                <X className="h-4 w-4 mr-2" />
                Eliminar todas
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {previewFiles.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview.url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removePreviewFile(index)}
                    disabled={isUploading}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-4">
              <Button
                onClick={uploadFiles}
                disabled={isUploading || !propiedadId}
                className="flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Subir {previewFiles.length} {previewFiles.length === 1 ? 'foto' : 'fotos'}
                  </>
                )}
              </Button>

              {!propiedadId && (
                <Badge variant="destructive" className="self-center">
                  Primero guarda la propiedad para subir fotos
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Fotos ya subidas */}
        {(uploadedFiles.length > 0 || isLoadingExisting) && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <h4 className="font-medium text-sm text-gray-700">
                  {mode === 'edit' ? 'Fotos de la propiedad' : 'Fotos subidas'} ({uploadedFiles.length})
                </h4>

                {/* 🔥 CONTROLES DE SELECCIÓN MÚLTIPLE */}
                {uploadedFiles.length > 0 && (
                  <div className="flex items-center gap-2">
                    {!isSelectMode ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsSelectMode(true)}
                      >
                        <CheckSquare className="h-4 w-4 mr-2" /> {/* ✅ REEMPLAZADO: CheckSquare en lugar de Select */}
                        Seleccionar
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={toggleSelectAll}
                        >
                          {selectedFiles.length === uploadedFiles.length ? (
                            <CheckSquare className="h-4 w-4 mr-2" />
                          ) : (
                            <Square className="h-4 w-4 mr-2" />
                          )}
                          {selectedFiles.length === uploadedFiles.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
                        </Button>

                        {selectedFiles.length > 0 && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={deleteSelectedFiles}
                            disabled={isUploading}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar ({selectedFiles.length})
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setIsSelectMode(false);
                            setSelectedFiles([]);
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancelar
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {mode === 'edit' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadExistingFiles}
                  disabled={isLoadingExisting}
                >
                  <Loader2 className={cn("h-4 w-4 mr-2", isLoadingExisting && "animate-spin")} />
                  Actualizar
                </Button>
              )}
            </div>

            {isLoadingExisting ? (
              <div className="flex items-center justify-center p-8 border border-gray-200 rounded-lg">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400 mr-2" />
                <span className="text-gray-600">Cargando fotos existentes...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={file.id}
                    className={cn(
                      "relative group transition-all duration-200",
                      isSelectMode && "cursor-pointer",
                      selectedFiles.includes(file.id) && "ring-2 ring-blue-500 ring-offset-2"
                    )}
                    onClick={() => isSelectMode && toggleFileSelection(file.id)}
                  >
                    <img
                      src={file.archivo_url || file.archivo}
                      alt={file.nombre_archivo}
                      className="w-full h-24 object-cover rounded-lg border"
                    />

                    {/* Checkbox de selección */}
                    {isSelectMode && (
                      <div className="absolute top-2 left-2">
                        <Checkbox
                          checked={selectedFiles.includes(file.id)}
                          onCheckedChange={() => toggleFileSelection(file.id)}
                          className="h-5 w-5 bg-white border-2 border-gray-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                        />
                      </div>
                    )}

                    {/* Badge de imagen principal */}
                    {file.es_principal && !isSelectMode && (
                      <Badge className="absolute top-1 left-1 bg-green-600 text-xs px-1 py-0">
                        Principal
                      </Badge>
                    )}

                    {/* Contador */}
                    {!isSelectMode && (
                      <Badge variant="secondary" className="absolute top-1 right-1 text-xs px-1 py-0">
                        {index + 1}
                      </Badge>
                    )}

                    {/* Overlay de acciones - SOLO CUANDO NO ESTÁ EN MODO SELECCIÓN */}
                    {!isSelectMode && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 bg-white/90 hover:bg-white"
                          onClick={() => viewFile(file)}
                          title="Ver imagen"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>

                        {!file.es_principal && (
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 bg-yellow-500/90 hover:bg-yellow-500 text-white"
                            onClick={() => setAsPrincipal(file.id)}
                            title="Establecer como principal"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                        )}

                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8 bg-red-500/90 hover:bg-red-500 text-white"
                          onClick={() => removeUploadedFile(file.id)}
                          title="Eliminar imagen"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}

                    {/* Indicador de selección */}
                    {selectedFiles.includes(file.id) && (
                      <div className="absolute inset-0 bg-blue-500/20 rounded-lg border-2 border-blue-500" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Información de validación */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="font-medium text-blue-900">Requisitos de las fotos:</p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Formatos aceptados: JPEG, PNG, WebP</li>
                <li>• Tamaño máximo por foto: 5MB</li>
                <li>• Resolución mínima: 400x400 píxeles</li>
                <li>• Máximo {maxFiles} fotos por propiedad</li>
                <li>• <strong>Nuevo:</strong> Selecciona múltiples fotos para eliminarlas en lote</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Estado de carga */}
        {isUploading && (
          <div className="flex items-center justify-center p-4 border border-blue-200 bg-blue-50 rounded-lg">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600 mr-2" />
            <span className="text-blue-800">
              {selectedFiles.length > 0 ? 'Eliminando fotos...' : 'Subiendo fotos, por favor espera...'}
            </span>
          </div>
        )}

        {/* Límite alcanzado */}
        {(uploadedFiles.length + previewFiles.length) >= maxFiles && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-amber-900">Límite de fotos alcanzado</p>
                <p className="text-sm text-amber-800">
                  Has alcanzado el máximo de {maxFiles} fotos por propiedad.
                  Elimina algunas fotos existentes para agregar nuevas.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}