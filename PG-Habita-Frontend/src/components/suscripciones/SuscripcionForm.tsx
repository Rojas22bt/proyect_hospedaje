import React from 'react';
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
import { Suscripcion, SuscripcionFormData } from '@/types/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Schema con transformación para precio
const suscripcionSchema = z.object({
    nombre: z.string().min(1, 'El nombre es requerido').max(50, 'El nombre no puede tener más de 50 caracteres'),
    descripcion: z.string().optional(),
    precio_mensual: z.union([
        z.string().transform((val) => parseFloat(val) || 0),
        z.number().min(0, 'El precio debe ser mayor o igual a 0')
    ]),
    status: z.enum(['Activa', 'Inactiva']),
});

interface SuscripcionFormProps {
    suscripcion?: Suscripcion | null;
    onSubmit: (data: SuscripcionFormData) => void;
    onCancel: () => void;
}

const SuscripcionForm: React.FC<SuscripcionFormProps> = ({ suscripcion, onSubmit, onCancel }) => {
    const form = useForm<SuscripcionFormData>({
        resolver: zodResolver(suscripcionSchema),
        defaultValues: {
            nombre: suscripcion?.nombre || '',
            descripcion: suscripcion?.descripcion || '',
            precio_mensual: suscripcion?.precio_mensual || 0,
            status: suscripcion?.status || 'Activa',
        },
    });

    const precioMensual = form.watch('precio_mensual');

    // Función mejorada para manejar precios
    const formatPriceForDisplay = (price: number | string): string => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return numPrice.toFixed(2);
    };

    const calcularPrecioSemestral = (precio: number | string) => {
        const numPrecio = typeof precio === 'string' ? parseFloat(precio) : precio;
        return (numPrecio * 6) * 0.85;
    };

    const calcularPrecioAnual = (precio: number | string) => {
        const numPrecio = typeof precio === 'string' ? parseFloat(precio) : precio;
        return (numPrecio * 12) * 0.70;
    };

    const handleSubmit = (data: SuscripcionFormData) => {
        // Asegurar que precio_mensual sea number
        const processedData = {
            ...data,
            precio_mensual: typeof data.precio_mensual === 'string'
                ? parseFloat(data.precio_mensual)
                : data.precio_mensual
        };
        onSubmit(processedData);
    };

    return (
        <div className="space-y-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    {/* Información Básica */}
                    <Card className="shadow-lg border border-gray-200">
                        <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                            <CardTitle className="text-lg font-semibold">Información Básica</CardTitle>
                            <CardDescription>Configura los detalles principales del plan</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            <FormField
                                control={form.control}
                                name="nombre"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold text-gray-900">Nombre del Plan</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ej: Básica, Premium, Esmeralda..."
                                                className="border-gray-300 focus:border-habita-primary shadow-sm"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            El nombre debe ser único y fácil de reconocer para los usuarios
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
                                        <FormLabel className="font-semibold text-gray-900">Descripción</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe los beneficios y características que incluye este plan..."
                                                className="resize-none border-gray-300 focus:border-habita-primary shadow-sm min-h-[80px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Esta información ayuda a los usuarios a entender los beneficios del plan
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Precios y Estado */}
                    <Card className="shadow-lg border border-gray-200">
                        <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                            <CardTitle className="text-lg font-semibold">Precios y Estado</CardTitle>
                            <CardDescription>Configura el precio base y disponibilidad</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <FormField
                                control={form.control}
                                name="precio_mensual"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold text-gray-900">Precio Mensual Base (Bs)</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                          Bs
                        </span>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    placeholder="0.00"
                                                    className="pl-8 border-gray-300 focus:border-habita-primary shadow-sm"
                                                    value={field.value}
                                                    onChange={(e) => {
                                                        // Permitir string para mejor UX, Zod lo transformará a number
                                                        field.onChange(e.target.value);
                                                    }}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormDescription>
                                            Precio base mensual. Los precios con descuento se calculan automáticamente
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Precios Calculados con mejor diseño */}
                            {(precioMensual && (typeof precioMensual === 'number' ? precioMensual > 0 : parseFloat(precioMensual) > 0)) && (
                                <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-4 space-y-3 border border-blue-100 shadow-sm">
                                    <h4 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        Precios Calculados Automáticamente
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="text-center p-3 bg-white rounded-lg border border-green-200 shadow-sm">
                                            <div className="font-bold text-green-700 text-lg">
                                                ${formatPriceForDisplay(calcularPrecioSemestral(precioMensual))}
                                            </div>
                                            <div className="text-green-600 text-xs font-medium">Semestral</div>
                                            <div className="text-xs text-gray-500 mt-1">15% de descuento</div>
                                        </div>
                                        <div className="text-center p-3 bg-white rounded-lg border border-blue-200 shadow-sm">
                                            <div className="font-bold text-blue-700 text-lg">
                                                ${formatPriceForDisplay(calcularPrecioAnual(precioMensual))}
                                            </div>
                                            <div className="text-blue-600 text-xs font-medium">Anual</div>
                                            <div className="text-xs text-gray-500 mt-1">30% de descuento</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold text-gray-900">Estado del Plan</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="border-gray-300 focus:border-habita-primary shadow-sm">
                                                    <SelectValue placeholder="Selecciona el estado" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="shadow-lg">
                                                <SelectItem value="Activa" className="flex items-center gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                        <span>Activa</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="Inactiva" className="flex items-center gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                                        <span>Inactiva</span>
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Los planes inactivos no estarán disponibles para nuevos usuarios
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Acciones con mejor diseño */}
                    <Card className="shadow-lg border border-gray-200">
                        <CardContent className="p-6">
                            <div className="flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onCancel}
                                    className="border-gray-300 hover:bg-gray-50 shadow-sm px-6"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-habita-primary hover:bg-habita-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 px-8"
                                >
                                    {suscripcion ? 'Actualizar Suscripción' : 'Crear Suscripción'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </Form>
        </div>
    );
};

export default SuscripcionForm;