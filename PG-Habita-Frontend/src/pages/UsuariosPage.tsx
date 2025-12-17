import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, UserCheck, UserX, TrendingUp } from 'lucide-react';
import UsuariosList from '@/components/usuarios/UsuariosList';
import UsuarioForm from '@/components/usuarios/UsuarioForm';
import { useUsuarios } from '@/hooks/useUsuarios';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types/auth';

const UsuariosPage: React.FC = () => {
    const { usuarios, isLoading, createUsuario, updateUsuario, deleteUsuario } = useUsuarios();
    const [showForm, setShowForm] = React.useState(false);
    const [editingUsuario, setEditingUsuario] = React.useState<User | null>(null);

    const handleEdit = (usuario: User) => { // Usar User
        setEditingUsuario(usuario);
        setShowForm(true);
    };

    const handleCreate = () => {
        setEditingUsuario(null);
        setShowForm(true);
    };

    const handleFormSubmit = (data: any) => {
        if (editingUsuario) {
            updateUsuario({ id: editingUsuario.id, data });
        } else {
            createUsuario(data);
        }
        setShowForm(false);
        setEditingUsuario(null);
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingUsuario(null);
    };

    // Calcular estadísticas
    const stats = {
        total: usuarios?.length || 0,
        activos: usuarios?.filter(u => u.is_active)?.length || 0,
        inactivos: usuarios?.filter(u => !u.is_active)?.length || 0,
        administradores: usuarios?.filter(u =>
            u.role && ['ADMIN', 'SUPERUSER', 'SUPERADMIN'].includes(u.role.toUpperCase())
        )?.length || 0,
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header con estadísticas */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-2xl border-2 border-gray-100">
                        <div className="p-3 bg-gradient-to-br from-habita-primary to-red-600 rounded-xl shadow-lg ring-2 ring-habita-primary/20">
                            <Users className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                Gestión de Usuarios
                            </h1>
                            <p className="text-gray-600 mt-1 text-lg">
                                Administra los usuarios y sus permisos en la plataforma
                            </p>
                        </div>
                    </div>

                    {/* Tarjetas de estadísticas */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-2xl shadow-xl border-2 border-blue-100 hover:shadow-2xl transition-all duration-300">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-100 rounded-xl shadow-md border border-blue-200">
                                    <Users className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                                    <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl shadow-xl border-2 border-green-100 hover:shadow-2xl transition-all duration-300">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-green-100 rounded-xl shadow-md border border-green-200">
                                    <UserCheck className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-900">{stats.activos}</p>
                                    <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl shadow-xl border-2 border-gray-100 hover:shadow-2xl transition-all duration-300">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-gray-100 rounded-xl shadow-md border border-gray-200">
                                    <UserX className="h-5 w-5 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-900">{stats.inactivos}</p>
                                    <p className="text-sm font-medium text-gray-600">Usuarios Inactivos</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl shadow-xl border-2 border-purple-100 hover:shadow-2xl transition-all duration-300">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-purple-100 rounded-xl shadow-md border border-purple-200">
                                    <TrendingUp className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-900">{stats.administradores}</p>
                                    <p className="text-sm font-medium text-gray-600">Administradores</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Button
                    onClick={handleCreate}
                    className="bg-habita-primary hover:bg-habita-primary/90 shadow-2xl hover:shadow-3xl
                   transition-all duration-300 h-14 px-8 text-lg font-semibold border-2 border-habita-primary/20"
                >
                    <Plus className="w-6 h-6 mr-3" />
                    Nuevo Usuario
                </Button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Sección Lista */}
                <div className={`${showForm ? 'xl:col-span-2' : 'xl:col-span-3'}`}>
                    <Card className="shadow-2xl border-2 border-gray-200 overflow-hidden hover:shadow-3xl transition-all duration-300">
                        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b-2 border-gray-300 pb-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-habita-primary/10 rounded-xl border-2 border-habita-primary/30 shadow-lg">
                                        <Users className="h-6 w-6 text-habita-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-bold text-gray-900">
                                            Lista de Usuarios
                                        </CardTitle>
                                        <CardDescription className="text-lg">
                                            {usuarios?.length || 0} usuarios registrados en el sistema
                                        </CardDescription>
                                    </div>
                                </div>
                                {!showForm && (
                                    <Button
                                        onClick={handleCreate}
                                        variant="outline"
                                        className="border-2 border-habita-primary text-habita-primary hover:bg-habita-primary hover:text-white shadow-lg hover:shadow-xl px-6"
                                    >
                                        <Plus className="w-5 h-5 mr-2" />
                                        Agregar
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <UsuariosList
                                usuarios={usuarios || []}
                                isLoading={isLoading}
                                onEdit={handleEdit}
                                onDelete={deleteUsuario}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Sección Formulario */}
                {showForm && (
                    <div className="xl:col-span-1">
                        <Card className="shadow-3xl border-2 border-habita-primary/20 sticky top-8 overflow-hidden hover:shadow-4xl transition-all duration-300">
                            <CardHeader className="bg-gradient-to-r from-habita-primary/15 to-habita-primary/10 border-b-2 border-habita-primary/30 pb-5">
                                <CardTitle className="flex items-center gap-4 text-2xl">
                                    <div className="p-3 bg-habita-primary rounded-xl shadow-lg border-2 border-habita-primary/30">
                                        <Plus className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        {editingUsuario ? 'Editar Usuario' : 'Crear Usuario'}
                                        <CardDescription className="text-gray-700 mt-2 text-base">
                                            {editingUsuario
                                                ? 'Modifica la información del usuario seleccionado'
                                                : 'Completa la información para crear un nuevo usuario'
                                            }
                                        </CardDescription>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 bg-gradient-to-b from-white to-gray-50/70">
                                <UsuarioForm
                                    usuario={editingUsuario}
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

export default UsuariosPage;