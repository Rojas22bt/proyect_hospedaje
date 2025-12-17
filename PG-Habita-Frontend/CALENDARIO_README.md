# 📅 Calendario de Eventos - Habita AI

## 🎯 Descripción

Nueva funcionalidad interactiva que permite a los usuarios explorar eventos importantes de Santa Cruz, Bolivia durante todo el año 2025, junto con recomendaciones de hospedajes cercanos.

## ✨ Características

### 🎨 Diseño Interactivo
- **Selector de Meses Visual**: 12 tarjetas coloridas con emojis temáticos
- **Animaciones Suaves**: Transiciones fluidas con Framer Motion
- **Diseño Responsivo**: Adaptable a móviles, tablets y desktop
- **Gradientes Personalizados**: Cada mes tiene su propia paleta de colores

### 📋 Funcionalidades

1. **Vista Principal**
   - Mensaje de bienvenida llamativo
   - Grid de 12 meses con contador de eventos
   - Indicador visual del mes seleccionado

2. **Vista de Eventos por Mes**
   - Lista de todos los eventos del mes seleccionado
   - Información detallada de cada evento:
     - Fecha y nombre del evento
     - Tipo de evento (Nacional, Religioso, Histórico, Cívico, Cultural)
     - Ubicación y provincia
     - Cantidad de hospedajes cercanos
   - Iconos personalizados por tipo de evento

3. **Modal de Detalle de Evento**
   - Vista ampliada del evento seleccionado
   - Lista completa de hospedajes cercanos con:
     - Nombre del hospedaje
     - Tipo de hospedaje
   - Botón de acción para buscar disponibilidad

### 🎭 Tipos de Eventos Soportados

- 🇧🇴 **Nacional**: Fechas patrias y celebraciones nacionales
- ⛪ **Religioso**: Festividades religiosas y patronales
- 📜 **Histórico**: Aniversarios y conmemoraciones históricas
- 🏛️ **Cívico**: Fundaciones de ciudades y provincias
- 🎭 **Cultural**: Eventos culturales como EXPOCRUZ

## 🚀 Integración

### Archivos Creados

1. **`src/components/calendario/CalendarioInteractivo.tsx`**
   - Componente principal del calendario
   - Lógica de selección de meses y eventos
   - Interfaces TypeScript para tipado fuerte

2. **`src/pages/CalendarioPage.tsx`**
   - Página contenedora del calendario
   - Wrapper para el componente principal

### Archivos Modificados

1. **`src/components/layout/Sidebar.tsx`**
   - Agregada opción "Calendario" en todos los niveles de usuario
   - Iconos diferenciados: CalendarDays para eventos, BookOpen para reservas

2. **`src/App.tsx`**
   - Nueva ruta protegida `/calendario`
   - Importación de CalendarioPage

### Dependencias Instaladas

- **framer-motion**: ^11.x - Para animaciones fluidas y transiciones

## 📊 Datos

Los datos se cargan desde `src/data/dato.json` que contiene:
- 12 meses del año 2025
- Eventos de Santa Cruz, Bolivia
- Información detallada de ubicaciones
- Hospedajes cercanos recomendados

## 🎨 Paleta de Colores por Mes

| Mes | Gradiente | Emoji |
|-----|-----------|-------|
| Enero | Azul a Cyan | ❄️ |
| Febrero | Rosa a Rose | 💖 |
| Marzo | Verde a Esmeralda | 🌱 |
| Abril | Amarillo a Ámbar | 🌸 |
| Mayo | Púrpura a Violeta | 🌺 |
| Junio | Naranja a Rojo | ☀️ |
| Julio | Índigo a Azul | 🎆 |
| Agosto | Verde azulado a Cyan | 🌊 |
| Septiembre | Rojo a Rosa | 🍂 |
| Octubre | Ámbar a Naranja | 🎃 |
| Noviembre | Púrpura a Rosa | 🍁 |
| Diciembre | Verde a Rojo | 🎄 |

## 🔐 Acceso

La vista está disponible para:
- ✅ Huéspedes (usuarios básicos)
- ✅ Anfitriones (usuarios premium)
- ✅ Administradores
- ✅ Superusuarios

Todos los usuarios autenticados pueden acceder al calendario desde el sidebar.

## 🎯 Casos de Uso

1. **Planificación de Viajes**: Usuarios pueden ver eventos importantes y planificar sus estadías
2. **Descubrimiento de Eventos**: Explorar la cultura y festividades de Santa Cruz
3. **Búsqueda de Hospedaje**: Ver opciones de alojamiento cerca de eventos específicos
4. **Turismo Cultural**: Conocer fechas importantes para turismo religioso e histórico

## 🔄 Flujo de Usuario

1. Usuario hace clic en "Calendario" en el sidebar
2. Ve el mensaje de bienvenida y el grid de 12 meses
3. Selecciona un mes de interés
4. Explora los eventos del mes
5. Hace clic en un evento para ver detalles
6. Revisa hospedajes cercanos
7. Puede buscar disponibilidad (funcionalidad futura)

## 🚧 Mejoras Futuras

- [ ] Integrar con sistema de reservas
- [ ] Filtros por tipo de evento
- [ ] Búsqueda de eventos por palabra clave
- [ ] Integración con Google Maps para ubicaciones
- [ ] Sistema de favoritos para eventos
- [ ] Notificaciones de eventos próximos
- [ ] Exportar calendario a Google Calendar/iCal
- [ ] Reviews de hospedajes

## 💡 Notas Técnicas

- Componente 100% TypeScript con interfaces tipadas
- Uso de React hooks (useState)
- Animaciones con Framer Motion para mejor UX
- Componentes de shadcn/ui para consistencia de diseño
- Responsive design con Tailwind CSS
- Datos estáticos desde JSON (preparado para API futura)

---

**Desarrollado con ❤️ para Habita AI - Tu asistente de hospedaje inteligente**
