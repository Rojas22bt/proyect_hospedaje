import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Loader2 } from 'lucide-react';
import { Rol } from '@/types/auth';

interface RolesListProps {
    roles: Rol[];
    isLoading: boolean;
    onEdit: (rol: Rol) => void;
    onDelete: (id: number) => void;
}

const RolesList: React.FC<RolesListProps> = ({ roles, isLoading, onEdit, onDelete }) => {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-habita-primary" />
                <span className="ml-2">Cargando roles...</span>
            </div>
        );
    }

    if (roles.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No se encontraron roles. Crea el primer rol para comenzar.
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
                        <TableHead>Permisos</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {roles.map((rol) => (
                        <TableRow key={rol.id}>
                            <TableCell className="font-medium">{rol.nombre}</TableCell>
                            <TableCell className="max-w-xs truncate">{rol.descripcion}</TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1 max-w-xs">
                                    {rol.permisos.slice(0, 3).map((permiso) => (
                                        <Badge key={permiso.id} variant="secondary" className="text-xs">
                                            {permiso.nombre}
                                        </Badge>
                                    ))}
                                    {rol.permisos.length > 3 && (
                                        <Badge variant="outline" className="text-xs">
                                            +{rol.permisos.length - 3} más
                                        </Badge>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onEdit(rol)}
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onDelete(rol.id)}
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

export default RolesList;