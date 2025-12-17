import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useReservas } from '@/hooks/useReservas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
    Search,
    Eye,
    EyeOff,
    Calendar,
    Users,
    DollarSign,
    Home,
    MapPin,
    CreditCard,
    CheckCircle2,
    XCircle,
    Clock,
    Filter,
    TrendingUp,
    Download,
    User
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

const PagosPage: React.FC = () => {
    const { user } = useAuth();
    const { reservas, isLoading } = useReservas();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [showAmounts, setShowAmounts] = useState(true);

    // Verificar si es admin/superuser
    const isAdminUser = user?.role === 'ADMIN' || user?.role === 'SUPERUSER';

    // Procesar y filtrar pagos
    const { pagos, estadisticas } = useMemo(() => {
        if (!reservas.length) {
            return { pagos: [], estadisticas: { totalPagado: 0, totalReservas: 0, promedioPago: 0 } };
        }

        let reservasFiltradas = reservas;

        // Si no es admin, solo mostrar sus propias reservas
        if (!isAdminUser && user) {
            reservasFiltradas = reservas.filter(reserva => reserva.user === user.id);
        }

        // Filtrar por término de búsqueda
        if (searchTerm) {
            reservasFiltradas = reservasFiltradas.filter(reserva =>
                reserva.propiedad_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                reserva.id.toString().includes(searchTerm) ||
                reserva.user_username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                reserva.propiedad_direccion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (reserva.usuario_info?.first_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (reserva.usuario_info?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (reserva.usuario_info?.correo?.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Solo reservas con estado de pago completado
        const pagosFiltrados = reservasFiltradas.filter(reserva =>
            reserva.pago_estado && ['pagado', 'reembolsado'].includes(reserva.pago_estado)
        );

        // Calcular estadísticas
        const totalPagado = pagosFiltrados.reduce((sum, pago) => sum + (pago.monto_total || 0), 0);
        const totalReservas = pagosFiltrados.length;
        const promedioPago = totalReservas > 0 ? totalPagado / totalReservas : 0;

        return {
            pagos: pagosFiltrados,
            estadisticas: {
                totalPagado,
                totalReservas,
                promedioPago
            }
        };
    }, [reservas, user, isAdminUser, searchTerm]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), "dd MMM yyyy", { locale: es });
        } catch {
            return dateString;
        }
    };

    const getPagoBadge = (pagoEstado: string) => {
        const pagoConfig: { [key: string]: { className: string; text: string; icon: React.ReactNode } } = {
            'pagado': {
                className: "bg-green-100 text-green-800 border-green-300",
                text: "Pagado",
                icon: <CheckCircle2 className="h-3 w-3 mr-1" />
            },
            'reembolsado': {
                className: "bg-blue-100 text-blue-800 border-blue-300",
                text: "Reembolsado",
                icon: <CreditCard className="h-3 w-3 mr-1" />
            },
            'fallido': {
                className: "bg-red-100 text-red-800 border-red-300",
                text: "Fallido",
                icon: <XCircle className="h-3 w-3 mr-1" />
            }
        };

        const config = pagoConfig[pagoEstado] || {
            className: "bg-gray-100 text-gray-800 border-gray-300",
            text: pagoEstado,
            icon: <Clock className="h-3 w-3 mr-1" />
        };

        return (
            <Badge variant="outline" className={config.className}>
                {config.icon}
                {config.text}
            </Badge>
        );
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: { [key: string]: { className: string; text: string } } = {
            'confirmada': { className: "bg-green-500 text-white", text: "Confirmada" },
            'completada': { className: "bg-blue-500 text-white", text: "Completada" },
            'cancelada': { className: "bg-red-500 text-white", text: "Cancelada" },
            'aceptada': { className: "bg-emerald-500 text-white", text: "Aceptada" },
        };

        const config = statusConfig[status] || { className: "bg-gray-500 text-white", text: status };
        return <Badge className={config.className}>{config.text}</Badge>;
    };

    // 🔥 FUNCIÓN PARA OBTENER INFORMACIÓN DEL USUARIO
    const getUserInfo = (reserva: any) => {
        // Intentar obtener la información del usuario desde diferentes fuentes
        if (reserva.usuario_info) {
            return {
                nombre: `${reserva.usuario_info.first_name || ''} ${reserva.usuario_info.last_name || ''}`.trim(),
                correo: reserva.usuario_info.correo,
                telefono: reserva.usuario_info.N_Cel
            };
        } else if (reserva.user_username) {
            return {
                nombre: reserva.user_username,
                correo: reserva.user_correo || 'No disponible',
                telefono: 'No disponible'
            };
        } else {
            return {
                nombre: 'Usuario no disponible',
                correo: 'No disponible',
                telefono: 'No disponible'
            };
        }
    };

    const handleExport = () => {
        toast({
            title: "Exportando datos",
            description: "Preparando archivo de exportación...",
        });
        // Aquí iría la lógica de exportación
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardContent className="p-12">
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-habita-primary"></div>
                            <p className="text-gray-600">Cargando pagos...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isAdminUser ? 'Historial de Pagos' : 'Mis Pagos'}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {isAdminUser
                            ? 'Visualiza y gestiona todos los pagos del sistema'
                            : 'Revisa el historial completo de tus pagos realizados'
                        }
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Botón exportar para admins */}
                    {isAdminUser && (
                        <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Exportar
                        </Button>
                    )}

                    {/* Toggle para mostrar/ocultar montos */}
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={showAmounts}
                            onCheckedChange={setShowAmounts}
                            id="show-amounts"
                        />
                        <Label htmlFor="show-amounts" className="flex items-center gap-2 cursor-pointer">
                            {showAmounts ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            {showAmounts ? 'Mostrar montos' : 'Ocultar montos'}
                        </Label>
                    </div>
                </div>
            </div>

            {/* Barra de búsqueda */}
            <Card>
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder={
                                isAdminUser
                                    ? "Buscar por propiedad, ID, usuario, correo..."
                                    : "Buscar por propiedad o ID de reserva..."
                            }
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-10"
                        />
                        <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    </div>
                </CardContent>
            </Card>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Pagado */}
                <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500 rounded-xl">
                                <DollarSign className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {isAdminUser ? 'Total Recaudado' : 'Total Pagado'}
                                </h3>
                                <p className="text-2xl font-bold text-gray-900">
                                    {showAmounts ? formatCurrency(estadisticas.totalPagado) : '••••••'}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    En {estadisticas.totalReservas} reserva{estadisticas.totalReservas !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Reservas Pagadas */}
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-500 rounded-xl">
                                <CheckCircle2 className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Reservas Pagadas
                                </h3>
                                <p className="text-2xl font-bold text-gray-900">
                                    {estadisticas.totalReservas}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    {isAdminUser ? 'En el sistema' : 'Tus reservas'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Promedio por Reserva */}
                <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-2 border-purple-200">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-500 rounded-xl">
                                <TrendingUp className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Promedio por Reserva
                                </h3>
                                <p className="text-2xl font-bold text-gray-900">
                                    {showAmounts ? formatCurrency(estadisticas.promedioPago) : '••••••'}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    Valor promedio
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Lista de pagos */}
            {pagos.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                            {searchTerm ? 'No se encontraron pagos' : 'No hay pagos registrados'}
                        </h3>
                        <p className="text-gray-500">
                            {searchTerm
                                ? 'No hay pagos que coincidan con tu búsqueda.'
                                : isAdminUser
                                    ? 'No hay pagos completados en el sistema.'
                                    : 'Aún no has completado ningún pago.'
                            }
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-800">
                            {isAdminUser ? 'Todos los Pagos' : 'Tus Pagos'} ({pagos.length})
                        </h2>
                    </div>

                    {pagos.map((pago) => {
                        const userInfo = getUserInfo(pago);

                        return (
                            <Card key={pago.id} className="border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
                                <CardContent className="p-6">
                                    <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                                        {/* Información principal */}
                                        <div className="flex-1 space-y-4">
                                            {/* Header con IDs y estados */}
                                            <div className="flex flex-wrap items-center gap-3">
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 font-mono">
                                                    RESERVA #{pago.id}
                                                </Badge>
                                                {getStatusBadge(pago.status)}
                                                {getPagoBadge(pago.pago_estado)}
                                            </div>

                                            {/* 🔥 INFORMACIÓN DEL USUARIO (SOLO PARA ADMINS) */}
                                            {isAdminUser && (
                                                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <User className="h-5 w-5 text-blue-600" />
                                                        <h4 className="font-semibold text-blue-800">Información del Usuario</h4>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <div>
                                                            <p className="text-sm text-gray-600">Nombre:</p>
                                                            <p className="font-semibold text-gray-800">{userInfo.nombre}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-600">Correo:</p>
                                                            <p className="font-semibold text-gray-800">{userInfo.correo}</p>
                                                        </div>
                                                        {userInfo.telefono !== 'No disponible' && (
                                                            <div>
                                                                <p className="text-sm text-gray-600">Teléfono:</p>
                                                                <p className="font-semibold text-gray-800">{userInfo.telefono}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Información de la propiedad */}
                                            <div className="space-y-3">
                                                <div className="flex items-start gap-3">
                                                    <Home className="h-5 w-5 text-gray-500 mt-0.5" />
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 text-lg">
                                                            {pago.propiedad_nombre || 'Propiedad no disponible'}
                                                        </h3>
                                                        {pago.propiedad_direccion && (
                                                            <div className="flex items-center gap-2 text-gray-600 mt-1">
                                                                <MapPin className="h-4 w-4" />
                                                                <span className="text-sm">{pago.propiedad_direccion}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Fechas y huéspedes */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                        <Calendar className="h-4 w-4 text-gray-500" />
                                                        <div>
                                                            <p className="text-gray-600">Check-in</p>
                                                            <p className="font-semibold text-gray-800">{formatDate(pago.fecha_checkin)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                        <Calendar className="h-4 w-4 text-gray-500" />
                                                        <div>
                                                            <p className="text-gray-600">Check-out</p>
                                                            <p className="font-semibold text-gray-800">{formatDate(pago.fecha_checkout)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                        <Users className="h-4 w-4 text-gray-500" />
                                                        <div>
                                                            <p className="text-gray-600">Huéspedes</p>
                                                            <p className="font-semibold text-gray-800">
                                                                {pago.cant_huesp} persona{pago.cant_huesp !== 1 ? 's' : ''}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                        <Clock className="h-4 w-4 text-gray-500" />
                                                        <div>
                                                            <p className="text-gray-600">Noches</p>
                                                            <p className="font-semibold text-gray-800">{pago.cant_noches}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Información del pago */}
                                        <div className="lg:text-right space-y-4 min-w-[200px]">
                                            <div className="space-y-2">
                                                <div className="text-3xl font-bold text-green-600">
                                                    {showAmounts ? formatCurrency(pago.monto_total) : '••••••'}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    Total pagado
                                                </div>
                                            </div>

                                            {/* Detalles del pago */}
                                            <div className="space-y-2 text-sm">
                                                {pago.descuento && pago.descuento > 0 && (
                                                    <div className="text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                                                        🎉 Descuento aplicado: {pago.descuento}%
                                                    </div>
                                                )}
                                                <div className="text-gray-600">
                                                    {pago.cant_noches} noche{pago.cant_noches !== 1 ? 's' : ''} • {pago.cant_huesp} huesped{pago.cant_huesp !== 1 ? 'es' : ''}
                                                </div>
                                            </div>

                                            {/* Fecha de pago */}
                                            {pago.creado_en && (
                                                <div className="text-xs text-gray-500">
                                                    Pagado el {format(new Date(pago.creado_en), "dd MMM yyyy 'a las' HH:mm", { locale: es })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default PagosPage;