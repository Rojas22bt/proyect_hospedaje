import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Trash2, Loader2, Building, Home, MapPin, Bath, Bed, DollarSign, Ban, RefreshCw } from 'lucide-react';
import { Propiedad } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface PropiedadesListProps {
    propiedades: Propiedad[];
    isLoading: boolean;
    onEdit: (propiedad: Propiedad) => void;
    onDelete: (id: number) => void;
    onDarBaja: (propiedad: Propiedad) => void;
    onReactivar: (id: number) => void;
}

const PropiedadesList: React.FC<PropiedadesListProps> = ({
    propiedades,
    isLoading,
    onEdit,
    onDelete,
    onDarBaja,
    onReactivar
}) => {
    const { user } = useAuth();

    // Filtrar propiedades según permisos
    const filteredPropiedades = user?.is_staff
        ? propiedades
        : propiedades.filter(prop => prop.user === user?.id);

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('es-BO', {
            style: 'currency',
            currency: 'BOB'
        }).format(amount);
    };

    const getTipoIcon = (tipo: string) => {
        switch (tipo) {
            case 'Casa':
                return <Home className="h-4 w-4" />;
            case 'Departamento':
                return <Building className="h-4 w-4" />;
            default:
                return <Building className="h-4 w-4" />;
        }
    };

    const getStatusBadge = (status: boolean, esta_disponible: boolean) => {
        if (!esta_disponible) {
            return (
                <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-0">
                    ⏸️ En Baja
                </Badge>
            );
        }

        return status ? (
            <Badge className="bg-green-500 hover:bg-green-600 text-white border-0">
                ✅ Disponible
            </Badge>
        ) : (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                ⛔ No Disponible
            </Badge>
        );
    };

    if (isLoading) {
        return (
            <Card className="border border-gray-200">
                <CardContent className="flex flex-col justify-center items-center py-20">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
                    <span className="text-gray-600 text-lg font-semibold">Cargando propiedades...</span>
                </CardContent>
            </Card>
        );
    }

    if (filteredPropiedades.length === 0) {
        return (
            <Card className="border border-gray-200">
                <CardContent className="text-center py-20">
                    <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4">
                        <Building className="h-8 w-8 text-blue-600 mx-auto" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {user?.is_staff ? 'No hay propiedades registradas' : 'No tienes propiedades registradas'}
                    </h3>
                    <p className="text-gray-600">
                        {user?.is_staff
                            ? 'Todavía no hay propiedades registradas en la plataforma'
                            : 'Comienza registrando tu primera propiedad para empezar a recibir reservas'
                        }
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {filteredPropiedades.map((propiedad) => (
                <Card
                    key={propiedad.id}
                    className="border border-gray-200 hover:shadow-md transition-shadow"
                >
                    <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                            {/* Información de la Propiedad */}
                            <div className="flex items-start gap-4 flex-1">
                                {/* Icono de la Propiedad */}
                                <div className={cn(
                                    "p-3 rounded-xl",
                                    propiedad.esta_disponible && propiedad.status
                                        ? 'bg-green-100 text-green-600'
                                        : 'bg-orange-100 text-orange-600'
                                )}>
                                    {getTipoIcon(propiedad.tipo)}
                                </div>

                                {/* Detalles de la Propiedad */}
                                <div className="flex-1 space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {propiedad.nombre}
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {getStatusBadge(propiedad.status, propiedad.esta_disponible)}
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                {getTipoIcon(propiedad.tipo)}
                                                <span className="ml-1">{propiedad.tipo}</span>
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Dirección */}
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <MapPin className="h-4 w-4 text-gray-500" />
                                        <span>{propiedad.direccion}</span>
                                    </div>

                                    {/* Descripción */}
                                    <p className="text-gray-700 leading-relaxed">
                                        {propiedad.descripcion}
                                    </p>

                                    {/* Características */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                            <DollarSign className="h-4 w-4 text-green-600" />
                                            <div>
                                                <div className="text-sm text-gray-600">Precio/noche</div>
                                                <div className="font-bold text-green-700">
                                                    {formatCurrency(propiedad.precio_noche)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                            <span className="text-sm">👥</span>
                                            <div>
                                                <div className="text-sm text-gray-600">Huéspedes</div>
                                                <div className="font-bold text-blue-700">
                                                    {propiedad.max_huespedes}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                            <Bed className="h-4 w-4 text-purple-600" />
                                            <div>
                                                <div className="text-sm text-gray-600">Habitaciones</div>
                                                <div className="font-bold text-purple-700">
                                                    {propiedad.cant_hab}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                            <Bath className="h-4 w-4 text-amber-600" />
                                            <div>
                                                <div className="text-sm text-gray-600">Baños</div>
                                                <div className="font-bold text-amber-700">
                                                    {propiedad.cant_bath}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Servicios y Mascotas */}
                                    <div className="flex flex-wrap gap-2">
                                        {propiedad.pets && (
                                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                                                🐾 Admite mascotas
                                            </Badge>
                                        )}
                                        {propiedad.servicios_basicos?.map((servicio, index) => (
                                            <Badge
                                                key={index}
                                                variant="secondary"
                                                className="bg-gray-100 text-gray-700"
                                            >
                                                {servicio}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Acciones */}
                            <div className="flex flex-row lg:flex-col gap-2 lg:min-w-[160px]">
                                <Button
                                    onClick={() => onEdit(propiedad)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white flex-1 lg:flex-none"
                                    size="sm"
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Editar
                                </Button>

                                {/* Botón para dar de baja/reactivar */}
                                {propiedad.esta_disponible ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => onDarBaja(propiedad)}
                                        className="border-orange-300 text-orange-600 hover:bg-orange-50 flex-1 lg:flex-none"
                                        size="sm"
                                    >
                                        <Ban className="w-4 h-4 mr-2" />
                                        Dar de Baja
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline"
                                        onClick={() => onReactivar(propiedad.id)}
                                        className="border-green-300 text-green-600 hover:bg-green-50 flex-1 lg:flex-none"
                                        size="sm"
                                    >
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Reactivar
                                    </Button>
                                )}

                                <Button
                                    variant="outline"
                                    onClick={() => onDelete(propiedad.id)}
                                    className="border-red-300 text-red-600 hover:bg-red-50 flex-1 lg:flex-none"
                                    size="sm"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Eliminar
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default PropiedadesList;