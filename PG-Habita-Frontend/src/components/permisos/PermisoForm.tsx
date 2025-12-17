import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // Ya existe
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { Permiso, PermisoFormData } from '@/types/auth';

const permisoSchema = z.object({
    nombre: z.string().min(1, 'El nombre es requerido').max(40, 'El nombre no puede tener más de 40 caracteres'),
    descipcion: z.string().optional(),
});

interface PermisoFormProps {
    permiso?: Permiso | null;
    onSubmit: (data: PermisoFormData) => void;
    onCancel: () => void;
}

const PermisoForm: React.FC<PermisoFormProps> = ({ permiso, onSubmit, onCancel }) => {
    const form = useForm<PermisoFormData>({
        resolver: zodResolver(permisoSchema),
        defaultValues: {
            nombre: permiso?.nombre || '',
            descipcion: permiso?.descipcion || '',
        },
    });

    const handleSubmit = (data: PermisoFormData) => {
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
                            <FormLabel>Nombre del Permiso</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej: ver_usuarios, crear_roles..." {...field} />
                            </FormControl>
                            <FormDescription>
                                Usa un formato descriptivo como "accion_recurso"
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="descipcion"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descripción</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Describe qué permite hacer este permiso..."
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Esta descripción ayuda a entender el propósito del permiso
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancelar
                    </Button>
                    <Button type="submit" className="bg-habita-primary hover:bg-habita-primary/90">
                        {permiso ? 'Actualizar Permiso' : 'Crear Permiso'}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default PermisoForm;