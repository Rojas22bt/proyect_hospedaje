import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import PermisosList from '@/components/permisos/PermisosList';
import PermisoForm from '@/components/permisos/PermisoForm';
import { usePermisos } from '@/hooks/usePermisos';

const PermisosPage: React.FC = () => {
    const { permisos, isLoading, createPermiso, updatePermiso, deletePermiso } = usePermisos();
    const [showForm, setShowForm] = React.useState(false);
    const [editingPermiso, setEditingPermiso] = React.useState<any>(null);

    const handleEdit = (permiso: any) => {
        setEditingPermiso(permiso);
        setShowForm(true);
    };

    const handleCreate = () => {
        setEditingPermiso(null);
        setShowForm(true);
    };

    const handleFormSubmit = (data: any) => {
        if (editingPermiso) {
            updatePermiso({ id: editingPermiso.id, data });
        } else {
            createPermiso(data);
        }
        setShowForm(false);
        setEditingPermiso(null);
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingPermiso(null);
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gestión de Permisos</h1>
                    <p className="text-gray-600 mt-2">
                        Administra los permisos disponibles en el sistema
                    </p>
                </div>
                <Button onClick={handleCreate} className="bg-habita-primary hover:bg-habita-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Permiso
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className={`${showForm ? 'lg:col-span-2' : 'lg:col-span-4'}`}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Lista de Permisos</CardTitle>
                            <CardDescription>
                                {permisos.length} permisos encontrados en el sistema
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PermisosList
                                permisos={permisos}
                                isLoading={isLoading}
                                onEdit={handleEdit}
                                onDelete={deletePermiso}
                            />
                        </CardContent>
                    </Card>
                </div>

                {showForm && (
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {editingPermiso ? 'Editar Permiso' : 'Crear Nuevo Permiso'}
                                </CardTitle>
                                <CardDescription>
                                    {editingPermiso
                                        ? 'Modifica la información del permiso seleccionado'
                                        : 'Completa la información para crear un nuevo permiso'
                                    }
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <PermisoForm
                                    permiso={editingPermiso}
                                    onSubmit={handleFormSubmit}
                                    onCancel={handleFormCancel}
                                />
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PermisosPage;