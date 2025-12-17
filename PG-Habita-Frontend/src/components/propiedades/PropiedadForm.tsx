import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Propiedad, PropiedadFormData } from '@/types/auth';
import { PhotoUpload } from './PhotoUpload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { usePropertyValidation } from '@/hooks/usePropertyValidation';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
    AlertCircle, Home, Building2, Users, Dog, Bed, Bath,
    MapPin, Save, X, Loader2
} from 'lucide-react';
import InteractivePropertyMap from '@/components/maps/InteractivePropertyMap';
import api from '@/services/api';

// Características agrupadas por categoría
const CARACTERISTICAS_AGRUPADAS = {
    'Comodidades Básicas': [
        { id: 'wifi', label: '📶 WiFi', description: 'Conexión a internet' },
        { id: 'aire_acondicionado', label: '❄️ Aire Acondicionado', description: 'Sistema de climatización' },
        { id: 'calefaccion', label: '🔥 Calefacción', description: 'Sistema de calefacción' },
        { id: 'cocina', label: '👨‍🍳 Cocina Equipada', description: 'Cocina completa' },
        { id: 'tv', label: '📺 Televisión', description: 'TV con cable/streaming' },
        { id: 'lavadora', label: '🧺 Lavadora', description: 'Lavadora de ropa' },
    ],
    'Espacios Exteriores': [
        { id: 'piscina', label: '🏊 Piscina', description: 'Piscina privada o compartida' },
        { id: 'jardin', label: '🌳 Jardín', description: 'Área verde privada' },
        { id: 'terraza', label: '🌇 Terraza', description: 'Terraza o balcón' },
        { id: 'parrilla', label: '🍖 Parrilla', description: 'Área para parrilladas' },
        { id: 'estacionamiento', label: '🅿️ Estacionamiento', description: 'Estacionamiento gratuito' },
    ],
    'Servicios Adicionales': [
        { id: 'desayuno', label: '🍳 Desayuno Incluido', description: 'Desayuno incluido' },
        { id: 'limpieza', label: '🧹 Limpieza Diaria', description: 'Limpieza diaria' },
        { id: 'gimnasio', label: '💪 Gimnasio', description: 'Acceso a gimnasio' },
        { id: 'spa', label: '💆 Spa', description: 'Servicios de spa' },
    ]
};


const propiedadSchema = z.object({
    nombre: z.string().min(1, 'Nombre requerido').max(20, 'Máximo 20 caracteres'),
    descripcion: z.string().min(1, 'Descripción requerida').max(200, 'Máximo 200 caracteres'),
    tipo: z.enum(['Departamento', 'Casa', 'Cabaña']),
    caracteristicas: z.array(z.string()).min(1, 'Selecciona al menos una característica'),
    status: z.boolean(),
    precio_noche: z.union([z.string(), z.number()]).transform(val =>
        typeof val === 'string' ? parseFloat(val) || 0 : val
    ).refine(val => val >= 0, 'El precio debe ser mayor o igual a 0'),
    max_huespedes: z.union([z.string(), z.number()]).transform(val =>
        typeof val === 'string' ? parseInt(val) || 1 : val
    ).refine(val => val >= 1, 'Debe haber al menos 1 huésped'),
    pets: z.boolean(),
    cant_hab: z.union([z.string(), z.number()]).transform(val =>
        typeof val === 'string' ? parseInt(val) || 0 : val
    ).refine(val => val >= 0, 'La cantidad debe ser mayor o igual a 0'),
    cant_bath: z.union([z.string(), z.number()]).transform(val =>
        typeof val === 'string' ? parseInt(val) || 0 : val
    ).refine(val => val >= 0, 'La cantidad debe ser mayor o igual a 0'),
});

interface PropiedadFormProps {
    propiedad?: Propiedad | null;
    onSubmit: (data: PropiedadFormData) => void;
    onCancel: () => void;
    isEditing?: boolean;
}

const PropiedadForm: React.FC<PropiedadFormProps> = ({
    propiedad,
    onSubmit,
    onCancel,
    isEditing = !!propiedad
}) => {
    const { user } = useAuth();
    const { validateBeforeCreate, propertyLimit, currentPropertyCount, hasPropertyPermission } = usePropertyValidation();
    const [isSubmitting, setIsSubmitting] = useState(false);
   const [ubicacion, setUbicacion] = useState<{
     latitud?: number;
     longitud?: number;
     direccion_completa?: string;
     ciudad?: string;
     provincia?: string;
     departamento?: string;
     pais?: string;
   }>(() => {
     // 🔥 INICIALIZAR CON VALORES POR DEFECTO VÁLIDOS
     if (propiedad) {
       return {
         latitud: propiedad.latitud || -17.7833,
         longitud: propiedad.longitud || -63.1821,
         direccion_completa: propiedad.direccion_completa || propiedad.nombre,
         ciudad: propiedad.ciudad || 'Santa Cruz de la Sierra',
         provincia: propiedad.provincia || 'Santa Cruz',
         departamento: propiedad.departamento || 'Santa Cruz',
         pais: propiedad.pais || 'Bolivia'
       };
     }
     return {
       latitud: -17.7833,
       longitud: -63.1821,
       direccion_completa: 'Santa Cruz de la Sierra, Bolivia',
       ciudad: 'Santa Cruz de la Sierra',
       provincia: 'Santa Cruz',
       departamento: 'Santa Cruz',
       pais: 'Bolivia'
     };
   });

    const form = useForm<PropiedadFormData>({
        resolver: zodResolver(propiedadSchema),
        defaultValues: {
            nombre: propiedad?.nombre || '',
            descripcion: propiedad?.descripcion || '',
            tipo: propiedad?.tipo || 'Casa',
            caracteristicas: propiedad?.caracteristicas || [],
            status: propiedad?.status ?? true,
            precio_noche: propiedad?.precio_noche || 0,
            max_huespedes: propiedad?.max_huespedes || 1,
            pets: propiedad?.pets || false,
            cant_hab: propiedad?.cant_hab || 0,
            cant_bath: propiedad?.cant_bath || 0,
        },
    });

    const handleSubmit = async (data: PropiedadFormData) => {
      console.log('📍 Ubicación actual:', ubicacion);
      console.log('📝 Datos del formulario:', data);

      // 🔥 CORRECCIÓN: Validar que tenemos ubicación
      if (!ubicacion.latitud || !ubicacion.longitud) {
        toast({
          title: "❌ Ubicación requerida",
          description: "Por favor, selecciona una ubicación en el mapa",
          variant: "destructive",
        });
        return;
      }

      // 🔥 PREPARAR DATOS EXACTAMENTE COMO EL BACKEND LOS ESPERA
      const processedData: any = {
        // Datos básicos requeridos
        nombre: data.nombre?.trim() || '',
        descripcion: data.descripcion?.trim() || '',
        tipo: data.tipo || 'Casa',
        caracteristicas: Array.isArray(data.caracteristicas) ? data.caracteristicas : [],
        status: Boolean(data.status),
        precio_noche: Number(data.precio_noche) || 0,
        max_huespedes: Number(data.max_huespedes) || 1,
        pets: Boolean(data.pets),
        cant_hab: Number(data.cant_hab) || 0,
        cant_bath: Number(data.cant_bath) || 0,

        // 🔥 CAMPOS GEOGRÁFICOS - CONVERTIR A DECIMALES
        latitud: Number(ubicacion.latitud),
        longitud: Number(ubicacion.longitud),
        direccion_completa: ubicacion.direccion_completa?.trim() || data.nombre?.trim() || 'Ubicación en Bolivia',
        ciudad: ubicacion.ciudad?.trim() || 'Santa Cruz de la Sierra',
        provincia: ubicacion.provincia?.trim() || 'Santa Cruz',
        departamento: ubicacion.departamento?.trim() || 'Santa Cruz',
        pais: ubicacion.pais?.trim() || 'Bolivia'
      };

      console.log('🚀 Enviando datos procesados:', processedData);

      // Validaciones de permisos para clientes
      if (user?.role === 'CLIENT' && !propiedad) {
        if (!hasPropertyPermission) {
          toast({
            title: "❌ Permiso denegado",
            description: "No tienes permisos para crear propiedades.",
            variant: "destructive",
          });
          return;
        }
        if (!validateBeforeCreate()) return;
      }

      setIsSubmitting(true);

      try {
        if (isEditing && propiedad) {
          console.log('🔄 Actualizando propiedad existente con PATCH...');
          // 🔥 USAR api QUE AHORA ESTÁ IMPORTADO
          await api.updatePropiedad(propiedad.id, processedData);
        } else {
          console.log('🔄 Creando nueva propiedad...');
          // 🔥 USAR LA FUNCIÓN onSubmit QUE VIENE COMO PROP
          await onSubmit(processedData);
        }

        toast({
          title: "✅ Éxito",
          description: `Propiedad ${isEditing ? 'actualizada' : 'creada'} correctamente`,
        });

      } catch (error: any) {
        console.error('❌ Error detallado al enviar:', error);

        let errorMessage = `No se pudo ${isEditing ? 'actualizar' : 'crear'} la propiedad`;

        if (error.response?.data) {
          console.error('📋 Respuesta completa del error:', error.response.data);

          if (typeof error.response.data === 'object') {
            const validationErrors = Object.entries(error.response.data)
              .map(([field, messages]) => {
                const fieldName = field.replace(/_/g, ' ');
                const messageText = Array.isArray(messages) ? messages.join(', ') : String(messages);
                return `• ${fieldName}: ${messageText}`;
              })
              .join('\n');

            errorMessage = `Errores de validación:\n${validationErrors}`;
          } else if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (error.response.data.detail) {
            errorMessage = error.response.data.detail;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }

        toast({
          title: "❌ Error del servidor",
          description: errorMessage,
          variant: "destructive",
          duration: 10000,
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    // Componente de Información de Suscripción
    const SubscriptionInfo = () => {
        if (user?.role !== 'CLIENT' || propiedad) return null;

        const progressPercentage = Math.min((currentPropertyCount / propertyLimit) * 100, 100);
        const isLimitReached = currentPropertyCount >= propertyLimit;

        return (
            <Card className="border-l-4 border-l-blue-500 bg-blue-50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-blue-500" />
                        Límite de Propiedades
                    </CardTitle>
                    <CardDescription>
                        Según tu plan actual
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Propiedades creadas:</span>
                        <Badge variant={isLimitReached ? "destructive" : "default"}>
                            {currentPropertyCount} / {propertyLimit}
                        </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                                isLimitReached ? 'bg-red-500' :
                                progressPercentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                    {isLimitReached && (
                        <p className="text-sm text-red-600 font-medium">
                            💡 Has alcanzado el límite. Actualiza tu plan para crear más propiedades.
                        </p>
                    )}
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {isEditing ? 'Editar Propiedad' : 'Crear Nueva Propiedad'}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
                    {isEditing
                        ? 'Actualiza la información de tu propiedad'
                        : 'Completa la información para publicar tu propiedad'
                    }
                </p>
            </div>

            {/* Información de Suscripción */}
            {user?.role === 'CLIENT' && !propiedad && <SubscriptionInfo />}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    {/* Información Básica */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Home className="h-5 w-5" />
                                Información Básica
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="nombre"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm sm:text-base">Nombre de la Propiedad</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ej: Casa en la playa, Departamento céntrico..."
                                                className="text-sm sm:text-base"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription className="text-xs sm:text-sm">
                                            Nombre único para identificar tu propiedad (máx. 20 caracteres)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="descripcion"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm sm:text-base">Descripción</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Textarea
                                                    placeholder="Describe las características y atractivos de tu propiedad..."
                                                    className="min-h-[100px] resize-none pr-10 text-sm sm:text-base"
                                                    {...field}
                                                />
                                                <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                                                    {field.value?.length || 0}/200
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormDescription className="text-xs sm:text-sm">
                                            Breve descripción que aparecerá en los listados
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Tipo y Características */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Building2 className="h-5 w-5" />
                                Tipo y Características
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="tipo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm sm:text-base">Tipo de Propiedad</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="text-sm sm:text-base">
                                                    <SelectValue placeholder="Selecciona el tipo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Casa" className="text-sm sm:text-base">🏠 Casa</SelectItem>
                                                <SelectItem value="Departamento" className="text-sm sm:text-base">🏢 Departamento</SelectItem>
                                                <SelectItem value="Cabaña" className="text-sm sm:text-base">🌲 Cabaña</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="caracteristicas"
                                render={() => (
                                    <FormItem>
                                        <FormLabel className="text-sm sm:text-base">Características Incluidas</FormLabel>
                                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                            {Object.entries(CARACTERISTICAS_AGRUPADAS).map(([categoria, caracteristicas]) => (
                                                <div key={categoria} className="bg-gray-50 p-3 rounded-lg">
                                                    <h4 className="font-medium text-sm text-gray-700 mb-2">{categoria}</h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        {caracteristicas.map((caracteristica) => (
                                                            <FormField
                                                                key={caracteristica.id}
                                                                control={form.control}
                                                                name="caracteristicas"
                                                                render={({ field }) => (
                                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                                        <FormControl>
                                                                            <Checkbox
                                                                                checked={field.value?.includes(caracteristica.id)}
                                                                                onCheckedChange={(checked) => {
                                                                                    const updatedValue = checked
                                                                                        ? [...field.value, caracteristica.id]
                                                                                        : field.value?.filter((value: string) => value !== caracteristica.id);
                                                                                    field.onChange(updatedValue);
                                                                                }}
                                                                            />
                                                                        </FormControl>
                                                                        <FormLabel className="text-xs sm:text-sm font-normal cursor-pointer flex-1">
                                                                            {caracteristica.label}
                                                                        </FormLabel>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Capacidad y Precios */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Users className="h-5 w-5" />
                                Capacidad y Precios
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                                <FormField
                                    control={form.control}
                                    name="precio_noche"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm sm:text-base">Precio por Noche (Bs)</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                                        Bs
                                                    </span>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        placeholder="0.00"
                                                        className="pl-10 text-sm sm:text-base"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="max_huespedes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2 text-sm sm:text-base">
                                                <Users className="h-4 w-4" />
                                                Máx. Huéspedes
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    className="text-sm sm:text-base"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="cant_hab"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2 text-sm sm:text-base">
                                                <Bed className="h-4 w-4" />
                                                Habitaciones
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    className="text-sm sm:text-base"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="cant_bath"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2 text-sm sm:text-base">
                                                <Bath className="h-4 w-4" />
                                                Baños
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    className="text-sm sm:text-base"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <FormField
                                    control={form.control}
                                    name="pets"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="flex items-center gap-2 text-sm sm:text-base">
                                                    <Dog className="h-4 w-4" />
                                                    ¿Se admiten mascotas?
                                                </FormLabel>
                                                <FormDescription className="text-xs sm:text-sm">
                                                    Permite que los huéspedes traigan mascotas
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-sm sm:text-base">
                                                    Disponible para Reservas
                                                </FormLabel>
                                                <FormDescription className="text-xs sm:text-sm">
                                                    Activa si la propiedad está disponible
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Ubicación en Mapa */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <MapPin className="h-5 w-5" />
                                Ubicación en el Mapa
                            </CardTitle>
                            <CardDescription className="text-sm sm:text-base">
                                Selecciona la ubicación exacta para que los huéspedes puedan encontrarte
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <InteractivePropertyMap
                                onLocationSelected={setUbicacion}
                                ubicacionActual={
                                    propiedad ? {
                                        latitud: propiedad.latitud,
                                        longitud: propiedad.longitud,
                                        direccion_completa: propiedad.direccion_completa
                                    } : undefined
                                }
                            />
                        </CardContent>
                    </Card>

                    {/* Fotos */}
                    {(isEditing || propiedad) && (
                        <PhotoUpload
                            propiedadId={propiedad?.id}
                            existingFiles={propiedad?.files || []}
                            maxFiles={10}
                            mode={propiedad ? 'edit' : 'create'}
                        />
                    )}

                    {/* Acciones */}
                    <Card>
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onCancel}
                                    className="min-w-[120px] text-sm sm:text-base"
                                    disabled={isSubmitting}
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="min-w-[120px] bg-habita-primary hover:bg-habita-primary/90 text-sm sm:text-base"
                                    disabled={isSubmitting} // ✅ SOLO deshabilitado durante envío
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4 mr-2" />
                                    )}
                                    {isEditing ? 'Actualizar' : 'Crear'} Propiedad
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </Form>
        </div>
    );
};

export default PropiedadForm;