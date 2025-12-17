import React, { useState } from 'react';
import { Calendar, MapPin, Hotel, Sparkles, ChevronRight, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import calendarioData from '@/data/dato.json';

interface Evento {
  dia: number;
  evento: string;
  tipo_evento: string;
  lugar: string;
  provincia: string;
  hospedajes_cercanos: Array<{
    nombre: string;
    tipo: string;
  }>;
}

interface MesData {
  mes: string;
  eventos: Evento[];
}

const meses = [
  { nombre: 'ENERO', num: 1, color: 'from-blue-500 to-cyan-500', emoji: '❄️' },
  { nombre: 'FEBRERO', num: 2, color: 'from-pink-500 to-rose-500', emoji: '💖' },
  { nombre: 'MARZO', num: 3, color: 'from-green-500 to-emerald-500', emoji: '🌱' },
  { nombre: 'ABRIL', num: 4, color: 'from-yellow-500 to-amber-500', emoji: '🌸' },
  { nombre: 'MAYO', num: 5, color: 'from-purple-500 to-violet-500', emoji: '🌺' },
  { nombre: 'JUNIO', num: 6, color: 'from-orange-500 to-red-500', emoji: '☀️' },
  { nombre: 'JULIO', num: 7, color: 'from-indigo-500 to-blue-500', emoji: '🎆' },
  { nombre: 'AGOSTO', num: 8, color: 'from-teal-500 to-cyan-500', emoji: '🌊' },
  { nombre: 'SEPTIEMBRE', num: 9, color: 'from-red-500 to-pink-500', emoji: '🍂' },
  { nombre: 'OCTUBRE', num: 10, color: 'from-amber-500 to-orange-500', emoji: '🎃' },
  { nombre: 'NOVIEMBRE', num: 11, color: 'from-purple-500 to-pink-500', emoji: '🍁' },
  { nombre: 'DICIEMBRE', num: 12, color: 'from-green-600 to-red-600', emoji: '🎄' }
];

const tipoEventoIcons: { [key: string]: string } = {
  'Nacional': '🇧🇴',
  'Religioso': '⛪',
  'Histórico': '📜',
  'Cívico': '🏛️',
  'Cultural': '🎭',
  'Histórico / Religioso': '📜⛪'
};

export const CalendarioInteractivo: React.FC = () => {
  const [mesSeleccionado, setMesSeleccionado] = useState<string | null>(null);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null);

  const datos = calendarioData.calendario_anual_habita_ai as MesData[];

  const handleMesClick = (nombreMes: string) => {
    setMesSeleccionado(nombreMes);
    setEventoSeleccionado(null);
  };

  const handleEventoClick = (evento: Evento) => {
    setEventoSeleccionado(evento);
  };

  const eventosDelMes = datos.find(m => m.mes === mesSeleccionado)?.eventos || [];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-3">
          <Calendar className="w-10 h-10 text-primary" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Calendario de Eventos 2025
          </h1>
          <Sparkles className="w-10 h-10 text-yellow-500" />
        </div>
        
        {!mesSeleccionado && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-2 border-primary/30 rounded-lg p-6 mx-auto max-w-2xl"
          >
            <p className="text-xl font-semibold text-foreground flex items-center justify-center gap-2">
              <Info className="w-6 h-6 text-primary animate-pulse" />
              Selecciona un mes para descubrir eventos y hospedajes cercanos
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Explora los eventos de Santa Cruz, Bolivia y encuentra el lugar perfecto para hospedarte
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Selector de Meses */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {meses.map((mes, index) => {
          const cantidadEventos = datos.find(m => m.mes === mes.nombre)?.eventos.length || 0;
          const isSelected = mesSeleccionado === mes.nombre;
          
          return (
            <motion.div
              key={mes.nombre}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card
                className={`cursor-pointer transition-all duration-300 hover:shadow-xl ${
                  isSelected
                    ? 'ring-4 ring-primary shadow-2xl scale-105'
                    : 'hover:ring-2 hover:ring-primary/50'
                }`}
                onClick={() => handleMesClick(mes.nombre)}
              >
                <CardHeader className="p-4 space-y-2">
                  <div className={`text-3xl mb-2 bg-gradient-to-br ${mes.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto shadow-lg`}>
                    {mes.emoji}
                  </div>
                  <CardTitle className="text-center text-lg font-bold">
                    {mes.nombre}
                  </CardTitle>
                  <Badge variant="secondary" className="mx-auto">
                    {cantidadEventos} evento{cantidadEventos !== 1 ? 's' : ''}
                  </Badge>
                </CardHeader>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Lista de Eventos del Mes Seleccionado */}
      <AnimatePresence mode="wait">
        {mesSeleccionado && (
          <motion.div
            key={mesSeleccionado}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold flex items-center gap-2">
                {meses.find(m => m.nombre === mesSeleccionado)?.emoji}
                Eventos de {mesSeleccionado}
              </h2>
              <Button
                variant="outline"
                onClick={() => {
                  setMesSeleccionado(null);
                  setEventoSeleccionado(null);
                }}
              >
                Ver todos los meses
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {eventosDelMes.map((evento, index) => (
                <motion.div
                  key={`${evento.dia}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.03 }}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-300 hover:shadow-xl ${
                      eventoSeleccionado === evento
                        ? 'ring-4 ring-purple-500 shadow-2xl'
                        : 'hover:ring-2 hover:ring-purple-300'
                    }`}
                    onClick={() => handleEventoClick(evento)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <Badge variant="default" className="text-lg px-3 py-1">
                          {evento.dia} {mesSeleccionado}
                        </Badge>
                        <span className="text-2xl">
                          {tipoEventoIcons[evento.tipo_evento] || '📅'}
                        </span>
                      </div>
                      <CardTitle className="text-xl mt-3 leading-tight">
                        {evento.evento}
                      </CardTitle>
                      <CardDescription className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4" />
                          {evento.lugar}, {evento.provincia}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {evento.tipo_evento}
                        </Badge>
                      </CardDescription>
                    </CardHeader>
                    
                    {evento.hospedajes_cercanos.length > 0 && (
                      <CardContent>
                        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-2">
                          <Hotel className="w-4 h-4" />
                          {evento.hospedajes_cercanos.length} hospedaje{evento.hospedajes_cercanos.length !== 1 ? 's' : ''}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detalle del Evento Seleccionado */}
      <AnimatePresence>
        {eventoSeleccionado && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setEventoSeleccionado(null)}
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <Card className="border-0">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-xl">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-lg px-4 py-2 bg-white/20 text-white border-white/30">
                          {eventoSeleccionado.dia} {mesSeleccionado}
                        </Badge>
                        <span className="text-4xl">
                          {tipoEventoIcons[eventoSeleccionado.tipo_evento] || '📅'}
                        </span>
                      </div>
                      <CardTitle className="text-3xl font-bold">
                        {eventoSeleccionado.evento}
                      </CardTitle>
                      <CardDescription className="text-white/90 text-base">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5" />
                          {eventoSeleccionado.lugar}, Provincia {eventoSeleccionado.provincia}
                        </div>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6 space-y-6">
                  <div>
                    <Badge variant="outline" className="text-base px-4 py-2">
                      {eventoSeleccionado.tipo_evento}
                    </Badge>
                  </div>

                  {eventoSeleccionado.hospedajes_cercanos.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold flex items-center gap-2">
                        <Hotel className="w-6 h-6 text-primary" />
                        Hospedajes Cercanos
                      </h3>
                      <div className="grid gap-3">
                        {eventoSeleccionado.hospedajes_cercanos.map((hospedaje, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Card className="border-2 border-primary/20 hover:border-primary/50 transition-all hover:shadow-lg">
                              <CardHeader className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="space-y-1">
                                    <CardTitle className="text-xl flex items-center gap-2">
                                      <Hotel className="w-5 h-5 text-primary" />
                                      {hospedaje.nombre}
                                    </CardTitle>
                                    <Badge variant="secondary" className="text-sm">
                                      {hospedaje.tipo}
                                    </Badge>
                                  </div>
                                  <ChevronRight className="w-6 h-6 text-muted-foreground" />
                                </div>
                              </CardHeader>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setEventoSeleccionado(null)}
                    >
                      Cerrar
                    </Button>
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                      Buscar Hospedajes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarioInteractivo;
