import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, AlertTriangle, Clock, Ban } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { BajaPropiedadData } from '@/types/auth';
import { toast } from '@/hooks/use-toast';

interface DarBajaPropiedadProps {
    propiedad: {
        id: number;
        nombre: string;
        esta_disponible: boolean;
        estado_baja: string;
    };
    onBajaSuccess: (data: BajaPropiedadData) => void;
    onCancel: () => void;
}

const DarBajaPropiedad: React.FC<DarBajaPropiedadProps> = ({
    propiedad,
    onBajaSuccess,
    onCancel
}) => {
    const [tipoBaja, setTipoBaja] = useState<'temporal' | 'indefinida'>('temporal');
    const [fechaBajaFin, setFechaBajaFin] = useState<Date>();
    const [motivoBaja, setMotivoBaja] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (tipoBaja === 'temporal' && !fechaBajaFin) {
            toast({
                title: "❌ Fecha requerida",
                description: "Para baja temporal, debes seleccionar una fecha de fin.",
                variant: "destructive",
            });
            return;
        }

        if (tipoBaja === 'temporal' && fechaBajaFin && fechaBajaFin <= new Date()) {
            toast({
                title: "❌ Fecha inválida",
                description: "La fecha de fin debe ser posterior a la fecha actual.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const bajaData: BajaPropiedadData = {
                tipo_baja: tipoBaja,
                motivo_baja: motivoBaja || undefined,
                fecha_baja_fin: tipoBaja === 'temporal' && fechaBajaFin
                    ? format(fechaBajaFin, 'yyyy-MM-dd')
                    : undefined
            };

            onBajaSuccess(bajaData);
        } catch (error: any) {
            toast({
                title: "❌ Error al dar de baja",
                description: error.message || 'No se pudo dar de baja la propiedad',
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                    <Ban className="h-5 w-5" />
                    Dar de Baja Propiedad
                </CardTitle>
                <CardDescription>
                    Gestiona la disponibilidad de "{propiedad.nombre}"
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Alerta de advertencia */}
                <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-yellow-800">Advertencia</h4>
                        <p className="text-yellow-700 text-sm mt-1">
                            Al dar de baja esta propiedad, no estará disponible para nuevas reservas
                            hasta que sea reactivada.
                        </p>
                    </div>
                </div>

                {/* Tipo de baja */}
                <div className="space-y-4">
                    <h4 className="font-semibold">Tipo de Baja</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card
                            className={cn(
                                "cursor-pointer border-2 transition-all duration-200",
                                tipoBaja === 'temporal'
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-300 bg-white"
                            )}
                            onClick={() => setTipoBaja('temporal')}
                        >
                            <CardContent className="p-4 flex items-center gap-3">
                                <Clock className={cn(
                                    "h-6 w-6",
                                    tipoBaja === 'temporal' ? "text-blue-600" : "text-gray-400"
                                )} />
                                <div>
                                    <h5 className="font-semibold">Baja Temporal</h5>
                                    <p className="text-sm text-gray-600">
                                        La propiedad volverá a estar disponible automáticamente
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card
                            className={cn(
                                "cursor-pointer border-2 transition-all duration-200",
                                tipoBaja === 'indefinida'
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-300 bg-white"
                            )}
                            onClick={() => setTipoBaja('indefinida')}
                        >
                            <CardContent className="p-4 flex items-center gap-3">
                                <Ban className={cn(
                                    "h-6 w-6",
                                    tipoBaja === 'indefinida' ? "text-red-600" : "text-gray-400"
                                )} />
                                <div>
                                    <h5 className="font-semibold">Baja Indefinida</h5>
                                    <p className="text-sm text-gray-600">
                                        La propiedad permanecerá inactiva hasta reactivación manual
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Fecha de fin para baja temporal */}
                {tipoBaja === 'temporal' && (
                    <div className="space-y-3">
                        <label className="font-semibold">
                            Fecha de Reactivación Automática
                        </label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !fechaBajaFin && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {fechaBajaFin ? (
                                        format(fechaBajaFin, "PPP", { locale: es })
                                    ) : (
                                        <span>Selecciona una fecha</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={fechaBajaFin}
                                    onSelect={setFechaBajaFin}
                                    disabled={(date) => date <= new Date()}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <p className="text-sm text-gray-600">
                            La propiedad se reactivará automáticamente en esta fecha
                        </p>
                    </div>
                )}

                {/* Motivo de baja */}
                <div className="space-y-3">
                    <label className="font-semibold">
                        Motivo de la Baja (Opcional)
                    </label>
                    <Textarea
                        placeholder="Ej: Mantenimiento, Reformas, Temporada baja..."
                        value={motivoBaja}
                        onChange={(e) => setMotivoBaja(e.target.value)}
                        className="min-h-[80px]"
                    />
                </div>

                {/* Acciones */}
                <div className="flex justify-end gap-4 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isSubmitting ? "Procesando..." : "Confirmar Baja"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default DarBajaPropiedad;