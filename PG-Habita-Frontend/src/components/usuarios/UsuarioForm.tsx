import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UsuarioFormData, User } from '@/types/auth';
import { useRoles } from '@/hooks/useRoles';
import { useSuscripciones } from '@/hooks/useSuscripciones';

interface UsuarioFormProps {
    usuario?: User | null;
    onSubmit: (data: UsuarioFormData) => void;
    onCancel: () => void;
}

const UsuarioForm: React.FC<UsuarioFormProps> = ({ usuario, onSubmit, onCancel }) => {
    const { roles, isLoading: rolesLoading } = useRoles();
    const { suscripciones, isLoading: suscripcionesLoading } = useSuscripciones();
    const isEditing = !!usuario;

    // 🔥 ESQUEMA CORREGIDO - TELÉFONO REQUERIDO
    const usuarioSchema = z.object({
        username: z.string().min(1, 'El username es requerido'),
        correo: z.string().email('El correo debe ser válido'),
        first_name: z.string().min(1, 'El nombre es requerido'),
        last_name: z.string().min(1, 'El apellido es requerido'),
        N_Cel: z.string().min(1, 'El teléfono es requerido'), // 🔥 AHORA REQUERIDO
        fecha_Nac: z.string().min(1, 'La fecha de nacimiento es requerida'), // 🔥 AHORA REQUERIDO
        rol_id: z.number().min(1, 'Debe seleccionar un rol'),
        suscripcion_id: z.number().optional().nullable(),
        password: isEditing
            ? z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional().or(z.literal(''))
            : z.string().min(6, 'La contraseña es requerida y debe tener al menos 6 caracteres'),
        is_active: z.boolean().default(true),
    });

    type FormValues = z.infer<typeof usuarioSchema>;

    const form = useForm<FormValues>({
        resolver: zodResolver(usuarioSchema),
        defaultValues: {
            username: usuario?.username || '',
            correo: usuario?.correo || '',
            first_name: usuario?.first_name || '',
            last_name: usuario?.last_name || '',
            N_Cel: usuario?.N_Cel || '',
            fecha_Nac: usuario?.fecha_Nac || '',
            rol_id: usuario?.rol?.id || 0,
            suscripcion_id: usuario?.suscripcion?.id || null,
            password: '',
            is_active: usuario?.is_active ?? true,
        },
    });

    const handleSubmit = (formData: FormValues) => {
        console.log('📤 Datos del formulario:', formData);

        // 🔥 PREPARAR DATOS PARA LA API
        const apiData: UsuarioFormData = {
            username: formData.username.trim(),
            correo: formData.correo.trim(),
            first_name: formData.first_name.trim(),
            last_name: formData.last_name.trim(),
            N_Cel: formData.N_Cel.trim(), // 🔥 TELÉFONO SIEMPRE ENVIADO
            fecha_Nac: formData.fecha_Nac, // 🔥 FECHA SIEMPRE ENVIADA
            rol_id: formData.rol_id,
            suscripcion_id: formData.suscripcion_id || undefined,
            is_active: formData.is_active,
            // 🔥 PASSWORD: Si está vacío en edición, usar valor por defecto
            password: formData.password && formData.password.trim() !== ''
                ? formData.password
                : (isEditing ? undefined : "pass123")
        };

        console.log('🎯 Datos para API:', apiData);
        onSubmit(apiData);
    };

    return (
        <div className="space-y-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    {/* Información Personal */}
                    <Card className="shadow-lg border-2 border-gray-200">
                        <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-b-2 border-blue-200">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <div className="p-2 bg-blue-500 rounded-lg">
                                    <span className="text-white text-sm">👤</span>
                                </div>
                                Información Personal
                            </CardTitle>
                            <CardDescription>Datos básicos del usuario</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="first_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold text-gray-900">Nombre *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ingrese el nombre"
                                                    className="border-2 border-gray-300 focus:border-blue-500 shadow-sm"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="last_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold text-gray-900">Apellido *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ingrese el apellido"
                                                    className="border-2 border-gray-300 focus:border-blue-500 shadow-sm"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold text-gray-900">Username *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Nombre de usuario único"
                                                    className="border-2 border-gray-300 focus:border-blue-500 shadow-sm"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Identificador único para el sistema
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="correo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold text-gray-900">Correo Electrónico *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    placeholder="usuario@ejemplo.com"
                                                    className="border-2 border-gray-300 focus:border-blue-500 shadow-sm"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* 🔥 TELÉFONO - AHORA REQUERIDO */}
                                <FormField
                                    control={form.control}
                                    name="N_Cel"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold text-gray-900">Teléfono *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ej: 77314104"
                                                    className="border-2 border-gray-300 focus:border-blue-500 shadow-sm"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Número de contacto importante
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* 🔥 FECHA DE NACIMIENTO - AHORA REQUERIDA */}
                                <FormField
                                    control={form.control}
                                    name="fecha_Nac"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold text-gray-900">Fecha de Nacimiento *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="date"
                                                    className="border-2 border-gray-300 focus:border-blue-500 shadow-sm"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* CAMPO PASSWORD */}
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold text-gray-900">
                                            {isEditing ? 'Nueva Contraseña' : 'Contraseña *'}
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder={isEditing ? "Dejar en blanco para mantener actual" : "Mínimo 6 caracteres"}
                                                className="border-2 border-gray-300 focus:border-blue-500 shadow-sm"
                                                {...field}
                                                value={field.value || ''}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            {isEditing
                                                ? 'Ingrese nueva contraseña (mínimo 6 caracteres) o deje en blanco para mantener la actual'
                                                : 'Contraseña inicial para el usuario (mínimo 6 caracteres)'
                                            }
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Configuración de Cuenta */}
                    <Card className="shadow-lg border-2 border-purple-200">
                        <CardHeader className="pb-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-200">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <div className="p-2 bg-purple-500 rounded-lg">
                                    <span className="text-white text-sm">⚙️</span>
                                </div>
                                Configuración de Cuenta
                            </CardTitle>
                            <CardDescription>Roles, suscripciones y estado</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="rol_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold text-gray-900">Rol *</FormLabel>
                                            <Select
                                                onValueChange={(value) => field.onChange(parseInt(value))}
                                                value={field.value?.toString()}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="border-2 border-gray-300 focus:border-purple-500 shadow-sm">
                                                        <SelectValue placeholder="Seleccione un rol" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="border-2 border-gray-200 shadow-lg">
                                                    {rolesLoading ? (
                                                        <SelectItem value="0" disabled>Cargando roles...</SelectItem>
                                                    ) : (
                                                        roles.map((rol) => (
                                                            <SelectItem key={rol.id} value={rol.id.toString()}>
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`w-2 h-2 rounded-full ${
                                                                        rol.nombre.toUpperCase().includes('ADMIN') ? 'bg-purple-500' :
                                                                            rol.nombre.toUpperCase().includes('ANFITRION') ? 'bg-green-500' : 'bg-blue-500'
                                                                    }`}></div>
                                                                    {rol.nombre}
                                                                </div>
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                Define los permisos y acceso del usuario
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="suscripcion_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold text-gray-900">Suscripción</FormLabel>
                                            <Select
                                                onValueChange={(value) => {
                                                    const newValue = value === 'null' ? null : parseInt(value);
                                                    field.onChange(newValue);
                                                }}
                                                value={field.value === null ? 'null' : field.value?.toString()}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="border-2 border-gray-300 focus:border-amber-500 shadow-sm">
                                                        <SelectValue placeholder="Seleccione una suscripción (opcional)" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="border-2 border-gray-200 shadow-lg">
                                                    <SelectItem value="null">Sin suscripción</SelectItem>
                                                    {suscripcionesLoading ? (
                                                        <SelectItem value="loading" disabled>Cargando suscripciones...</SelectItem>
                                                    ) : (
                                                        suscripciones
                                                            .filter(s => s.status === 'Activa')
                                                            .map((suscripcion) => (
                                                                <SelectItem key={suscripcion.id} value={suscripcion.id.toString()}>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className={`w-2 h-2 rounded-full ${
                                                                            suscripcion.nombre.toLowerCase().includes('premium') ? 'bg-amber-500' :
                                                                                suscripcion.nombre.toLowerCase().includes('esmeralda') ? 'bg-emerald-500' : 'bg-blue-500'
                                                                        }`}></div>
                                                                        {suscripcion.nombre}
                                                                    </div>
                                                                </SelectItem>
                                                            ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                Plan de suscripción asociado al usuario
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="is_active"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border-2 border-gray-200 p-4 shadow-sm">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel className="font-semibold text-gray-900">
                                                Usuario Activo
                                            </FormLabel>
                                            <FormDescription>
                                                Los usuarios inactivos no pueden acceder al sistema
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Acciones */}
                    <Card className="shadow-lg border-2 border-gray-200">
                        <CardContent className="p-6">
                            <div className="flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onCancel}
                                    className="border-2 border-gray-300 hover:bg-gray-50 shadow-sm px-8 py-3 text-lg font-semibold"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-gradient-to-br from-habita-primary to-red-600 hover:from-habita-primary/90 hover:to-red-600/90
                           shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-3 text-lg font-semibold"
                                >
                                    {isEditing ? 'Actualizar Usuario' : 'Crear Usuario'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </Form>
        </div>
    );
};

export default UsuarioForm;