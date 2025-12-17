import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Filter, Eye, EyeOff } from 'lucide-react';
import { usePropiedades } from '@/hooks/usePropiedades';
import PropiedadesList from '@/components/propiedades/PropiedadesList';
import PropiedadForm from '@/components/propiedades/PropiedadForm';
import { Propiedad, PropiedadFormData } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import DarBajaPropiedad from '@/components/propiedades/DarBajaPropiedad';

const PropiedadesPage: React.FC = () => {
    const { user } = useAuth();
    const {
        propiedades,
        isLoading,
        createPropiedad,
        updatePropiedad,
        deletePropiedad,
        darBajaPropiedad,
        reactivarPropiedad,
        isCreating,
        isUpdating,
        isDeleting,
    } = usePropiedades();

    const [showForm, setShowForm] = useState(false);
    const [editingPropiedad, setEditingPropiedad] = useState<Propiedad | null>(null);
    const [bajaPropiedad, setBajaPropiedad] = useState<Propiedad | null>(null);
    const [showSoloDeshabilitadas, setShowSoloDeshabilitadas] = useState(false);

    // 🔥 FILTRAR PROPIEDADES SEGÚN EL SWITCH
    const propiedadesFiltradas = propiedades.filter(prop => {
        if (showSoloDeshabilitadas) {
            return !prop.esta_disponible; // Solo mostrar deshabilitadas
        }
        return prop.esta_disponible; // Solo mostrar disponibles (por defecto)
    });

    const handleCreate = (data: PropiedadFormData) => {
        createPropiedad(data, {
            onSuccess: () => {
                setShowForm(false);
            },
        });
    };

    const handleUpdate = (data: PropiedadFormData) => {
        if (editingPropiedad) {
            updatePropiedad(
                { id: editingPropiedad.id, data },
                {
                    onSuccess: () => {
                        setEditingPropiedad(null);
                    },
                }
            );
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de que quieres eliminar esta propiedad?')) {
            deletePropiedad(id);
        }
    };

    // 🔥 FUNCIÓN PARA DAR DE BAJA
    const handleDarBaja = (propiedad: Propiedad) => {
        setBajaPropiedad(propiedad);
    };

    // 🔥 FUNCIÓN PARA REACTIVAR
    const handleReactivar = (id: number) => {
        if (confirm('¿Estás seguro de que quieres reactivar esta propiedad?')) {
            reactivarPropiedad(id);
        }
    };

    // 🔥 FUNCIÓN PARA CONFIRMAR BAJA
    const handleConfirmarBaja = (bajaData: any) => {
        if (bajaPropiedad) {
            darBajaPropiedad(
                { id: bajaPropiedad.id, data: bajaData },
                {
                    onSuccess: () => {
                        setBajaPropiedad(null);
                    },
                }
            );
        }
    };

    // 🔥 FUNCIÓN PARA EDITAR PROPIEDAD
    const handleEdit = (propiedad: Propiedad) => {
        setEditingPropiedad(propiedad);
        setShowForm(false);
    };

    // 🔥 FUNCIÓN PARA CREAR NUEVA PROPIEDAD
    const handleCreateClick = () => {
        setEditingPropiedad(null);
        setShowForm(true);
    };

    if (showForm) {
        return (
            <div className="container mx-auto py-6">
                <PropiedadForm
                    onSubmit={handleCreate}
                    onCancel={() => setShowForm(false)}
                    isEditing={false}
                />
            </div>
        );
    }

    if (editingPropiedad) {
        return (
            <div className="container mx-auto py-6">
                <PropiedadForm
                    propiedad={editingPropiedad}
                    onSubmit={handleUpdate}
                    onCancel={() => setEditingPropiedad(null)}
                    isEditing={true}
                />
            </div>
        );
    }

    if (bajaPropiedad) {
        return (
            <div className="container mx-auto py-6">
                <DarBajaPropiedad
                    propiedad={bajaPropiedad}
                    onBajaSuccess={handleConfirmarBaja}
                    onCancel={() => setBajaPropiedad(null)}
                />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header con controles */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle className="text-2xl font-bold">
                                Mis Propiedades
                            </CardTitle>
                            <CardDescription>
                                Gestiona todas tus propiedades registradas
                            </CardDescription>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            {/* Switch para mostrar deshabilitadas */}
                            <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg">
                                <Switch
                                    id="show-disabled"
                                    checked={showSoloDeshabilitadas}
                                    onCheckedChange={setShowSoloDeshabilitadas}
                                />
                                <Label htmlFor="show-disabled" className="flex items-center gap-2 cursor-pointer">
                                    {showSoloDeshabilitadas ? (
                                        <EyeOff className="h-4 w-4 text-orange-500" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-green-500" />
                                    )}
                                    {showSoloDeshabilitadas ? 'Mostrando deshabilitadas' : 'Mostrando disponibles'}
                                </Label>
                            </div>

                            {/* Botón para crear nueva propiedad */}
                            {user?.role === 'CLIENT' && (
                                <Button
                                    onClick={handleCreateClick}
                                    className="bg-habita-primary hover:bg-habita-primary/90"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Nueva Propiedad
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    {/* Estadísticas rápidas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="text-2xl font-bold text-blue-700">
                                {propiedades.filter(p => p.esta_disponible).length}
                            </div>
                            <div className="text-sm text-blue-600">Propiedades activas</div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                            <div className="text-2xl font-bold text-orange-700">
                                {propiedades.filter(p => !p.esta_disponible).length}
                            </div>
                            <div className="text-sm text-orange-600">Propiedades deshabilitadas</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <div className="text-2xl font-bold text-green-700">
                                {propiedades.length}
                            </div>
                            <div className="text-sm text-green-600">Total de propiedades</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Lista de propiedades */}
            <PropiedadesList
                propiedades={showSoloDeshabilitadas ? propiedadesFiltradas : propiedades}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDarBaja={handleDarBaja}
                onReactivar={handleReactivar}
            />
        </div>
    );
};

export default PropiedadesPage;