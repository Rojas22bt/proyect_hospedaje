# 🎨 Frontend Habita - Guía de Uso

## 📋 Servicios API Disponibles

El frontend incluye servicios completos para todas las funcionalidades:

### 🔐 Autenticación (`api.ts`)
- `login(credentials)` - Iniciar sesión
- `register(userData)` - Registrar nuevo usuario
- `refreshToken(refresh)` - Refrescar token JWT
- `getProfile()` - Obtener perfil del usuario actual

### 👥 Usuarios (`api.ts`)
- `fetchUsuarios()` - Listar todos los usuarios
- `fetchUsuario(id)` - Obtener un usuario específico
- `createUsuario(data)` - Crear nuevo usuario
- `updateUsuario(id, data)` - Actualizar usuario
- `deleteUsuario(id)` - Eliminar usuario

### 🔑 Roles y Permisos
**Roles** (`rolesService.ts` / `api.ts`)
- `fetchRoles()` - Listar roles
- `createRol(data)` - Crear rol
- `updateRol(id, data)` - Actualizar rol
- `deleteRol(id)` - Eliminar rol

**Permisos** (`permisosService.ts` / `api.ts`)
- `fetchPermisos()` - Listar permisos
- `createPermiso(data)` - Crear permiso
- `updatePermiso(id, data)` - Actualizar permiso
- `deletePermiso(id)` - Eliminar permiso

### 💳 Suscripciones (`api.ts`)
- `fetchSuscripciones()` - Listar suscripciones
- `fetchSuscripcion(id)` - Obtener suscripción
- `createSuscripcion(data)` - Crear suscripción
- `updateSuscripcion(id, data)` - Actualizar suscripción
- `deleteSuscripcion(id)` - Eliminar suscripción

### 🏠 Propiedades (`api.ts`)
- `fetchPropiedades()` - Listar propiedades
- `fetchPropiedadesPublicas()` - Propiedades públicas (sin auth)
- `fetchPropiedad(id)` - Obtener propiedad
- `createPropiedad(data)` - Crear propiedad
- `updatePropiedad(id, data)` - Actualizar propiedad
- `deletePropiedad(id)` - Eliminar propiedad
- `darBajaPropiedad(id, data)` - Dar de baja propiedad
- `reactivarPropiedad(id)` - Reactivar propiedad
- `geocodificarDireccion(direccion)` - Obtener coordenadas
- `actualizarUbicacionPropiedad(id, data)` - Actualizar ubicación

### 📅 Reservas (`api.ts`)
- `fetchReservas()` - Listar reservas
- `fetchReserva(id)` - Obtener reserva
- `createReserva(data)` - Crear reserva
- `updateReserva(id, data)` - Actualizar reserva
- `deleteReserva(id)` - Eliminar reserva
- `fetchFechasOcupadas(propiedadId)` - Fechas ocupadas de una propiedad

### 🛎️ Servicios Adicionales (`serviciosService.ts`)
- `fetchServicios()` - Listar servicios
- `fetchServicio(id)` - Obtener servicio
- `createServicio(data)` - Crear servicio
- `updateServicio(id, data)` - Actualizar servicio
- `deleteServicio(id)` - Eliminar servicio

### ⭐ Favoritos (`api.ts`)
- `listarFavoritos()` - Listar mis favoritos
- `toggleFavorito(propiedadId)` - Agregar/quitar favorito

### 📝 Reseñas (`resenasService.ts`)
- `fetchResenas()` - Listar todas las reseñas
- `fetchResenasByPropiedad(propiedadId)` - Reseñas de una propiedad
- `fetchMisResenas()` - Mis reseñas
- `createResena(data)` - Crear reseña
- `updateResena(id, data)` - Actualizar reseña
- `deleteResena(id)` - Eliminar reseña

### 🔔 Notificaciones (`api.ts`)
- `fetchNotificaciones()` - Listar notificaciones
- `fetchNotificacionesNoLeidas()` - Notificaciones no leídas
- `countNotificacionesNoLeidas()` - Contar no leídas
- `marcarNotificacionLeida(id, data)` - Marcar como leída
- `marcarTodasLeidas()` - Marcar todas como leídas
- `deleteNotificacion(id)` - Eliminar notificación

### 📢 Publicidad (`api.ts`)
- `fetchPublicidades()` - Listar publicidad
- `fetchPublicidadesActivas()` - Publicidad activa
- `createPublicidad(data)` - Crear publicidad
- `updatePublicidad(id, data)` - Actualizar publicidad
- `deletePublicidad(id)` - Eliminar publicidad
- `togglePublicidadActiva(id)` - Activar/desactivar

### 🧾 Facturas (`facturasService.ts`)
- `fetchFacturas()` - Listar facturas
- `fetchFactura(id)` - Obtener factura
- `createFactura(data)` - Crear factura
- `updateFactura(id, data)` - Actualizar factura
- `deleteFactura(id)` - Eliminar factura

### 🎯 Puntos y Recompensas (`puntosRecompensasService.ts`)
**Puntos:**
- `fetchPuntos()` - Mi saldo de puntos

**Recompensas:**
- `fetchRecompensas()` - Listar recompensas
- `canjearRecompensa(recompensaId)` - Canjear recompensa
- `fetchMisCanjes()` - Mis canjes

### 📊 Dashboard (`api.ts`)
- `fetchDashboardEstadisticas()` - Estadísticas del dashboard

### 🗄️ Backup (`api.ts`)
- `crearBackup()` - Crear backup
- `listarBackups()` - Listar backups
- `descargarBackup(filename)` - Descargar backup
- `eliminarBackup(filename)` - Eliminar backup
- `restaurarBackup(filename)` - Restaurar backup
- `backupStatus()` - Estado del sistema

### 📈 Reportes (`api.ts`)
- `obtenerReportesReservas(params)` - Reportes de reservas

### 📋 Bitácora (`api.ts`)
- `obtenerBitacora(params)` - Registro de bitácora

### 📁 Archivos (`api.ts`)
- `fetchFilesByPropiedad(propiedadId)` - Archivos de una propiedad
- `fetchAllFiles()` - Todos los archivos
- `uploadFiles(formData)` - Subir archivos múltiples
- `setPrincipalImage(fileId)` - Establecer imagen principal
- `deleteFile(fileId)` - Eliminar archivo

## 🎯 Páginas Disponibles

### Públicas
- `/` - Landing page
- `/login` - Inicio de sesión
- `/register` - Registro

### Protegidas (requieren autenticación)
- `/dashboard` - Dashboard principal
- `/propiedades` - Gestión de propiedades
- `/reservas` - Gestión de reservas
- `/usuarios` - Gestión de usuarios (admin)
- `/roles` - Gestión de roles (admin)
- `/permisos` - Gestión de permisos (admin)
- `/suscripciones` - Gestión de suscripciones (admin)
- `/perfil` - Perfil de usuario
- `/pagos` - Pagos
- `/bitacora` - Bitácora del sistema (admin)
- `/reportes` - Reportes (admin)
- `/galeria` - Galería de fotos

## 🔧 Configuración

### Variables de Entorno (`.env`)

```env
VITE_API_URL=http://localhost:8000/
VITE_GOOGLE_MAPS_API_KEY=tu_api_key_de_google_maps
```

### Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Compilar para producción
npm run build

# Preview de producción
npm run preview
```

## 🎨 Componentes Principales

### Layout
- `Header` - Barra de navegación superior
- `Sidebar` - Menú lateral
- `Layout` - Contenedor principal

### Auth
- `LoginForm` - Formulario de login
- `RegisterForm` - Formulario de registro
- `ProtectedRoute` - Ruta protegida
- `AdminRoute` - Ruta solo para admins

### Propiedades
- `PropiedadesList` - Lista de propiedades
- `PropiedadForm` - Formulario de propiedad
- `PropertyCard` - Tarjeta de propiedad
- `PhotoUpload` - Subida de fotos
- `MapLocationPicker` - Selector de ubicación
- `DarBajaPropiedad` - Dar de baja propiedad

### Reservas
- `ReservaDetails` - Detalles de reserva
- `ReservaForm` - Formulario de reserva

### Notificaciones
- `NotificacionesBell` - Campana de notificaciones

### Favoritos
- `FavoritosButton` - Botón de favoritos

### Mapas
- `GoogleMapsProperties` - Mapa con propiedades
- `InteractivePropertyMap` - Mapa interactivo

### Admin
- `BackupSystem` - Sistema de backups
- `BitacoraSistema` - Bitácora del sistema
- `ReportesSistema` - Reportes del sistema
- `AdminPhotoGallery` - Galería de fotos admin

## 📱 Hooks Personalizados

- `useAuth` - Gestión de autenticación
- `usePropiedades` - Gestión de propiedades
- `useReservas` - Gestión de reservas
- `useNotificaciones` - Gestión de notificaciones
- `usePermisos` - Gestión de permisos
- `useRoles` - Gestión de roles
- `useSuscripciones` - Gestión de suscripciones
- `useUsuarios` - Gestión de usuarios
- `useMaps` - Google Maps
- `useGeolocation` - Geolocalización
- `useFechasOcupadas` - Fechas ocupadas
- `useImageValidation` - Validación de imágenes
- `usePropertyValidation` - Validación de propiedades

## 🚀 Iniciar el Sistema Completo

### 1. Backend
```bash
cd PG-Habita-Backend

# Activar entorno virtual
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Ejecutar servidor
python manage.py runserver
```

### 2. Frontend
```bash
cd PG-Habita-Frontend

# Instalar dependencias (primera vez)
npm install

# Ejecutar servidor de desarrollo
npm run dev
```

### 3. Acceder
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000/api/
- **Admin Django:** http://localhost:8000/admin

## 🔐 Credenciales de Prueba

### Administrador
- **Email:** admin@habita.com
- **Password:** admin123

### Propietario
- **Email:** maria.lopez@example.com
- **Password:** prop123

### Huésped
- **Email:** pedro.sanchez@example.com
- **Password:** huesp123

## 📊 Estado de Implementación

✅ **Completamente implementado:**
- Sistema de autenticación con JWT
- CRUD completo de todas las entidades
- Sistema de roles y permisos
- Gestión de propiedades con geocodificación
- Sistema de reservas con validación
- Notificaciones en tiempo real
- Sistema de favoritos
- Reseñas y calificaciones
- Publicidad
- Backups
- Reportes
- Bitácora
- Sistema de puntos y recompensas
- Facturas

✅ **Servicios API:**
- Todos los servicios implementados y documentados
- Interceptores de axios configurados
- Refresh token automático
- Manejo de errores global

✅ **UI/UX:**
- Diseño responsive
- Componentes reutilizables
- Validación de formularios
- Feedback visual
- Loading states
- Error handling

## 🎯 Próximos Pasos

1. **Personalizar el diseño** según tu marca
2. **Agregar más validaciones** según tus necesidades
3. **Implementar más reportes** personalizados
4. **Agregar tests** unitarios y de integración
5. **Optimizar rendimiento** con lazy loading
6. **Implementar PWA** para uso offline

---

✨ **¡Tu sistema frontend está completamente funcional y listo para usar!** ✨
