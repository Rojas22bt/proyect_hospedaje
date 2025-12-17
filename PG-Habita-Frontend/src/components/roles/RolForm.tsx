import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // Ya existe
import { Checkbox } from '@/components/ui/checkbox'; // Ya existe
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { Rol, Permiso, RolFormData } from '@/types/auth';
import { usePermisos } from '@/hooks/usePermisos';

const rolSchema = z.object({
    nombre: z.string().min(1, 'El nombre es requerido').max(20, 'El nombre no puede tener más de 20 caracteres'),
    descripcion: z.string().min(1, 'La descripción es requerida'),
    permisos_ids: z.array(z.number()).min(1, 'Selecciona al menos un permiso'), // Cambiar a permisos_ids
});

interface RolFormProps {
    rol?: Rol | null;
    onSubmit: (data: RolFormData) => void;
    onCancel: () => void;
}

const RolForm: React.FC<RolFormProps> = ({ rol, onSubmit, onCancel }) => {
    const { permisos, isLoading: permisosLoading } = usePermisos();

    const form = useForm<RolFormData>({
        resolver: zodResolver(rolSchema),
        defaultValues: {
            nombre: rol?.nombre || '',
            descripcion: rol?.descripcion || '',
            permisos_ids: rol?.permisos.map(p => p.id) || [], // Cambiar a permisos_ids
        },
    });

    const handleSubmit = (data: RolFormData) => {
        onSubmit(data);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="nombre"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre del Rol</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej: Administrador, Moderador..." {...field} />
                            </FormControl>
                            <FormDescription>
                                El nombre debe ser único y descriptivo
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
                            <FormLabel>Descripción</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Describe las responsabilidades y funciones de este rol..."
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="permisos_ids"
                    render={() => (
                        <FormItem>
                            <div className="mb-4">
                                <FormLabel>Permisos</FormLabel>
                                <FormDescription>
                                    Selecciona los permisos que tendrá este rol
                                </FormDescription>
                            </div>
                            <div className="space-y-3 max-h-60 overflow-y-auto border rounded-md p-4">
                                {permisosLoading ? (
                                    <div className="text-center py-4 text-gray-500">
                                        Cargando permisos...
                                    </div>
                                ) : (
                                    permisos.map((permiso) => (
                                        <FormField
                                            key={permiso.id}
                                            control={form.control}
                                            name="permisos_ids"
                                            render={({ field }) => {
                                                return (
                                                    <FormItem
                                                        key={permiso.id}
                                                        className="flex flex-row items-start space-x-3 space-y-0"
                                                    >
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(permiso.id)}
                                                                onCheckedChange={(checked) => {
                                                                    return checked
                                                                        ? field.onChange([...field.value, permiso.id])
                                                                        : field.onChange(
                                                                            field.value?.filter(
                                                                                (value) => value !== permiso.id
                                                                            )
                                                                        );
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <div className="space-y-1 leading-none">
                                                            <FormLabel className="font-normal cursor-pointer">
                                                                {permiso.nombre}
                                                            </FormLabel>
                                                            {permiso.descipcion && (
                                                                <FormDescription className="text-xs">
                                                                    {permiso.descipcion}
                                                                </FormDescription>
                                                            )}
                                                        </div>
                                                    </FormItem>
                                                );
                                            }}
                                        />
                                    ))
                                )}
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancelar
                    </Button>
                    <Button type="submit" className="bg-habita-primary hover:bg-habita-primary/90">
                        {rol ? 'Actualizar Rol' : 'Crear Rol'}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default RolForm;