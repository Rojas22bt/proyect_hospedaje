import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Reserva, ReservaFormData, User } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Calendar,
  X,
  Save,
  Loader2,
  Moon,
  Users,
  Building2,
  MapPin,
  CalendarX,
  AlertCircle,
  CheckCircle2,
  Lock,
  Edit,
  CreditCard,
  Shield,
  User as UserIcon
} from 'lucide-react';
import { usePropiedadesReservas } from '@/hooks/usePropiedadesReservas';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useFechasOcupadas } from '@/hooks/useFechasOcupadas';
import { cn } from '@/lib/utils';
import { useUsuarios } from '@/hooks/useUsuarios';

const reservaSchema = z.object({
  propiedad: z.number().min(1, 'La propiedad es requerida'),
  fecha_checkin: z.date({
    required_error: "La fecha de check-in es requerida",
  }),
  fecha_checkout: z.date({
    required_error: "La fecha de check-out es requerida",
  }),
  cant_huesp: z.number().min(1, 'Debe haber al menos 1 huésped').max(50, 'Máximo 50 huéspedes'),
  cant_noches: z.number().min(1, 'Debe haber al menos 1 noche'),
  monto_total: z.number().min(0, 'El monto debe ser mayor o igual a 0'),
  descuento: z.number().min(0, 'El descuento no puede ser negativo').max(100, 'Máximo 100% de descuento').default(0),
  comentario_huesp: z.string().max(500, 'Máximo 500 caracteres').optional().default(''),
  status: z.enum(['pendiente', 'aceptada', 'rechazada', 'confirmada', 'cancelada', 'completada']).default('pendiente'),
  pago_estado: z.enum(['pendiente', 'pagado', 'reembolsado', 'fallido']).default('pendiente'),
  user: z.number().min(1, 'El usuario es requerido'),
}).refine((data) => {
  if (!data.fecha_checkin || !data.fecha_checkout) return true;
  return data.fecha_checkout > data.fecha_checkin;
}, {
  message: "La fecha de check-out debe ser posterior al check-in",
  path: ["fecha_checkout"],
});

interface ReservaFormProps {
  reserva?: Reserva;
  onSubmit: (data: ReservaFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const ReservaForm: React.FC<ReservaFormProps> = ({
  reserva,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const { user } = useAuth();
  const { propiedades } = usePropiedadesReservas();
  const { usuarios, isLoading: isLoadingUsuarios } = useUsuarios();

  // 🔥 VERIFICAR SI ES ADMIN/SUPERUSER
  const isAdminUser = user?.role === 'ADMIN' || user?.role === 'SUPERUSER';

  // 🔥 VERIFICAR SI ESTÁ EDITANDO UNA RESERVA EXISTENTE
  const isEditing = !!reserva;

  const form = useForm<z.infer<typeof reservaSchema>>({
    resolver: zodResolver(reservaSchema),
    defaultValues: {
      propiedad: 0,
      fecha_checkin: new Date(),
      fecha_checkout: addDays(new Date(), 1),
      cant_huesp: 1,
      cant_noches: 1,
      monto_total: 0,
      descuento: 0,
      comentario_huesp: '',
      status: 'pendiente',
      pago_estado: 'pendiente',
      user: user?.id || 0,
    },
    mode: 'onChange', // 🔥 CAMBIADO: Validar mientras se escribe
  });

  const [montoBase, setMontoBase] = useState(0);
  const [montoConDescuento, setMontoConDescuento] = useState(0);
  const [nochesCalculadas, setNochesCalculadas] = useState(1);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔥 USAR EL HOOK PARA OBTENER FECHAS OCUPADAS REALES
  const propiedadSeleccionadaId = form.watch('propiedad');
  const { data: datosFechasOcupadas, isLoading: isLoadingFechas } = useFechasOcupadas(
    propiedadSeleccionadaId || null
  );

  // 🔥 FECHAS OCUPADAS EXCLUYENDO LA RESERVA ACTUAL (SI ESTÁ EDITANDO)
  const fechasOcupadas = React.useMemo(() => {
    if (!datosFechasOcupadas?.fechas_ocupadas) return [];

    if (isEditing && reserva) {
      // Excluir las fechas de la reserva actual para permitir la edición
      const fechaCheckin = new Date(reserva.fecha_checkin).toISOString().split('T')[0];
      const fechaCheckout = new Date(reserva.fecha_checkout).toISOString().split('T')[0];

      return datosFechasOcupadas.fechas_ocupadas.filter(fecha =>
        fecha !== fechaCheckin && fecha !== fechaCheckout
      );
    }

    return datosFechasOcupadas.fechas_ocupadas;
  }, [datosFechasOcupadas?.fechas_ocupadas, isEditing, reserva]);

  // 🔥 FUNCIÓN PARA BLOQUEAR FECHAS OCUPADAS
  const isFechaOcupada = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return fechasOcupadas.includes(dateString);
  };

  // 🔥 FUNCIÓN MEJORADA: Calcular noches automáticamente
  const calcularNoches = (checkin: Date | undefined, checkout: Date | undefined): number => {
    if (!checkin || !checkout) return 1;

    const diferencia = checkout.getTime() - checkin.getTime();
    const noches = Math.ceil(diferencia / (1000 * 60 * 60 * 24));

    return Math.max(1, noches);
  };

  // 🔥 FUNCIÓN MEJORADA: Calcular montos con validación
  const calcularMontos = () => {
    const propiedadId = form.getValues('propiedad');
    const propiedad = propiedades.find(p => p.id === propiedadId);
    const checkin = form.getValues('fecha_checkin');
    const checkout = form.getValues('fecha_checkout');
    const descuentoPorcentaje = form.getValues('descuento');

    // Calcular noches automáticamente
    const noches = calcularNoches(checkin, checkout);
    setNochesCalculadas(noches);
    form.setValue('cant_noches', noches, { shouldValidate: true });

    if (propiedad && noches > 0) {
      const montoBaseCalculado = propiedad.precio_noche * noches;
      const descuentoMonto = (montoBaseCalculado * descuentoPorcentaje) / 100;
      const montoFinal = Math.max(0, montoBaseCalculado - descuentoMonto);

      setMontoBase(montoBaseCalculado);
      setMontoConDescuento(montoFinal);
      form.setValue('monto_total', montoFinal, { shouldValidate: true });
    } else {
      setMontoBase(0);
      setMontoConDescuento(0);
      form.setValue('monto_total', 0, { shouldValidate: true });
    }
  };

  // Efectos para calcular cuando cambian los valores
  useEffect(() => {
    calcularMontos();
  }, [
    form.watch('propiedad'),
    form.watch('fecha_checkin'),
    form.watch('fecha_checkout'),
    form.watch('descuento')
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(amount);
  };

  // 🔥 CORREGIR: Manejar la carga de datos de reserva existente
  useEffect(() => {
    if (reserva) {
      console.log('📝 Cargando datos de reserva para editar:', reserva);

      // Convertir strings a Date objects
      const fechaCheckin = reserva.fecha_checkin ? new Date(reserva.fecha_checkin) : new Date();
      const fechaCheckout = reserva.fecha_checkout ? new Date(reserva.fecha_checkout) : addDays(new Date(), 1);

      form.reset({
        propiedad: reserva.propiedad,
        fecha_checkin: fechaCheckin,
        fecha_checkout: fechaCheckout,
        cant_huesp: reserva.cant_huesp,
        cant_noches: reserva.cant_noches,
        monto_total: reserva.monto_total,
        descuento: reserva.descuento,
        comentario_huesp: reserva.comentario_huesp || '',
        status: reserva.status,
        pago_estado: reserva.pago_estado || 'pendiente',
        user: reserva.user,
      });

      setTimeout(() => {
        calcularMontos();
      }, 100);
    }
  }, [reserva, form]);

  const handleSubmit = async (data: z.infer<typeof reservaSchema>) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Convertir Date objects a strings ISO para el backend
      const dataParaBackend: ReservaFormData = {
        ...data,
        fecha_checkin: data.fecha_checkin.toISOString().split('T')[0],
        fecha_checkout: data.fecha_checkout.toISOString().split('T')[0],
      };

      console.log('📤 Enviando datos al backend:', dataParaBackend);

      // 🔥 DIFERENCIAR ENTRE CREACIÓN Y ACTUALIZACIÓN
      if (isEditing && reserva) {
        // Para actualización, enviar solo los campos que han cambiado
        const datosActualizacion: Partial<ReservaFormData> = {};

        Object.keys(dataParaBackend).forEach(key => {
          const campo = key as keyof ReservaFormData;
          if (JSON.stringify(dataParaBackend[campo]) !== JSON.stringify((reserva as any)[campo])) {
            (datosActualizacion as any)[campo] = dataParaBackend[campo];
          }
        });

        console.log('🔄 Campos a actualizar:', datosActualizacion);
        await onSubmit(datosActualizacion as ReservaFormData);
      } else {
        await onSubmit(dataParaBackend);
      }
    } catch (error: any) {
      console.error('Error en ReservaForm:', error);
      if (error.response?.data?.fechas) {
        setSubmitError(error.response.data.fechas);
      } else if (error.response?.data?.fecha_checkin) {
        setSubmitError(error.response.data.fecha_checkin);
      } else if (error.response?.data?.fecha_checkout) {
        setSubmitError(error.response.data.fecha_checkout);
      } else if (error.response?.data?.non_field_errors) {
        setSubmitError(error.response.data.non_field_errors.join(', '));
      } else {
        setSubmitError("Ocurrió un error al procesar la reserva. Por favor, intente nuevamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const propiedadSeleccionada = propiedades.find(p => p.id === form.watch('propiedad'));
  const usuarioSeleccionado = usuarios.find(u => u.id === form.watch('user'));

  // 🔥 OBTENER USUARIO ACTUAL PARA MOSTRAR EN LUGAR DEL ID
  const getUsuarioDisplay = (userId: number) => {
    const usuario = usuarios.find(u => u.id === userId);
    if (!usuario) return `Usuario #${userId}`;
    return `${usuario.first_name} ${usuario.last_name} (@${usuario.username})`;
  };

  // 🔥 VERIFICAR SI EL FORMULARIO ES VÁLIDO
  const isFormValid = form.formState.isValid;

  return (
    <div className="relative max-w-4xl mx-auto">
      {/* 🔥 POPUP DE ERROR */}
      {submitError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0">
                <CalendarX className="h-6 w-6 text-red-500" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-red-800">
                  Error en la reserva
                </h4>
                <p className="text-red-700 mt-1">
                  {submitError}
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setSubmitError(null)}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                Entendido
              </Button>
            </div>
          </div>
        </div>
      )}

      <Card className="border shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800">
                  {isEditing ? 'Editar Reserva' : 'Nueva Reserva'}
                </CardTitle>
                {isEditing && (
                  <p className="text-sm text-gray-600 mt-1">
                    Editando reserva #{reserva?.id}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* 🔥 INDICADOR DE MODO EDICIÓN */}
          {isEditing && (
            <div className="mt-2">
              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                <Lock className="h-3 w-3 mr-1" />
                Modo edición - Algunos campos están bloqueados
              </Badge>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

              {/* 🔥 INDICADOR DE CARGA DE FECHAS OCUPADAS */}
              {isLoadingFechas && propiedadSeleccionadaId && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Consultando disponibilidad de fechas...</span>
                  </div>
                </div>
              )}

              {/* 🔥 INFO DE FECHAS OCUPADAS */}
              {!isLoadingFechas && propiedadSeleccionadaId && fechasOcupadas.length > 0 && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-700">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">
                      {fechasOcupadas.length} fecha(s) ocupada(s) en esta propiedad
                    </span>
                  </div>
                </div>
              )}

              {/* SELECTOR DE PROPIEDAD - BLOQUEADO EN EDICIÓN */}
              <FormField
                control={form.control}
                name="propiedad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-gray-700 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      Propiedad *
                      {isEditing && <Lock className="h-3 w-3 text-gray-400 ml-1" />}
                    </FormLabel>

                    <Select
                      onValueChange={(value) => {
                        field.onChange(Number(value));
                        setSubmitError(null);
                      }}
                      value={field.value?.toString()}
                      disabled={propiedades.length === 0 || isEditing} // 🔥 BLOQUEADO EN EDICIÓN
                    >
                      <FormControl>
                        <SelectTrigger className={cn(
                          "w-full",
                          isEditing && "bg-gray-100 border-gray-300 text-gray-600"
                        )}>
                          <SelectValue placeholder={
                            propiedades.length === 0
                              ? "No hay propiedades activas"
                              : isEditing
                                ? "Propiedad (no editable)"
                                : "Seleccionar propiedad"
                          } />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        <div className="p-2 bg-gray-50 border-b">
                          <p className="text-xs text-gray-600 font-semibold">
                            PROPIEDADES ACTIVAS ({propiedades.length})
                          </p>
                        </div>

                        {propiedades.map((propiedad) => (
                          <SelectItem
                            key={propiedad.id}
                            value={propiedad.id.toString()}
                          >
                            <div className="flex justify-between items-center w-full">
                              <span className="font-medium text-gray-800 truncate">
                                {propiedad.nombre}
                              </span>
                              <span className="text-sm text-green-600 font-bold whitespace-nowrap ml-2">
                                {formatCurrency(propiedad.precio_noche)}
                                <span className="text-gray-500 text-xs">/noche</span>
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {isEditing && (
                      <FormDescription className="text-gray-500 flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        La propiedad no puede cambiarse una vez creada la reserva
                      </FormDescription>
                    )}

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 🔥 CAMPO USUARIO - MEJORADO CON SELECTOR DE USUARIOS */}
              {isAdminUser && (
                <FormField
                  control={form.control}
                  name="user"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-gray-700 flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-blue-600" />
                        Usuario *
                        {isEditing && <Lock className="h-3 w-3 text-gray-400 ml-1" />}
                      </FormLabel>

                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value?.toString()}
                        disabled={isEditing || isLoadingUsuarios}
                      >
                        <FormControl>
                          <SelectTrigger className={cn(
                            "w-full",
                            isEditing && "bg-gray-100 border-gray-300 text-gray-600"
                          )}>
                            <SelectValue placeholder={
                              isLoadingUsuarios
                                ? "Cargando usuarios..."
                                : isEditing
                                  ? getUsuarioDisplay(field.value)
                                  : "Seleccionar usuario"
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <div className="p-2 bg-gray-50 border-b">
                            <p className="text-xs text-gray-600 font-semibold">
                              USUARIOS ACTIVOS ({usuarios.length})
                            </p>
                          </div>
                          {usuarios.map((usuario) => (
                            <SelectItem key={usuario.id} value={usuario.id.toString()}>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {usuario.first_name} {usuario.last_name}
                                </span>
                                <span className="text-sm text-gray-500">
                                  @{usuario.username} - {usuario.correo}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {isEditing && (
                        <FormDescription className="text-gray-500 flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          El usuario no puede cambiarse una vez creada la reserva
                        </FormDescription>
                      )}
                      {!isEditing && usuarioSeleccionado && (
                        <FormDescription className="text-green-600">
                          ✅ Seleccionado: {usuarioSeleccionado.first_name} {usuarioSeleccionado.last_name}
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* 🔥 CALENDARIO PARA CHECK-IN - SIN VALIDACIÓN DE FECHAS PASADAS EN EDICIÓN */}
              <FormField
                control={form.control}
                name="fecha_checkin"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="font-semibold text-gray-700">
                      Fecha de Check-in *
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={!propiedadSeleccionadaId || isLoadingFechas}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Seleccionar fecha de entrada</span>
                            )}
                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => isFechaOcupada(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      {isEditing
                        ? "Puedes ajustar las fechas dentro de la disponibilidad"
                        : "Selecciona la fecha de llegada"
                      }
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 🔥 CALENDARIO PARA CHECK-OUT - SIN VALIDACIÓN DE FECHAS PASADAS EN EDICIÓN */}
              <FormField
                control={form.control}
                name="fecha_checkout"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="font-semibold text-gray-700">
                      Fecha de Check-out *
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={!propiedadSeleccionadaId || isLoadingFechas || !form.watch('fecha_checkin')}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Seleccionar fecha de salida</span>
                            )}
                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => {
                            const checkin = form.watch('fecha_checkin');
                            const minDate = checkin ? addDays(checkin, 1) : new Date();
                            return date < minDate || isFechaOcupada(date);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      {isEditing
                        ? "Puedes ajustar las fechas dentro de la disponibilidad"
                        : "Selecciona la fecha de salida (mínimo 1 noche después del check-in)"
                      }
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 🔥 CAMPOS DE ESTADO Y PAGO - SOLO PARA ADMINS */}
              {isAdminUser && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-gray-700 flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-600" />
                          Estado de Reserva
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pendiente">⏳ Pendiente</SelectItem>
                            <SelectItem value="aceptada">✅ Aceptada</SelectItem>
                            <SelectItem value="confirmada">🔒 Confirmada</SelectItem>
                            <SelectItem value="rechazada">❌ Rechazada</SelectItem>
                            <SelectItem value="cancelada">🚫 Cancelada</SelectItem>
                            <SelectItem value="completada">🏁 Completada</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pago_estado"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-gray-700 flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-blue-600" />
                          Estado de Pago
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar estado de pago" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pendiente">⏰ Pendiente</SelectItem>
                            <SelectItem value="pagado">💳 Pagado</SelectItem>
                            <SelectItem value="reembolsado">↩️ Reembolsado</SelectItem>
                            <SelectItem value="fallido">❌ Fallido</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Campos de huéspedes y descuento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cant_huesp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-gray-700">
                        Número de Huéspedes
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max={propiedadSeleccionada?.max_huespedes || 50}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Máximo permitido: {propiedadSeleccionada?.max_huespedes || 50} huéspedes
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descuento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-gray-700">
                        Descuento (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Campos ocultos */}
              <FormField
                control={form.control}
                name="cant_noches"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input type="hidden" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="monto_total"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input type="hidden" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Información de precios */}
              <div className="bg-blue-50 p-4 rounded-lg border">
                <h4 className="font-semibold text-gray-800 mb-2">Resumen de Precios</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Precio por noche:</p>
                    <p className="font-bold text-green-600">
                      {formatCurrency(propiedadSeleccionada?.precio_noche || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Noches:</p>
                    <p className="font-bold text-blue-600">{nochesCalculadas}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total:</p>
                    <p className="font-bold text-green-600">{formatCurrency(montoConDescuento)}</p>
                  </div>
                </div>

                {reserva?.descuento && reserva.descuento > 0 && (
                  <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                    <p className="text-sm text-green-700">
                      💰 Descuento aplicado: {reserva.descuento}%
                      ({formatCurrency((montoBase * reserva.descuento) / 100)})
                    </p>
                  </div>
                )}
              </div>

              {/* Comentario */}
              <FormField
                control={form.control}
                name="comentario_huesp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-gray-700">
                      Comentarios (Opcional)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Comentarios o requerimientos especiales..."
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 🔥 DEBUG: Mostrar estado del formulario */}
              <div className="p-3 bg-gray-50 rounded-lg border">
                <p className="text-sm text-gray-600">
                  Estado del formulario: {isFormValid ? '✅ Válido' : '❌ Inválido'}
                </p>
                {Object.keys(form.formState.errors).length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-red-600 font-semibold">Errores:</p>
                    <ul className="text-sm text-red-600 list-disc list-inside">
                      {Object.entries(form.formState.errors).map(([key, error]) => (
                        <li key={key}>{key}: {error.message}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Botones */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={isSubmitting || !isFormValid}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : isEditing ? (
                    <Edit className="h-4 w-4 mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isEditing ? 'Actualizar Reserva' : 'Crear Reserva'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReservaForm;