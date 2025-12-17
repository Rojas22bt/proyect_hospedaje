import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Trash2, Loader2, Crown, Sparkles, Star, Zap, Calendar, DollarSign } from 'lucide-react';
import { Suscripcion } from '@/types/auth';

interface SuscripcionesListProps {
    suscripciones: Suscripcion[];
    isLoading: boolean;
    onEdit: (suscripcion: Suscripcion) => void;
    onDelete: (id: number) => void;
}

const SuscripcionesList: React.FC<SuscripcionesListProps> = ({
                                                                 suscripciones,
                                                                 isLoading,
                                                                 onEdit,
                                                                 onDelete
                                                             }) => {
    const formatCurrency = (amount: number | undefined | null): string => {
        if (amount == null || isNaN(amount)) return '$0.00';
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount);
    };

    const getSubscriptionTheme = (nombre: string) => {
        const lowerNombre = nombre.toLowerCase();
        if (lowerNombre.includes('premium') || lowerNombre.includes('oro')) {
            return {
                icon: <Crown className="h-5 w-5" />,
                gradient: 'from-amber-500 to-yellow-500',
                bgGradient: 'from-amber-50 to-yellow-50',
                border: 'border-amber-200',
                text: 'text-amber-700',
                badge: 'bg-amber-500'
            };
        } else if (lowerNombre.includes('esmeralda') || lowerNombre.includes('diamante')) {
            return {
                icon: <Sparkles className="h-5 w-5" />,
                gradient: 'from-emerald-500 to-green-500',
                bgGradient: 'from-emerald-50 to-green-50',
                border: 'border-emerald-200',
                text: 'text-emerald-700',
                badge: 'bg-emerald-500'
            };
        } else if (lowerNombre.includes('básica') || lowerNombre.includes('basica') || lowerNombre.includes('free')) {
            return {
                icon: <Star className="h-5 w-5" />,
                gradient: 'from-blue-500 to-cyan-500',
                bgGradient: 'from-blue-50 to-cyan-50',
                border: 'border-blue-200',
                text: 'text-blue-700',
                badge: 'bg-blue-500'
            };
        }
        return {
            icon: <Zap className="h-5 w-5" />,
            gradient: 'from-purple-500 to-pink-500',
            bgGradient: 'from-purple-50 to-pink-50',
            border: 'border-purple-200',
            text: 'text-purple-700',
            badge: 'bg-purple-500'
        };
    };

    const getDiscountBadge = (precioMensual: number | undefined, precioCalculado: number | undefined, tipo: string) => {
        if (!precioMensual || !precioCalculado || precioMensual === 0) return null;

        const discount = ((precioMensual * (tipo === 'semestral' ? 6 : 12) - precioCalculado) / (precioMensual * (tipo === 'semestral' ? 6 : 12))) * 100;

        if (discount > 0) {
            return (
                <Badge variant="outline" className="text-xs bg-white text-green-700 border-2 border-green-300 shadow-sm font-bold">
                    🎯 {Math.round(discount)}% OFF
                </Badge>
            );
        }
        return null;
    };

    if (isLoading) {
        return (
            <Card className="shadow-2xl border-2 border-gray-300 bg-gradient-to-br from-gray-50 to-white">
                <CardContent className="flex flex-col justify-center items-center py-20">
                    <Loader2 className="w-12 h-12 animate-spin text-habita-primary mb-4" />
                    <span className="text-gray-600 text-lg font-semibold">Cargando suscripciones...</span>
                    <p className="text-gray-500 mt-2">Preparando los planes para ti</p>
                </CardContent>
            </Card>
        );
    }

    if (suscripciones.length === 0) {
        return (
            <Card className="shadow-2xl border-2 border-gray-300 bg-gradient-to-br from-gray-50 to-white">
                <CardContent className="text-center py-20">
                    <div className="p-5 bg-gradient-to-br from-habita-primary to-red-600 rounded-full w-20 h-20 mx-auto mb-6 shadow-lg border-2 border-white">
                        <Star className="h-10 w-10 text-white mx-auto" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No hay suscripciones</h3>
                    <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                        Comienza creando el primer plan de suscripción para tu plataforma
                    </p>
                    <div className="w-24 h-1 bg-gradient-to-r from-habita-primary to-red-600 mx-auto rounded-full"></div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {suscripciones.map((suscripcion, index) => {
                const theme = getSubscriptionTheme(suscripcion.nombre);

                return (
                    <Card
                        key={suscripcion.id}
                        className={`
              shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.02]
              border-2 ${theme.border} bg-gradient-to-br ${theme.bgGradient} to-white
              relative overflow-hidden
            `}
                    >
                        {/* Línea decorativa lateral */}
                        <div className={`absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b ${theme.gradient}`}></div>

                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                {/* Información del Plan */}
                                <div className="flex items-start gap-6 flex-1">
                                    {/* Icono del Plan */}
                                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${theme.gradient} shadow-lg border-2 border-white`}>
                                        <div className="text-white">
                                            {theme.icon}
                                        </div>
                                    </div>

                                    {/* Detalles del Plan */}
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center gap-4">
                                            <h3 className={`text-2xl font-bold ${theme.text}`}>
                                                {suscripcion.nombre}
                                            </h3>
                                            <Badge
                                                className={`
                          text-sm font-bold px-3 py-1 border-2 border-white shadow-lg
                          ${suscripcion.status === 'Activa'
                                                    ? 'bg-green-500 text-white hover:bg-green-600'
                                                    : 'bg-gray-500 text-white hover:bg-gray-600'
                                                }
                        `}
                                            >
                                                {suscripcion.status === 'Activa' ? '✅ ACTIVA' : '⏸️ INACTIVA'}
                                            </Badge>
                                        </div>

                                        {suscripcion.descripcion && (
                                            <p className="text-gray-700 text-lg leading-relaxed max-w-2xl border-l-4 border-gray-300 pl-4 py-1 bg-white/50 rounded-r-lg">
                                                {suscripcion.descripcion}
                                            </p>
                                        )}

                                        {/* Precios */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                            {/* Precio Mensual */}
                                            <div className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-lg">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Calendar className="h-4 w-4 text-gray-600" />
                                                    <span className="text-sm font-semibold text-gray-600">MENSUAL</span>
                                                </div>
                                                <div className="text-2xl font-bold text-gray-900">
                                                    {formatCurrency(suscripcion.precio_mensual)}
                                                </div>
                                            </div>

                                            {/* Precio Semestral */}
                                            <div className="bg-white p-4 rounded-xl border-2 border-green-200 shadow-lg relative">
                                                {getDiscountBadge(suscripcion.precio_mensual, suscripcion.precio_semestral, 'semestral') && (
                                                    <div className="absolute -top-2 -right-2">
                                                        {getDiscountBadge(suscripcion.precio_mensual, suscripcion.precio_semestral, 'semestral')}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 mb-2">
                                                    <DollarSign className="h-4 w-4 text-green-600" />
                                                    <span className="text-sm font-semibold text-green-600">SEMESTRAL</span>
                                                </div>
                                                <div className="text-2xl font-bold text-green-700">
                                                    {formatCurrency(suscripcion.precio_semestral)}
                                                </div>
                                                <div className="text-xs text-green-600 mt-1 font-medium">
                                                    6 meses • 15% descuento
                                                </div>
                                            </div>

                                            {/* Precio Anual */}
                                            <div className="bg-white p-4 rounded-xl border-2 border-blue-200 shadow-lg relative">
                                                {getDiscountBadge(suscripcion.precio_mensual, suscripcion.precio_anual, 'anual') && (
                                                    <div className="absolute -top-2 -right-2">
                                                        {getDiscountBadge(suscripcion.precio_mensual, suscripcion.precio_anual, 'anual')}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Zap className="h-4 w-4 text-blue-600" />
                                                    <span className="text-sm font-semibold text-blue-600">ANUAL</span>
                                                </div>
                                                <div className="text-2xl font-bold text-blue-700">
                                                    {formatCurrency(suscripcion.precio_anual)}
                                                </div>
                                                <div className="text-xs text-blue-600 mt-1 font-medium">
                                                    12 meses • 30% descuento
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Acciones */}
                                <div className="flex flex-col gap-3 ml-6">
                                    <Button
                                        onClick={() => onEdit(suscripcion)}
                                        className={`
                      border-2 border-white shadow-xl hover:shadow-2xl 
                      bg-gradient-to-br ${theme.gradient} text-white
                      hover:scale-105 transition-all duration-200 px-6 py-3
                      font-semibold
                    `}
                                    >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Editar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => onDelete(suscripcion.id)}
                                        className="border-2 border-red-300 text-red-600 bg-white hover:bg-red-50
                             shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200
                             px-6 py-3 font-semibold"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Eliminar
                                    </Button>
                                </div>
                            </div>

                            {/* Separador decorativo entre items */}
                            {index < suscripciones.length - 1 && (
                                <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};

export default SuscripcionesList;