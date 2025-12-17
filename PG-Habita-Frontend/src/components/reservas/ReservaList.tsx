import React, { useState, useMemo } from 'react';
import { Reserva, ReservaConDetallesMejorada } from '@/types/auth';
import { useReservas } from '@/hooks/useReservas';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Calendar,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Users,
  Moon,
  DollarSign,
  Sparkles,
  Filter,
  RefreshCw,
  Loader2,
  User,
  Building2,
  CreditCard,
  QrCode
} from 'lucide-react';
import { designClasses, animations, staggerClasses } from '@/lib/design-system';
import ReservaModal from './ReservaModal'; // 🔥 NUEVO IMPORT

interface ReservaListProps {
  onEdit: (reserva: Reserva) => void;
  onView: (reserva: ReservaConDetallesMejorada) => void;
  onCreate: () => void;
}

const ReservaList: React.FC<ReservaListProps> = ({ onEdit, onView, onCreate }) => {
  const { user } = useAuth();
  const {
    reservas,
    isLoading,
    deleteReserva,
    isDeleting,
    refetch,
    loadReservaDetails,
    updateReserva
  } = useReservas();

  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingDetailsId, setLoadingDetailsId] = useState<number | null>(null);
  const [ReservaModalOpen, setReservaModalOpen] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState<Reserva | null>(null);

  // 🔥 VERIFICAR TIPO DE USUARIO MEJORADO
  const isAdminUser = user?.role === 'ADMIN' || user?.role === 'SUPERUSER';
  const isClientUser = user?.role === 'CLIENT' || user?.role === 'HUESPED';

  // 🔥 FILTRAR RESERVAS SEGÚN TIPO DE USUARIO
  const reservasFiltradas = useMemo(() => {
    let reservasBase = reservas;

    // Si es CLIENT, mostrar solo sus reservas
    if (isClientUser && !isAdminUser) {
      reservasBase = reservas.filter(reserva => reserva.user === user?.id);
    }

    // Aplicar filtro de búsqueda
    return reservasBase.filter(reserva =>
      reserva.comentario_huesp?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reserva.id.toString().includes(searchTerm) ||
      reserva.user_username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reserva.propiedad_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [reservas, searchTerm, user?.id, isAdminUser, isClientUser]);

  // 🔥 FUNCIÓN PARA ABRIR MODAL DE PAGO
  const handleAbrirPago = (reserva: Reserva) => {
    setReservaSeleccionada(reserva);
    setReservaModalOpen(true);
  };

  // 🔥 FUNCIÓN PARA PROCESAR PAGO EXITOSO
  const handlePagoExitoso = async () => {
    if (reservaSeleccionada) {
      try {
        await updateReserva({
          id: reservaSeleccionada.id,
          data: { pago_estado: 'pagado' }
        });

        // Cerrar modal y limpiar estado
        setReservaModalOpen(false);
        setReservaSeleccionada(null);

        // Recargar lista
        await refetch();
      } catch (error) {
        console.error('Error actualizando estado de pago:', error);
      }
    }
  };

  // Función para cargar detalles y mostrar vista
  const handleViewWithDetails = async (reserva: Reserva) => {
    try {
      setLoadingDetailsId(reserva.id);
      const reservaConDetalles = await loadReservaDetails(reserva.id);
      onView(reservaConDetalles);
    } catch (error) {
      console.error('Error cargando detalles:', error);
      onView({
        ...reserva,
        usuario: undefined,
        propiedadInfo: undefined
      } as ReservaConDetallesMejorada);
    } finally {
      setLoadingDetailsId(null);
    }
  };

  // Función para mostrar badge de estado
  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { className: string; text: string } } = {
      'confirmada': { className: "bg-green-500 text-white", text: "✅ Confirmada" },
      'cancelada': { className: "bg-red-500 text-white", text: "❌ Cancelada" },
      'pendiente': { className: "bg-yellow-500 text-white", text: "⏳ Pendiente" },
      'aceptada': { className: "bg-blue-500 text-white", text: "👍 Aceptada" },
      'completada': { className: "bg-purple-500 text-white", text: "🏁 Completada" },
      'rechazada': { className: "bg-gray-500 text-white", text: "🚫 Rechazada" }
    };

    const config = statusConfig[status] || statusConfig['pendiente'];
    return <Badge className={config.className}>{config.text}</Badge>;
  };

  const getPagoBadge = (pagoEstado: string) => {
    const pagoConfig: { [key: string]: { className: string; text: string } } = {
      'pagado': { className: "bg-green-100 text-green-800 border-green-300", text: "💳 Pagado" },
      'pendiente': { className: "bg-yellow-100 text-yellow-800 border-yellow-300", text: "⏰ Pendiente" },
      'reembolsado': { className: "bg-blue-100 text-blue-800 border-blue-300", text: "↩️ Reembolsado" },
      'fallido': { className: "bg-red-100 text-red-800 border-red-300", text: "❌ Fallido" }
    };

    const config = pagoConfig[pagoEstado] || pagoConfig['pendiente'];
    return <Badge variant="outline" className={config.className}>{config.text}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-CO');
    } catch {
      return dateString;
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta reserva?')) {
      await deleteReserva(id);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // 🔥 ESTADÍSTICAS MEJORADAS
  const estadisticas = useMemo(() => {
    const total = reservasFiltradas.length;
    const confirmadas = reservasFiltradas.filter(r => r.status === 'confirmada').length;
    const pendientes = reservasFiltradas.filter(r => r.status === 'pendiente').length;
    const pagadas = reservasFiltradas.filter(r => r.pago_estado === 'pagado').length;
    const misReservas = isClientUser ? reservas.filter(r => r.user === user?.id).length : 0;

    return { total, confirmadas, pendientes, pagadas, misReservas };
  }, [reservasFiltradas, reservas, isClientUser, user?.id]);

  if (isLoading) {
    return (
      <Card className={`${designClasses.card} ${animations.pulseGlow}`}>
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-habita-primary to-red-600 rounded-full animate-spin"></div>
              <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-white animate-pulse" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-gray-700 animate-pulse">Cargando reservas...</h3>
              <p className="text-gray-500">Preparando tu experiencia visual</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={`${designClasses.card} ${animations.slideUp}`}>
        <CardHeader className={`${designClasses.gradient.card} border-b-2 border-gray-200 relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-shimmer animate-shimmer"></div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className={`p-3 bg-gradient-to-r from-habita-primary to-red-600 rounded-xl shadow-2xl ${animations.float}`}>
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  {isAdminUser ? 'Gestión de Reservas' : 'Mis Reservas'}
                </CardTitle>
                <p className="text-gray-600 text-sm mt-1">
                  {reservasFiltradas.length} reserva{reservasFiltradas.length !== 1 ? 's' : ''} encontrada{reservasFiltradas.length !== 1 ? 's' : ''}
                  {isClientUser && ` de ${estadisticas.misReservas} totales`}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`${designClasses.button.outline} flex items-center gap-2`}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>

              {/* 🔥 SOLO MOSTRAR BOTÓN NUEVA RESERVA PARA ADMINS */}
              {isAdminUser && (
                <Button
                  onClick={onCreate}
                  className={`${designClasses.button.primary} flex items-center gap-2`}
                >
                  <Plus className="h-4 w-4" />
                  Nueva Reserva
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="mb-6">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={
                  isAdminUser
                    ? "Buscar por comentario, ID, usuario o propiedad..."
                    : "Buscar en mis reservas..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${designClasses.input} pl-10`}
              />
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
          </div>

          {reservasFiltradas.length === 0 ? (
            <div className="text-center py-16">
              <div className="relative mb-6">
                <Calendar className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                <Sparkles className="absolute top-2 right-2 h-6 w-6 text-habita-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-600 mb-4">
                {searchTerm ? 'No hay coincidencias' : 'No hay reservas'}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {searchTerm
                  ? 'No encontramos reservas que coincidan con tu búsqueda.'
                  : isAdminUser
                    ? 'Comienza creando tu primera reserva.'
                    : 'Aún no tienes reservas realizadas.'
                }
              </p>
              {!searchTerm && isAdminUser && (
                <Button
                  onClick={onCreate}
                  className={`${designClasses.button.primary}`}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Reserva
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-xl border-2 border-gray-200 overflow-hidden shadow-inner">
              <Table>
                <TableHeader className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <TableRow>
                    <TableHead className="font-bold text-gray-700 p-4">ID</TableHead>
                    {isAdminUser && (
                      <>
                        <TableHead className="font-bold text-gray-700 p-4">Usuario</TableHead>
                        <TableHead className="font-bold text-gray-700 p-4">Propiedad</TableHead>
                      </>
                    )}
                    <TableHead className="font-bold text-gray-700 p-4">Check-in</TableHead>
                    <TableHead className="font-bold text-gray-700 p-4">Check-out</TableHead>
                    <TableHead className="font-bold text-gray-700 p-4">Huéspedes</TableHead>
                    <TableHead className="font-bold text-gray-700 p-4">Noches</TableHead>
                    <TableHead className="font-bold text-gray-700 p-4">Monto</TableHead>
                    <TableHead className="font-bold text-gray-700 p-4">Estado</TableHead>
                    <TableHead className="font-bold text-gray-700 p-4">Pago</TableHead>
                    <TableHead className="font-bold text-gray-700 p-4 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservasFiltradas.map((reserva, index) => (
                    <TableRow
                      key={reserva.id}
                      className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-green-50/50 transition-all duration-500 border-b-2 border-gray-100"
                      style={staggerClasses(index)}
                    >
                      <TableCell className="font-bold text-gray-800 p-4">
                        <div className="flex items-center gap-2">
                          <span className="bg-gradient-to-r from-habita-primary to-red-600 text-white px-2 py-1 rounded-lg text-sm">
                            #{reserva.id}
                          </span>
                        </div>
                      </TableCell>

                      {/* 🔥 SOLO MOSTRAR USUARIO Y PROPIEDAD PARA ADMINS */}
                      {isAdminUser && (
                        <>
                          <TableCell className="p-4">
                            <div className="flex items-center gap-2 text-gray-600">
                              <User className="h-4 w-4" />
                              <span className="font-medium text-sm">
                                {reserva.user_username || `Usuario ${reserva.user}`}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="p-4">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Building2 className="h-4 w-4" />
                              <span className="font-medium text-sm">
                                {reserva.propiedad_nombre || `Propiedad ${reserva.propiedad}`}
                              </span>
                            </div>
                          </TableCell>
                        </>
                      )}

                      <TableCell className="text-gray-600 p-4 font-medium">
                        {formatDate(reserva.fecha_checkin)}
                      </TableCell>
                      <TableCell className="text-gray-600 p-4 font-medium">
                        {formatDate(reserva.fecha_checkout)}
                      </TableCell>
                      <TableCell className="p-4">
                        <div className="flex items-center gap-2 text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
                          <Users className="h-4 w-4" />
                          <span className="font-semibold">{reserva.cant_huesp}</span>
                        </div>
                      </TableCell>
                      <TableCell className="p-4">
                        <div className="flex items-center gap-2 text-gray-600 bg-purple-50 px-3 py-1 rounded-full">
                          <Moon className="h-4 w-4" />
                          <span className="font-semibold">{reserva.cant_noches}</span>
                        </div>
                      </TableCell>
                      <TableCell className="p-4 font-bold">
                        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                          <DollarSign className="h-4 w-4" />
                          {formatCurrency(reserva.monto_total)}
                        </div>
                      </TableCell>
                      <TableCell className="p-4">
                        {getStatusBadge(reserva.status)}
                      </TableCell>
                      <TableCell className="p-4">
                        {getPagoBadge(reserva.pago_estado)}
                      </TableCell>
                      <TableCell className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewWithDetails(reserva)}
                            disabled={loadingDetailsId === reserva.id}
                            className="h-9 w-9 p-0 hover:scale-110 transition-transform duration-300"
                            title="Ver detalles"
                          >
                            {loadingDetailsId === reserva.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>

                          {/* 🔥 BOTÓN DE PAGO PARA CLIENTES - SOLO SI ESTÁ PENDIENTE */}
                          {isClientUser && reserva.pago_estado === 'pendiente' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAbrirPago(reserva)}
                              className="h-9 w-9 p-0 border-2 border-green-200 text-green-600 hover:border-green-500 hover:text-green-700 hover:scale-110 transition-all duration-300"
                              title="Realizar pago"
                            >
                              <CreditCard className="h-4 w-4" />
                            </Button>
                          )}

                          {/* 🔥 SOLO MOSTRAR BOTONES EDITAR Y ELIMINAR PARA ADMINS */}
                          {isAdminUser && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEdit(reserva)}
                                className="h-9 w-9 p-0 border-2 border-blue-200 text-blue-600 hover:border-blue-500 hover:text-blue-700 hover:scale-110 transition-all duration-300"
                                title="Editar reserva"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(reserva.id)}
                                disabled={isDeleting}
                                className="h-9 w-9 p-0 border-2 border-red-200 text-red-600 hover:border-red-500 hover:text-red-700 hover:scale-110 transition-all duration-300"
                                title="Eliminar reserva"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {reservasFiltradas.length > 0 && (
            <div className="mt-6 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border-2 border-gray-200">
              <div className="flex flex-wrap gap-6 justify-center">
                <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg shadow-lg">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <span className="font-semibold text-gray-600">Total:</span>
                    <Badge variant="secondary" className="ml-2 bg-blue-500 text-white">
                      {estadisticas.total}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg shadow-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <span className="font-semibold text-gray-600">Confirmadas:</span>
                    <Badge className="ml-2 bg-green-500 text-white">
                      {estadisticas.confirmadas}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg shadow-lg">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div>
                    <span className="font-semibold text-gray-600">Pendientes:</span>
                    <Badge className="ml-2 bg-yellow-500 text-white">
                      {estadisticas.pendientes}
                    </Badge>
                  </div>
                </div>
                {isAdminUser && (
                  <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg shadow-lg">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <div>
                      <span className="font-semibold text-gray-600">Pagadas:</span>
                      <Badge className="ml-2 bg-purple-500 text-white">
                        {estadisticas.pagadas}
                      </Badge>
                    </div>
                  </div>
                )}
                {isClientUser && (
                  <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg shadow-lg">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <div>
                      <span className="font-semibold text-gray-600">Mis Reservas:</span>
                      <Badge className="ml-2 bg-orange-500 text-white">
                        {estadisticas.misReservas}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 🔥 MODAL DE PAGO MEJORADO */}
      <ReservaModal
        isOpen={ReservaModalOpen}
        onClose={() => {
          setReservaModalOpen(false);
          setReservaSeleccionada(null);
        }}
        reserva={reservaSeleccionada}
        onPagoExitoso={handlePagoExitoso}
      />
    </>
  );
};

export default ReservaList;