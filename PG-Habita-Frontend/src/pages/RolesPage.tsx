import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import RolesList from '@/components/roles/RolesList';
import RolForm from '@/components/roles/RolForm.tsx';
import { useRoles } from '@/hooks/useRoles';

const RolesPage: React.FC = () => {
    const { roles, isLoading, createRol, updateRol, deleteRol } = useRoles();
    const [showForm, setShowForm] = React.useState(false);
    const [editingRol, setEditingRol] = React.useState<any>(null);

    const handleEdit = (rol: any) => {
        setEditingRol(rol);
        setShowForm(true);
    };

    const handleCreate = () => {
        setEditingRol(null);
        setShowForm(true);
    };

    const handleFormSubmit = (data: any) => {
        if (editingRol) {
            updateRol({ id: editingRol.id, data });
        } else {
            createRol(data);
        }
        setShowForm(false);
        setEditingRol(null);
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingRol(null);
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gestión de Roles</h1>
                    <p className="text-gray-600 mt-2">
                        Administra los roles y sus permisos del sistema
                    </p>
                </div>
                <Button onClick={handleCreate} className="bg-habita-primary hover:bg-habita-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Rol
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className={`${showForm ? 'lg:col-span-2' : 'lg:col-span-4'}`}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Lista de Roles</CardTitle>
                            <CardDescription>
                                {roles.length} roles encontrados en el sistema
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RolesList
                                roles={roles}
                                isLoading={isLoading}
                                onEdit={handleEdit}
                                onDelete={deleteRol}
                            />
                        </CardContent>
                    </Card>
                </div>

                {showForm && (
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {editingRol ? 'Editar Rol' : 'Crear Nuevo Rol'}
                                </CardTitle>
                                <CardDescription>
                                    {editingRol
                                        ? 'Modifica la información del rol seleccionado'
                                        : 'Completa la información para crear un nuevo rol'
                                    }
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RolForm
                                    rol={editingRol}
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

export default RolesPage;