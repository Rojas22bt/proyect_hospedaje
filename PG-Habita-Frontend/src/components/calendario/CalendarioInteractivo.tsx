import React, { useState } from 'react';
import { Calendar, MapPin, Hotel, Sparkles, ChevronRight, Info, MessageCircle, Wand2, Send, Loader2, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import calendarioData from '@/data/dato.json';
import { aiService } from '@/services/ai.service';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

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
  const [mostrarAsistenteIA, setMostrarAsistenteIA] = useState(false);
  const [preguntaUsuario, setPreguntaUsuario] = useState('');
  const [respuestaIA, setRespuestaIA] = useState('');
  const [cargandoIA, setCargandoIA] = useState(false);
  const [recomendacionEvento, setRecomendacionEvento] = useState<string | null>(null);
  const [cargandoRecomendacion, setCargandoRecomendacion] = useState(false);

  const datos = calendarioData.calendario_anual_habita_ai as MesData[];

  const handleMesClick = (nombreMes: string) => {
    setMesSeleccionado(nombreMes);
    setEventoSeleccionado(null);
  };

  const handleEventoClick = async (evento: Evento) => {
    setEventoSeleccionado(evento);
    setRecomendacionEvento(null);
    
    // Cargar recomendaciones de IA automáticamente
    setCargandoRecomendacion(true);
    try {
      const recomendacion = await aiService.obtenerRecomendacionesEvento(
        evento.evento,
        mesSeleccionado || '',
        evento.lugar
      );
      setRecomendacionEvento(recomendacion);
    } catch (error) {
      console.error('Error al obtener recomendaciones:', error);
      setRecomendacionEvento('No se pudieron cargar las recomendaciones en este momento.');
    } finally {
      setCargandoRecomendacion(false);
    }
  };

  const handlePreguntaIA = async () => {
    if (!preguntaUsuario.trim()) return;
    
    setCargandoIA(true);
    setRespuestaIA('');
    
    try {
      const contexto = mesSeleccionado 
        ? datos.find(m => m.mes === mesSeleccionado)
        : datos;
      
      const respuesta = await aiService.responderPregunta(preguntaUsuario, contexto);
      setRespuestaIA(respuesta);
    } catch (error) {
      console.error('Error al consultar IA:', error);
      setRespuestaIA('Lo siento, no pude procesar tu pregunta en este momento. Por favor, intenta de nuevo.');
    } finally {
      setCargandoIA(false);
    }
  };

  const handleBuscarPorInteres = async (interes: string) => {
    setCargandoIA(true);
    setRespuestaIA('');
    
    try {
      const respuesta = await aiService.buscarEventosPorInteres(interes, datos);
      setRespuestaIA(respuesta);
      setMostrarAsistenteIA(true);
    } catch (error) {
      console.error('Error al buscar eventos:', error);
      setRespuestaIA('No pude encontrar eventos en este momento.');
    } finally {
      setCargandoIA(false);
    }
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
            
            {/* Botones de búsqueda rápida por IA */}
            <div className="mt-4 space-y-2">
              <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-purple-500" />
                Búsqueda inteligente:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBuscarPorInteres('eventos culturales')}
                  className="hover:bg-purple-500/10"
                >
                  🎭 Eventos Culturales
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBuscarPorInteres('eventos religiosos')}
                  className="hover:bg-purple-500/10"
                >
                  ⛪ Eventos Religiosos
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBuscarPorInteres('eventos históricos')}
                  className="hover:bg-purple-500/10"
                >
                  📜 Eventos Históricos
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBuscarPorInteres('eventos en naturaleza')}
                  className="hover:bg-purple-500/10"
                >
                  🌿 Naturaleza
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Botón flotante de Asistente IA - Mejorado */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="relative"
        >
          {/* Efecto de pulso */}
          {!mostrarAsistenteIA && (
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
            />
          )}
          
          <Button
            onClick={() => setMostrarAsistenteIA(!mostrarAsistenteIA)}
            className="relative w-16 h-16 rounded-full shadow-2xl bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 hover:from-purple-600 hover:via-purple-700 hover:to-pink-600 flex items-center justify-center border-4 border-white dark:border-gray-900 transition-all duration-300"
            size="lg"
          >
            <AnimatePresence mode="wait">
              {mostrarAsistenteIA ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-8 h-8" />
                </motion.div>
              ) : (
                <motion.div
                  key="sparkles"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sparkles className="w-8 h-8" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>

          {/* Badge de "Pregúntame" */}
          {!mostrarAsistenteIA && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute -left-28 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full shadow-lg border-2 border-purple-200 dark:border-purple-800"
            >
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 whitespace-nowrap">
                ¡Pregúntame! 💬
              </p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Panel de Asistente IA - Diseño Mejorado */}
      <AnimatePresence>
        {mostrarAsistenteIA && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-40 w-[420px] max-h-[650px] shadow-2xl"
          >
            <Card className="border-0 overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
              {/* Header del Chat */}
              <CardHeader className="bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 text-white p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center ring-2 ring-white/30">
                        <Sparkles className="w-7 h-7 text-white animate-pulse" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold">María - Tu Guía IA</CardTitle>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                          <span className="text-xs text-white/90 font-medium">En línea</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMostrarAsistenteIA(false)}
                      className="text-white hover:bg-white/20 rounded-full"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                  <CardDescription className="text-white/95 text-sm font-medium relative z-10">
                    Experta local en eventos y hospedajes de Santa Cruz 🇧🇴
                  </CardDescription>
                </div>
              </CardHeader>

              {/* Área de Chat */}
              <CardContent className="p-6 space-y-4 max-h-[420px] overflow-y-auto bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900 dark:to-gray-800">
                {/* Mensaje de Bienvenida */}
                {!respuestaIA && !cargandoIA && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm p-4 shadow-md border border-purple-100 dark:border-purple-900 flex-1">
                        <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">María</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          ¡Hola! 👋 Soy María, tu guía turística personal. Estoy aquí para ayudarte a descubrir los mejores eventos y hospedajes en Santa Cruz. 
                          <br /><br />
                          ¿Qué te gustaría saber? 😊
                        </p>
                      </div>
                    </div>

                    {/* Sugerencias Rápidas */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2">
                        Prueba preguntar:
                      </p>
                      <div className="space-y-2">
                        {[
                          { texto: '¿Qué eventos hay en febrero?', icono: '📅' },
                          { texto: '¿Dónde hospedarme para el Carnaval?', icono: '🏨' },
                          { texto: 'Recomiéndame eventos culturales', icono: '🎭' },
                          { texto: '¿Cuál es el mejor mes para visitar?', icono: '🌟' }
                        ].map((sugerencia, index) => (
                          <motion.button
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => {
                              setPreguntaUsuario(sugerencia.texto);
                              handlePreguntaIA();
                            }}
                            className="w-full text-left bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/40 dark:hover:to-pink-900/40 p-3 rounded-xl border border-purple-200 dark:border-purple-800 transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                              <span className="text-base">{sugerencia.icono}</span>
                              {sugerencia.texto}
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Pregunta del Usuario */}
                {(respuestaIA || cargandoIA) && preguntaUsuario && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex justify-end gap-3"
                  >
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl rounded-tr-sm p-4 shadow-md max-w-[85%]">
                      <p className="text-sm leading-relaxed">{preguntaUsuario}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center flex-shrink-0 text-lg">
                      👤
                    </div>
                  </motion.div>
                )}

                {/* Estado de Carga */}
                {cargandoIA && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm p-4 shadow-md border border-purple-100 dark:border-purple-900">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">María está pensando...</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Respuesta de IA */}
                {respuestaIA && !cargandoIA && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm p-4 shadow-md border border-purple-100 dark:border-purple-900 flex-1">
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">María</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                        {respuestaIA}
                      </p>
                      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setRespuestaIA('');
                            setPreguntaUsuario('');
                          }}
                          className="text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/30"
                        >
                          ✨ Nueva pregunta
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>

              {/* Input de Chat */}
              <div className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Escribe tu pregunta aquí... ✍️"
                    value={preguntaUsuario}
                    onChange={(e) => setPreguntaUsuario(e.target.value)}
                    className="min-h-[60px] resize-none border-2 border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600 rounded-xl bg-white dark:bg-gray-800"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handlePreguntaIA();
                      }
                    }}
                    disabled={cargandoIA}
                  />
                  <Button
                    onClick={handlePreguntaIA}
                    disabled={cargandoIA || !preguntaUsuario.trim()}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl px-6 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    size="lg"
                  >
                    {cargandoIA ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
                  Presiona Enter para enviar • Shift + Enter para nueva línea
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

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

                  {/* Recomendaciones de IA para el evento - Mejorado */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white animate-pulse" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400">
                          Consejos de María
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Tu guía turística personal con IA
                        </p>
                      </div>
                    </div>
                    
                    {cargandoRecomendacion ? (
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-800">
                        <div className="flex items-center justify-center gap-3">
                          <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                          <div className="text-center">
                            <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                              María está preparando tus recomendaciones...
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Esto solo tomará un momento ✨
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : recomendacionEvento ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-purple-950/30 rounded-xl p-5 border-2 border-purple-200 dark:border-purple-800 shadow-lg"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm">👋</span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
                              María dice:
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Recomendaciones personalizadas para ti
                            </p>
                          </div>
                        </div>
                        <div className="bg-white/60 dark:bg-gray-900/60 rounded-lg p-4 backdrop-blur-sm">
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                            {recomendacionEvento}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-purple-200 dark:border-purple-700">
                          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                            💡 Consejo generado con IA
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setMostrarAsistenteIA(true);
                              setPreguntaUsuario(`Cuéntame más sobre ${eventoSeleccionado.evento}`);
                            }}
                            className="text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-100 dark:hover:bg-purple-950/50"
                          >
                            Preguntar más 💬
                          </Button>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-xl border-2 border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <Info className="w-5 h-5" />
                          <p className="text-sm font-semibold">Recomendaciones no disponibles</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          No pudimos cargar las recomendaciones de IA en este momento. 
                          Intenta preguntarle a María directamente usando el chat. 💬
                        </p>
                      </div>
                    )}
                  </div>

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
