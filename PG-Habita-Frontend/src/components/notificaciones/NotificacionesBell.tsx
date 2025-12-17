import React, { useState } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotificaciones } from '@/hooks/useNotificaciones';
import { Notificacion } from '@/types/auth';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';

const NotificacionesBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notificacionesNoLeidas,
    countNoLeidas,
    marcarLeida,
    marcarTodasLeidas,
    deleteNotificacion,
    isLoading,
  } = useNotificaciones();

  const handleMarcarLeida = (notificacion: Notificacion) => {
    marcarLeida({ id: notificacion.id, leida: true });
  };

  const handleEliminar = (notificacion: Notificacion) => {
    deleteNotificacion(notificacion.id);
  };

  const handleMarcarTodasLeidas = () => {
    marcarTodasLeidas();
    setIsOpen(false);
  };

  const getTipoIcono = (tipo: string) => {
    const iconos: { [key: string]: string } = {
      'reserva_creada': '🎉',
      'reserva_confirmada': '✅',
      'reserva_cancelada': '❌',
      'pago_recibido': '💰',
      'pago_fallido': '⚠️',
      'sistema': '🔔',
    };
    return iconos[tipo] || '📢';
  };

  const getTipoColor = (tipo: string) => {
    const colores: { [key: string]: string } = {
      'reserva_creada': 'text-blue-500',
      'reserva_confirmada': 'text-green-500',
      'reserva_cancelada': 'text-red-500',
      'pago_recibido': 'text-green-600',
      'pago_fallido': 'text-orange-500',
      'sistema': 'text-gray-500',
    };
    return colores[tipo] || 'text-gray-500';
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {countNoLeidas > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {countNoLeidas > 9 ? '9+' : countNoLeidas}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificaciones</span>
          {countNoLeidas > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarcarTodasLeidas}
              className="text-xs h-6"
            >
              <Check className="h-3 w-3 mr-1" />
              Marcar todas
            </Button>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <ScrollArea className="h-80">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              Cargando notificaciones...
            </div>
          ) : notificacionesNoLeidas.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No hay notificaciones nuevas
            </div>
          ) : (
            notificacionesNoLeidas.map((notificacion) => (
              <DropdownMenuItem
                key={notificacion.id}
                className="flex flex-col items-start p-3 cursor-pointer border-b border-gray-100 last:border-b-0"
                onSelect={() => handleMarcarLeida(notificacion)}
              >
                <div className="flex items-start justify-between w-full">
                  <div className="flex items-start space-x-2 flex-1">
                    <span className={`text-lg ${getTipoColor(notificacion.tipo)}`}>
                      {getTipoIcono(notificacion.tipo)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 line-clamp-1">
                        {notificacion.titulo}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {notificacion.mensaje}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notificacion.creado_en).toLocaleDateString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-2 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEliminar(notificacion);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                {notificacion.reserva && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    Reserva #{notificacion.reserva}
                  </Badge>
                )}
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>

        {notificacionesNoLeidas.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-center justify-center text-sm text-blue-600 font-medium"
              onSelect={() => setIsOpen(false)}
            >
              Ver todas las notificaciones
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificacionesBell;