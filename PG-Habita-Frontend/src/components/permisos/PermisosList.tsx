import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Loader2 } from 'lucide-react';
import { Permiso } from '@/types/auth';

interface PermisosListProps {
    permisos: Permiso[];
    isLoading: boolean;
    onEdit: (permiso: Permiso) => void;
    onDelete: (id: number) => void;
}

const PermisosList: React.FC<PermisosListProps> = ({ permisos, isLoading, onEdit, onDelete }) => {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-habita-primary" />
                <span className="ml-2">Cargando permisos...</span>
            </div>
        );
    }

    if (permisos.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No se encontraron permisos. Crea el primer permiso para comenzar.
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {permisos.map((permiso) => (
                        <TableRow key={permiso.id}>
                            <TableCell className="font-medium">{permiso.nombre}</TableCell>
                            <TableCell className="max-w-md">
                                {permiso.descipcion || 'Sin descripción'}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onEdit(permiso)}
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onDelete(permiso.id)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default PermisosList;