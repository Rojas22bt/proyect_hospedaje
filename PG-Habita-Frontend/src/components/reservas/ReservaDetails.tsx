import React from 'react';
import { ReservaConDetalles } from '@/types/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Users,
  Moon,
  DollarSign,
  MessageSquare,
  CheckCircle2,
  X,
  User,
  Phone,
  Mail,
  Home,
  MapPin,
  Bath,
  Bed,
  Crown,
  Star,
  Loader2,
  Building2,
  CreditCard,
  Percent,
  Shield,
  Clock,
  Edit,
  PawPrint,
  AlertTriangle,
  Ban
} from 'lucide-react';

interface ReservaDetailsProps {
  reservaId: number;
  onClose: () => void;
  onEdit?: () => void;
  onAnular?: (reservaId: number) => void;
  isLoading?: boolean;
  reserva?: ReservaConDetalles;
  canEdit?: boolean;
  isAnulando?: boolean;
}

const ReservaDetails: React.FC<ReservaDetailsProps> = ({
  reservaId,
  onClose,
  onEdit,
  onAnular,
  isLoading = false,
  reserva,
  canEdit = false,
  isAnulando = false
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-CO', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusInfo = (status: string) => {
    const statusMap: { [key: string]: { text: string; color: string; icon: React.ReactNode } } = {
      'pendiente': {
        text: 'Pendiente',
        color: 'bg-yellow-500',
        icon: <Clock className="h-3 w-3 mr-1" />
      },
      'confirmada': {
        text: 'Confirmada',
        color: 'bg-green-500',
        icon: <Shield className="h-3 w-3 mr-1" />
      },
      'aceptada': {
        text: 'Aceptada',
        color: 'bg-blue-500',
        icon: <Star className="h-3 w-3 mr-1" />
      },
      'cancelada': {
        text: 'Cancelada',
        color: 'bg-red-500',
        icon: <X className="h-3 w-3 mr-1" />
      },
      'completada': {
        text: 'Completada',
        color: 'bg-purple-500',
        icon: <CheckCircle2 className="h-3 w-3 mr-1" />
      },
      'rechazada': {
        text: 'Rechazada',
        color: 'bg-gray-500',
        icon: <Ban className="h-3 w-3 mr-1" />
      }
    };
    return statusMap[status] || { text: status, color: 'bg-gray-500', icon: '❓' };
  };

  const getPagoStatusInfo = (pagoEstado: string) => {
    const pagoMap: { [key: string]: { text: string; color: string; icon: React.ReactNode } } = {
      'pendiente': {
        text: 'Pendiente',
        color: 'bg-yellow-500',
        icon: <Clock className="h-3 w-3 mr-1" />
      },
      'pagado': {
        text: 'Pagado',
        color: 'bg-green-500',
        icon: <CreditCard className="h-3 w-3 mr-1" />
      },
      'reembolsado': {
        text: 'Reembolsado',
        color: 'bg-blue-500',
        icon: <DollarSign className="h-3 w-3 mr-1" />
      },
      'fallido': {
        text: 'Fallido',
        color: 'bg-red-500',
        icon: <X className="h-3 w-3 mr-1" />
      }
    };
    return pagoMap[pagoEstado] || { text: pagoEstado, color: 'bg-gray-500', icon: '❓' };
  };

  const getRoleBadge = (role: string) => {
    const roleColors: { [key: string]: string } = {
      'ADMIN': 'bg-purple-500 text-white',
      'SUPERUSER': 'bg-red-500 text-white',
      'ANFITRION': 'bg-green-500 text-white',
      'HUESPED': 'bg-blue-500 text-white',
      'CLIENT': 'bg-gray-500 text-white'
    };
    return roleColors[role] || 'bg-gray-500 text-white';
  };

  const handleAnular = () => {
    if (window.confirm('¿Estás seguro de que quieres anular esta reserva? Esta acción cambiará el estado a "Rechazada".')) {
      onAnular?.(reservaId);
    }
  };

  // 🔥 CORREGIDO: Normalizar los nombres de campos según el serializer
  const usuario = reserva?.usuario_info || reserva?.usuario;
  const propiedadInfo = reserva?.propiedad_info || reserva?.propiedadInfo;
  const hostInfo = reserva?.host_info;

  if (isLoading) {
    return (
      <Card className="w-full shadow-2xl border-2 border-gray-200">
        <CardContent className="p-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-habita-primary mr-3" />
            <span className="text-lg text-gray-600">Cargando detalles de la reserva...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!reserva) {
    return (
      <Card className="w-full shadow-2xl border-2 border-red-200">
        <CardContent className="p-12">
          <div className="text-center text-red-600">
            <X className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Error al cargar la reserva</h3>
            <p>No se pudieron cargar los detalles de la reserva #{reservaId}.</p>
            <Button onClick={onClose} className="mt-4">
              Volver a la lista
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusInfo = getStatusInfo(reserva.status);
  const pagoStatusInfo = getPagoStatusInfo(reserva.pago_estado);

  // Calcular montos para mostrar
  const montoBase = reserva.descuento > 0 ? reserva.monto_total / (1 - reserva.descuento / 100) : reserva.monto_total;
  const descuentoMonto = montoBase * (reserva.descuento / 100);

  // 🔥 VERIFICAR SI SE PUEDE ANULAR (solo reservas pendientes o aceptadas)
  const puedeAnular = ['pendiente', 'aceptada'].includes(reserva.status) && canEdit;

  return (
    <div className="space-y-6">
      {/* Header Principal */}
      <Card className="shadow-2xl border-2 border-gray-200">
        <CardHeader className="bg-gradient-to-r from-habita-primary/10 to-blue-50 border-b-2 border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-habita-primary rounded-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800">
                  Reserva #{reserva.id}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge className={`${statusInfo.color} text-white flex items-center gap-1`}>
                    {statusInfo.icon}
                    {statusInfo.text}
                  </Badge>
                  <Badge className={`${pagoStatusInfo.color} text-white flex items-center gap-1`}>
                    {pagoStatusInfo.icon}
                    Pago: {pagoStatusInfo.text}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Creada el {formatDate(reserva.creado_en || new Date().toISOString())}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {/* 🔥 BOTÓN ANULAR - SOLO PARA RESERVAS ANULABLES */}
              {puedeAnular && (
                <Button
                  onClick={handleAnular}
                  disabled={isAnulando}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2"
                >
                  {isAnulando ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Ban className="h-4 w-4" />
                  )}
                  Anular Reserva
                </Button>
              )}

              {/* 🔥 BOTÓN EDITAR - SOLO SI TIENE PERMISOS */}
              {canEdit && onEdit && (
                <Button
                  onClick={onEdit}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Editar Reserva
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información del Huésped - CORREGIDO */}
        <Card className="shadow-xl border-2 border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información del Huésped
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {usuario ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {usuario.first_name?.charAt(0)}{usuario.last_name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {usuario.first_name} {usuario.last_name}
                    </h3>
                    <p className="text-gray-600">@{usuario.username}</p>
                    <p className="text-sm text-gray-500">{usuario.correo}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {usuario.N_Cel && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Phone className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Teléfono</p>
                        <p className="font-semibold text-gray-800">{usuario.N_Cel}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Correo Electrónico</p>
                      <p className="font-semibold text-gray-800">{usuario.correo}</p>
                    </div>
                  </div>

                  {usuario.fecha_Nac && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Fecha de Nacimiento</p>
                        <p className="font-semibold text-gray-800">
                          {new Date(usuario.fecha_Nac).toLocaleDateString('es-CO')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Badge className={getRoleBadge(usuario.role)}>
                    {usuario.role === 'ADMIN' && <Crown className="h-3 w-3 mr-1" />}
                    {usuario.role}
                  </Badge>
                  <Badge variant={usuario.is_active ? "default" : "destructive"}>
                    {usuario.is_active ? "✅ Activo" : "❌ Inactivo"}
                  </Badge>
                  {usuario.suscripcion && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      <Star className="h-3 w-3 mr-1" />
                      {usuario.suscripcion.nombre}
                    </Badge>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Información del usuario no disponible</p>
                <p className="text-sm">ID del usuario: {reserva.user}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Información de la Propiedad - CORREGIDO */}
        <Card className="shadow-xl border-2 border-green-200">
          <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Información de la Propiedad
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {propiedadInfo ? (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-gray-800">{propiedadInfo.nombre}</h3>
                  <Badge variant="outline" className="bg-green-100 text-green-700">
                    {propiedadInfo.tipo}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{propiedadInfo.direccion}</span>
                </div>

                {/* 🔥 NUEVA INFORMACIÓN: MÁXIMO HUÉSPEDES Y MASCOTAS */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Bed className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Habitaciones</p>
                      <p className="font-semibold">{propiedadInfo.cant_hab}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Bath className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Baños</p>
                      <p className="font-semibold">{propiedadInfo.cant_bath}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <Users className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Máx. Huéspedes</p>
                      <p className="font-semibold">{propiedadInfo.max_huespedes}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                    <PawPrint className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">Mascotas</p>
                      <p className="font-semibold">
                        {propiedadInfo.pets ? '✅ Permitidas' : '❌ No permitidas'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Precio por noche:</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(propiedadInfo.precio_noche)}
                    </span>
                  </div>
                </div>

                {propiedadInfo.descripcion && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Descripción:</p>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {propiedadInfo.descripcion}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  <Badge variant={propiedadInfo.status ? "default" : "destructive"}>
                    {propiedadInfo.status ? "✅ Activa" : "❌ Inactiva"}
                  </Badge>
                  <Badge variant={propiedadInfo.esta_disponible ? "default" : "destructive"}>
                    {propiedadInfo.esta_disponible ? "🏠 Disponible" : "🚫 No disponible"}
                  </Badge>
                  {propiedadInfo.descuento && propiedadInfo.descuento > 0 && (
                    <Badge variant="secondary" className="bg-red-100 text-red-700">
                      <Percent className="h-3 w-3 mr-1" />
                      {propiedadInfo.descuento}% Desc.
                    </Badge>
                  )}
                  {propiedadInfo.estado_baja !== 'activa' && (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {propiedadInfo.estado_baja === 'baja_temporal' ? 'Baja Temporal' : 'Baja Indefinida'}
                    </Badge>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Home className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Información de la propiedad no disponible</p>
                <p className="text-sm">ID de la propiedad: {reserva.propiedad}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detalles de la Reserva - MEJORADO */}
        <Card className="shadow-xl border-2 border-purple-200 lg:col-span-2">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Detalles de la Reserva
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Fechas */}
              <div className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Check-in</p>
                  <p className="font-bold text-gray-800">{formatDate(reserva.fecha_checkin)}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                  <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Check-out</p>
                  <p className="font-bold text-gray-800">{formatDate(reserva.fecha_checkout)}</p>
                </div>
              </div>

              {/* Huéspedes y Noches */}
              <div className="space-y-4">
                <div className="text-center p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                  <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Huéspedes</p>
                  <p className="font-bold text-gray-800 text-2xl">{reserva.cant_huesp}</p>
                  {propiedadInfo && (
                    <p className="text-xs text-gray-500 mt-1">
                      Máx: {propiedadInfo.max_huespedes}
                    </p>
                  )}
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                  <Moon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Noches</p>
                  <p className="font-bold text-gray-800 text-2xl">{reserva.cant_noches}</p>
                </div>
              </div>

              {/* Información de Pago */}
              <div className="space-y-4">
                <div className="text-center p-4 bg-red-50 rounded-lg border-2 border-red-200">
                  <CreditCard className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Estado de Pago</p>
                  <Badge className={`${pagoStatusInfo.color} text-white mt-1 flex items-center gap-1 justify-center`}>
                    {pagoStatusInfo.icon}
                    {pagoStatusInfo.text}
                  </Badge>
                </div>
                {reserva.descuento > 0 && (
                  <div className="text-center p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                    <Percent className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Descuento Aplicado</p>
                    <p className="font-bold text-gray-800 text-xl">{reserva.descuento}%</p>
                  </div>
                )}
              </div>

              {/* Montos */}
              <div className="space-y-4">
                <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                  <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Total Pagado</p>
                  <p className="font-bold text-green-700 text-xl">{formatCurrency(reserva.monto_total)}</p>
                </div>
                {reserva.descuento > 0 && (
                  <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Ahorro por Descuento</p>
                    <p className="font-bold text-blue-700 text-lg">{formatCurrency(descuentoMonto)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 🔥 NUEVA INFORMACIÓN: FECHAS DE CREACIÓN Y ACTUALIZACIÓN */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {reserva.creado_en && (
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <p className="text-sm text-gray-600">Fecha de creación</p>
                  <p className="font-semibold text-gray-800">
                    {formatDateTime(reserva.creado_en)}
                  </p>
                </div>
              )}
              {reserva.actualizado_en && reserva.actualizado_en !== reserva.creado_en && (
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <p className="text-sm text-gray-600">Última actualización</p>
                  <p className="font-semibold text-gray-800">
                    {formatDateTime(reserva.actualizado_en)}
                  </p>
                </div>
              )}
            </div>

            {/* Comentarios */}
            {reserva.comentario_huesp && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="h-4 w-4 text-gray-600" />
                  <p className="font-semibold text-gray-700">Comentarios del Huésped:</p>
                </div>
                <p className="text-gray-700 bg-white p-3 rounded-lg border border-gray-300">
                  {reserva.comentario_huesp}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReservaDetails;