import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, CreditCard, BadgeCheck, TrendingUp } from 'lucide-react';
import SuscripcionesList from '@/components/suscripciones/SuscripcionesList';
import SuscripcionForm from '@/components/suscripciones/SuscripcionForm';
import { useSuscripciones } from '@/hooks/useSuscripciones';
import { Badge } from '@/components/ui/badge';

const SuscripcionesPage: React.FC = () => {
    const { suscripciones, isLoading, createSuscripcion, updateSuscripcion, deleteSuscripcion } = useSuscripciones();
    const [showForm, setShowForm] = React.useState(false);
    const [editingSuscripcion, setEditingSuscripcion] = React.useState<any>(null);

    const handleEdit = (suscripcion: any) => {
        setEditingSuscripcion(suscripcion);
        setShowForm(true);
    };

    const handleCreate = () => {
        setEditingSuscripcion(null);
        setShowForm(true);
    };

    const handleFormSubmit = (data: any) => {
        if (editingSuscripcion) {
            updateSuscripcion({ id: editingSuscripcion.id, data });
        } else {
            createSuscripcion(data);
        }
        setShowForm(false);
        setEditingSuscripcion(null);
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingSuscripcion(null);
    };

    // Calcular estadísticas CON VALIDACIÓN
    const stats = {
        total: suscripciones?.length || 0,
        activas: suscripciones?.filter(s => s?.status === 'Activa')?.length || 0,
        inactivas: suscripciones?.filter(s => s?.status === 'Inactiva')?.length || 0,
        ingresosMensuales: suscripciones?.reduce((sum, s) => {
            const precio = s?.precio_mensual;
            return sum + (typeof precio === 'number' ? precio : 0);
        }, 0) || 0
    };

    // Función segura para formatear números
    const formatCurrencySafe = (amount: number | undefined | null): string => {
        if (amount == null || isNaN(amount)) return '$0.00';
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount);
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header con sombras más pronunciadas */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-2xl border-2 border-gray-100">
                        <div className="p-3 bg-gradient-to-br from-habita-primary to-red-600 rounded-xl shadow-lg ring-2 ring-habita-primary/20">
                            <CreditCard className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                Gestión de Suscripciones
                            </h1>
                            <p className="text-gray-600 mt-1 text-lg">
                                Administra los planes de suscripción disponibles para los usuarios
                            </p>
                        </div>
                    </div>

                    {/* Tarjetas de estadísticas con sombras intensas y bordes */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-2xl shadow-xl border-2 border-blue-100 hover:shadow-2xl transition-all duration-300">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-100 rounded-xl shadow-md border border-blue-200">
                                    <CreditCard className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                                    <p className="text-sm font-medium text-gray-600">Total Planes</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl shadow-xl border-2 border-green-100 hover:shadow-2xl transition-all duration-300">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-green-100 rounded-xl shadow-md border border-green-200">
                                    <BadgeCheck className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-900">{stats.activas}</p>
                                    <p className="text-sm font-medium text-gray-600">Activas</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl shadow-xl border-2 border-gray-100 hover:shadow-2xl transition-all duration-300">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-gray-100 rounded-xl shadow-md border border-gray-200">
                                    <TrendingUp className="h-5 w-5 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-900">{stats.inactivas}</p>
                                    <p className="text-sm font-medium text-gray-600">Inactivas</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl shadow-xl border-2 border-amber-100 hover:shadow-2xl transition-all duration-300">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-amber-100 rounded-xl shadow-md border border-amber-200">
                                    <span className="text-lg font-bold text-amber-600">$</span>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {formatCurrencySafe(stats.ingresosMensuales)}
                                    </p>
                                    <p className="text-sm font-medium text-gray-600">Ingreso Mensual</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Button
                    onClick={handleCreate}
                    className="bg-habita-primary hover:bg-habita-primary/90 shadow-2xl hover:shadow-3xl transition-all duration-300 h-14 px-8 text-lg font-semibold border-2 border-habita-primary/20"
                >
                    <Plus className="w-6 h-6 mr-3" />
                    Nueva Suscripción
                </Button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Sección Lista con sombra intensa */}
                <div className={`${showForm ? 'xl:col-span-2' : 'xl:col-span-3'}`}>
                    <Card className="shadow-2xl border-2 border-gray-200 overflow-hidden hover:shadow-3xl transition-all duration-300">
                        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b-2 border-gray-300 pb-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-habita-primary/10 rounded-xl border-2 border-habita-primary/30 shadow-lg">
                                        <BadgeCheck className="h-6 w-6 text-habita-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-bold text-gray-900">
                                            Lista de Suscripciones
                                        </CardTitle>
                                        <CardDescription className="text-lg">
                                            {suscripciones?.length || 0} planes de suscripción encontrados
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
                            <SuscripcionesList
                                suscripciones={suscripciones || []}
                                isLoading={isLoading}
                                onEdit={handleEdit}
                                onDelete={deleteSuscripcion}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Sección Formulario con sombra muy pronunciada */}
                {showForm && (
                    <div className="xl:col-span-1">
                        <Card className="shadow-3xl border-2 border-habita-primary/20 sticky top-8 overflow-hidden hover:shadow-4xl transition-all duration-300">
                            <CardHeader className="bg-gradient-to-r from-habita-primary/15 to-habita-primary/10 border-b-2 border-habita-primary/30 pb-5">
                                <CardTitle className="flex items-center gap-4 text-2xl">
                                    <div className="p-3 bg-habita-primary rounded-xl shadow-lg border-2 border-habita-primary/30">
                                        <Plus className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        {editingSuscripcion ? 'Editar Suscripción' : 'Crear Suscripción'}
                                        <CardDescription className="text-gray-700 mt-2 text-base">
                                            {editingSuscripcion
                                                ? 'Modifica la información del plan seleccionado'
                                                : 'Completa la información para crear un nuevo plan'
                                            }
                                        </CardDescription>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 bg-gradient-to-b from-white to-gray-50/70">
                                <SuscripcionForm
                                    suscripcion={editingSuscripcion}
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

export default SuscripcionesPage;