import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useReservaModal } from '@/hooks/useReservaModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Calendar as CalendarIcon,
  Users,
  Moon,
  DollarSign,
  X,
  MapPin,
  Bed,
  Bath,
  Home,
  AlertCircle,
  CheckCircle2,
  Lock,
  Check,
  Sparkles,
  Loader2,
  CalendarDays
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useReservas } from '@/hooks/useReservas';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useFechasOcupadas } from '@/hooks/useFechasOcupadas';

const ReservaModal: React.FC = () => {
  const { isOpen, propiedad, onClose } = useReservaModal();
  const { user } = useAuth();
  const { toast } = useToast();
  const { createReserva, isCreating } = useReservas();

  const [fechaCheckin, setFechaCheckin] = useState<Date>();
  const [fechaCheckout, setFechaCheckout] = useState<Date>();
  const [cantHuesp, setCantHuesp] = useState(1);
  const [comentario, setComentario] = useState('');
  const [estaProcesandoPago, setEstaProcesandoPago] = useState(false);
  const [pagoCompletado, setPagoCompletado] = useState(false);
  const [errorReserva, setErrorReserva] = useState<string>('');

  // 🔥 USAR EL HOOK PARA OBTENER FECHAS OCUPADAS
  const {
    data: datosFechasOcupadas,
    isLoading: isLoadingFechas,
    error: errorFechas
  } = useFechasOcupadas(propiedad?.id || null);

  // 🔥 OBTENER FECHAS OCUPADAS COMO DATE OBJECTS - CORREGIDO
  const fechasOcupadas = React.useMemo(() => {
    if (!datosFechasOcupadas?.fechas_ocupadas) {
      console.log('📅 No hay fechas ocupadas disponibles');
      return [];
    }

    const fechas = datosFechasOcupadas.fechas_ocupadas.map((fechaStr: string) => {
      try {
        // Intentar parsear como ISO
        const fecha = new Date(fechaStr);
        if (isNaN(fecha.getTime())) {
          // Si falla, intentar formato YYYY-MM-DD
          const [year, month, day] = fechaStr.split('-').map(Number);
          return new Date(year, month - 1, day);
        }
        return fecha;
      } catch (error) {
        console.error('Error parseando fecha:', fechaStr, error);
        return null;
      }
    }).filter(Boolean) as Date[];

    console.log('📅 Fechas ocupadas procesadas:', fechas.map(f => format(f, 'dd/MM/yyyy')));
    return fechas;
  }, [datosFechasOcupadas?.fechas_ocupadas]);

  // 🔥 FUNCIÓN CORREGIDA PARA VERIFICAR SI UNA FECHA ESTÁ OCUPADA
  const isFechaOcupada = (date: Date) => {
    return fechasOcupadas.some(fechaOcupada =>
      isSameDay(fechaOcupada, date)
    );
  };

  // 🔥 VERIFICAR SI LAS FECHAS SELECCIONADAS ESTÁN OCUPADAS
  const fechasSeleccionadasOcupadas = React.useMemo(() => {
    if (!fechaCheckin || !fechaCheckout || fechasOcupadas.length === 0) {
      return false;
    }

    const fechaInicio = new Date(fechaCheckin);
    const fechaFin = new Date(fechaCheckout);

    // Verificar cada día del rango seleccionado
    for (let fecha = new Date(fechaInicio); fecha <= fechaFin; fecha.setDate(fecha.getDate() + 1)) {
      const currentDate = new Date(fecha);
      if (isFechaOcupada(currentDate)) {
        return true;
      }
    }

    return false;
  }, [fechaCheckin, fechaCheckout, fechasOcupadas]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(amount);
  };

  // Calcular noches y total
  const calcularNoches = () => {
    if (!fechaCheckin || !fechaCheckout) return 0;
    const diferencia = fechaCheckout.getTime() - fechaCheckin.getTime();
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  };

  const noches = calcularNoches();
  const total = noches > 0 ? (propiedad?.precio_noche || 0) * noches : 0;

  const procesarPago = async () => {
    setEstaProcesandoPago(true);
    setErrorReserva('');

    try {
      // Validaciones básicas
      if (!fechaCheckin || !fechaCheckout) {
        throw new Error('Las fechas son requeridas');
      }

      if (noches < 1) {
        throw new Error('La fecha de check-out debe ser posterior al check-in');
      }

      if (cantHuesp > (propiedad?.max_huespedes || 10)) {
        throw new Error(`Máximo ${propiedad?.max_huespedes} huéspedes permitidos`);
      }

      // 🔥 VERIFICAR SI LAS FECHAS ESTÁN OCUPADAS
      if (fechasSeleccionadasOcupadas) {
        throw new Error('Las fechas seleccionadas no están disponibles. Por favor, selecciona otras fechas.');
      }

      // Simular procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Crear reserva con pago inmediato
      if (user && propiedad) {
        const reservaData = {
          propiedad: propiedad.id,
          user: user.id,
          fecha_checkin: format(fechaCheckin, 'yyyy-MM-dd'),
          fecha_checkout: format(fechaCheckout, 'yyyy-MM-dd'),
          cant_huesp: cantHuesp,
          cant_noches: noches,
          monto_total: total,
          descuento: 0,
          comentario_huesp: comentario,
          status: 'confirmada',
          pago_estado: 'pagado'
        };

        console.log('📤 Enviando datos de reserva:', reservaData);
        await createReserva(reservaData);
        setPagoCompletado(true);

        // Mostrar animación de éxito
        await new Promise(resolve => setTimeout(resolve, 2000));

        toast({
          title: "🎉 ¡Reserva confirmada!",
          description: "Tu pago fue procesado y la reserva está confirmada.",
          variant: "default",
        });

        handleClose();
      }
    } catch (error: any) {
      console.error('Error procesando reserva:', error);

      if (error.response?.data?.fechas || error.message?.includes('no están disponibles')) {
        setErrorReserva('Las fechas seleccionadas no están disponibles. Por favor, selecciona otras fechas.');
        toast({
          title: "❌ Fechas no disponibles",
          description: "Las fechas seleccionadas están ocupadas. Por favor, elige otras fechas.",
          variant: "destructive",
        });
      } else {
        setErrorReserva(error.message || "Error al procesar la reserva");
        toast({
          title: "❌ Error en la reserva",
          description: error.message || "Por favor, intenta nuevamente",
          variant: "destructive",
        });
      }
    } finally {
      setEstaProcesandoPago(false);
    }
  };

  const handleReservar = async () => {
    if (!user) {
      toast({
        title: "Inicia sesión para reservar",
        description: "Necesitas tener una cuenta para realizar reservas",
        variant: "destructive",
      });
      return;
    }

    await procesarPago();
  };

  const resetForm = () => {
    setFechaCheckin(undefined);
    setFechaCheckout(undefined);
    setCantHuesp(1);
    setComentario('');
    setEstaProcesandoPago(false);
    setPagoCompletado(false);
    setErrorReserva('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const today = new Date();

  // Componente de animación de éxito
  const AnimacionExito = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center animate-scale-in">
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <Check className="h-10 w-10 text-white" />
          </div>
          <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-400 animate-pulse" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">¡Reserva Confirmada!</h3>
        <p className="text-gray-600 mb-6">
          Tu pago fue procesado exitosamente y la reserva está confirmada.
        </p>
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg mb-6">
          <p className="font-semibold text-gray-800">Total pagado</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(total)}</p>
          <p className="text-sm text-gray-600 mt-1">
            {propiedad?.nombre} • {noches} noche{noches !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={handleClose}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          Entendido
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-0">
          <div className="relative">
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-habita-primary to-red-600 p-6 text-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <CalendarIcon className="h-6 w-6" />
                  </div>
                  Completar Reserva
                </DialogTitle>
              </DialogHeader>
              <button
                onClick={handleClose}
                className="absolute right-4 top-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 🔥 INDICADOR DE CARGA DE FECHAS OCUPADAS */}
            {isLoadingFechas && (
              <div className="p-4 bg-blue-50 border-b border-blue-200">
                <div className="flex items-center gap-2 text-blue-700">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Consultando disponibilidad de fechas...</span>
                </div>
              </div>
            )}

            {/* 🔥 INFO DE FECHAS OCUPADAS */}
            {!isLoadingFechas && fechasOcupadas.length > 0 && (
              <div className="p-4 bg-orange-50 border-b border-orange-200">
                <div className="flex items-center gap-2 text-orange-700">
                  <CalendarDays className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {fechasOcupadas.length} fecha(s) ocupada(s) en esta propiedad
                  </span>
                </div>
                <div className="mt-2 text-xs text-orange-600">
                  Las fechas ocupadas aparecen en <span className="font-bold text-orange-800">naranja y están bloqueadas</span> en el calendario
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Información de la propiedad */}
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 border-r border-gray-200">
                <Card className="border-2 border-gray-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <CardTitle className="flex items-center gap-2">
                      <Home className="h-5 w-5" />
                      Detalles de la Propiedad
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-gray-800">{propiedad?.nombre}</h3>
                      <Badge className="bg-green-500 text-white">
                        {propiedad?.tipo}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{propiedad?.direccion}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
                        <Bed className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-xs text-gray-600">Habitaciones</p>
                          <p className="font-semibold text-sm">{propiedad?.cant_hab}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
                        <Bath className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-xs text-gray-600">Baños</p>
                          <p className="font-semibold text-sm">{propiedad?.cant_bath}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
                        <Users className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-xs text-gray-600">Máx. Huéspedes</p>
                          <p className="font-semibold text-sm">{propiedad?.max_huespedes}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-xs text-gray-600">Precio/noche</p>
                          <p className="font-semibold text-green-600 text-sm">
                            {formatCurrency(propiedad?.precio_noche || 0)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {propiedad?.descripcion && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Descripción:</p>
                        <p className="text-gray-700 bg-white p-3 rounded-lg border border-gray-200 text-sm">
                          {propiedad.descripcion}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Formulario de reserva y pago */}
              <div className="p-6">
                <Card className="border-2 border-gray-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      Detalles de la Reserva
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {!user && (
                      <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-700">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            Necesitas iniciar sesión para reservar
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Fechas con Calendario de shadcn - CORREGIDO */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700">
                        Fechas de estadía *
                      </label>

                      {/* Check-in */}
                      <div className="space-y-2">
                        <Label>Check-in</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !fechaCheckin && "text-muted-foreground",
                                fechasSeleccionadasOcupadas && "border-orange-500 bg-orange-50 text-orange-700"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {fechaCheckin ? format(fechaCheckin, "PPP", { locale: es }) : "Seleccionar fecha"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={fechaCheckin}
                              onSelect={setFechaCheckin}
                              disabled={(date) => {
                                const isPast = date < today;
                                const isOcupada = isFechaOcupada(date);
                                return isPast || isOcupada;
                              }}
                              initialFocus
                              modifiers={{
                                occupied: fechasOcupadas,
                              }}
                              modifiersClassNames={{
                                occupied: "bg-orange-100 text-orange-800 font-bold line-through border border-orange-300 rounded-md"
                              }}
                              className="rounded-md border"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Check-out */}
                      <div className="space-y-2">
                        <Label>Check-out</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !fechaCheckout && "text-muted-foreground",
                                fechasSeleccionadasOcupadas && "border-orange-500 bg-orange-50 text-orange-700"
                              )}
                              disabled={!fechaCheckin}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {fechaCheckout ? format(fechaCheckout, "PPP", { locale: es }) : "Seleccionar fecha"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={fechaCheckout}
                              onSelect={setFechaCheckout}
                              disabled={(date) => {
                                if (!fechaCheckin) return true;
                                const isBeforeCheckin = date <= fechaCheckin;
                                const isOcupada = isFechaOcupada(date);
                                return isBeforeCheckin || isOcupada;
                              }}
                              initialFocus
                              modifiers={{
                                occupied: fechasOcupadas,
                              }}
                              modifiersClassNames={{
                                occupied: "bg-orange-100 text-orange-800 font-bold line-through border border-orange-300 rounded-md"
                              }}
                              className="rounded-md border"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* 🔥 ALERTA DE FECHAS OCUPADAS */}
                      {fechasSeleccionadasOcupadas && (
                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex items-center gap-2 text-orange-700">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              ❌ Las fechas seleccionadas incluyen días ocupados
                            </span>
                          </div>
                          <p className="text-xs text-orange-600 mt-1">
                            Las fechas en <span className="font-bold text-orange-800">naranja</span> están ocupadas. Por favor, selecciona otras fechas disponibles.
                          </p>
                        </div>
                      )}

                      {/* 🔥 LEYENDA DEL CALENDARIO */}
                      {fechasOcupadas.length > 0 && (
                        <div className="flex items-center gap-4 text-xs text-gray-600 mt-2">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-orange-100 rounded border border-orange-300"></div>
                            <span>Fechas ocupadas (bloqueadas)</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-gray-100 rounded border border-gray-300"></div>
                            <span>Fechas disponibles</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Huéspedes */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700">
                        Número de huéspedes *
                      </label>
                      <Input
                        type="number"
                        min="1"
                        max={propiedad?.max_huespedes || 10}
                        value={cantHuesp}
                        onChange={(e) => setCantHuesp(Number(e.target.value))}
                        className="w-full border-2 border-gray-200 focus:border-habita-primary"
                      />
                      <p className="text-xs text-gray-500">
                        Máximo: {propiedad?.max_huespedes} huéspedes
                      </p>
                    </div>

                    {/* Comentarios */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700">
                        Comentarios (opcional)
                      </label>
                      <Textarea
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        placeholder="Comentarios o requerimientos especiales..."
                        className="min-h-[80px] border-2 border-gray-200 focus:border-habita-primary"
                      />
                    </div>

                    {/* Resumen de precios */}
                    {noches > 0 && (
                      <Card className={cn(
                        "bg-gradient-to-r border-2 shadow-lg",
                        fechasSeleccionadasOcupadas
                          ? "from-orange-50 to-red-100 border-orange-300"
                          : "from-green-50 to-emerald-100 border-green-300"
                      )}>
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <DollarSign className={cn(
                              "h-4 w-4",
                              fechasSeleccionadasOcupadas ? "text-orange-600" : "text-green-600"
                            )} />
                            Resumen del pago
                          </h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">
                                {formatCurrency(propiedad?.precio_noche || 0)} x {noches} noche{noches !== 1 ? 's' : ''}
                              </span>
                              <span className="font-semibold">
                                {formatCurrency((propiedad?.precio_noche || 0) * noches)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center border-t border-green-200 pt-2">
                              <span className="font-semibold text-gray-800 text-base">Total a pagar</span>
                              <span className={cn(
                                "font-bold text-xl",
                                fechasSeleccionadasOcupadas ? "text-orange-600" : "text-green-600"
                              )}>
                                {formatCurrency(total)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* 🔥 MENSAJE DE ERROR */}
                    {errorReserva && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 text-red-700">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm">{errorReserva}</span>
                        </div>
                      </div>
                    )}

                    {/* Botones de acción */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={handleClose}
                        className="flex-1 border-2 border-gray-300 hover:border-gray-400"
                        disabled={isCreating || estaProcesandoPago}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleReservar}
                        disabled={
                          !user ||
                          !fechaCheckin ||
                          !fechaCheckout ||
                          noches < 1 ||
                          isCreating ||
                          estaProcesandoPago ||
                          fechasSeleccionadasOcupadas // 🔥 BLOQUEAR SI FECHAS OCUPADAS
                        }
                        className={cn(
                          "flex-1 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300",
                          fechasSeleccionadasOcupadas
                            ? "bg-orange-500 hover:bg-orange-600 cursor-not-allowed"
                            : "bg-gradient-to-r from-habita-primary to-red-600 hover:from-red-600 hover:to-habita-primary"
                        )}
                      >
                        {estaProcesandoPago ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Procesando pago...
                          </>
                        ) : isCreating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Creando reserva...
                          </>
                        ) : fechasSeleccionadasOcupadas ? (
                          "❌ Fechas ocupadas"
                        ) : (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Confirmar y Pagar {formatCurrency(total)}
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Animación de éxito */}
      {pagoCompletado && <AnimacionExito />}
    </>
  );
};

export default ReservaModal;