# 🏠 Sistema Habita - Guía Completa de Migración de Datos

## 📋 Descripción

Este proyecto incluye un sistema completo de migración de datos desde archivos CSV a la base de datos PostgreSQL. Los datos incluyen información realista y consistente para todas las entidades del sistema.

## 📦 Datos Incluidos

El sistema incluye datos de ejemplo para:

- ✅ **30 Permisos** - Sistema completo de permisos granulares
- ✅ **4 Roles** - Administrador, Propietario, Huésped, Moderador
- ✅ **4 Suscripciones** - Gratis, Básica, Premium, Empresarial
- ✅ **10 Usuarios** - Con diferentes roles y suscripciones
- ✅ **7 Planes** - Planes activos de suscripción
- ✅ **10 Propiedades** - Casas, departamentos y cabañas en diferentes ciudades
- ✅ **10 Servicios** - Servicios adicionales (desayuno, transfer, spa, etc.)
- ✅ **12 Reservas** - Con diferentes estados y servicios
- ✅ **11 Favoritos** - Propiedades favoritas de usuarios
- ✅ **6 Reseñas** - Reseñas con calificaciones
- ✅ **8 Notificaciones** - Notificaciones del sistema
- ✅ **4 Publicidades** - Anuncios activos
- ✅ **5 Facturas** - Facturas de reservas pagadas
- ✅ **5 Puntos** - Sistema de puntos por usuario
- ✅ **7 Recompensas** - Recompensas canjeables

## 🚀 Instrucciones de Uso

### 1. Preparar el Entorno

```bash
# Navegar al directorio del backend
cd PG-Habita-Backend

# Activar el entorno virtual (si existe)
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependencias (si es necesario)
pip install -r requirements.txt
```

### 2. Configurar la Base de Datos

Asegúrate de que tu archivo `.env` tenga la configuración correcta:

```env
DB_NAME=SERP
DB_USER=postgres
DB_PASSWORD=tu_password
DB_HOST=localhost
DB_PORT=5432
```

### 3. Ejecutar Migraciones de Django

```bash
# Crear las migraciones
python manage.py makemigrations

# Aplicar las migraciones
python manage.py migrate
```

### 4. Cargar los Datos CSV

```bash
# Ejecutar el script de carga
python load_csv_data.py
```

El script te preguntará si deseas limpiar la base de datos antes de cargar los nuevos datos:
- **s** - Limpia todos los datos existentes y carga los nuevos (recomendado para primera instalación)
- **n** - Mantiene los datos existentes e intenta agregar los nuevos

### 5. Verificar la Carga

El script mostrará un resumen al finalizar:

```
📊 RESUMEN DE DATOS CARGADOS:
   • Permisos: 30
   • Roles: 4
   • Suscripciones: 4
   • Usuarios: 10
   • Planes: 7
   • Propiedades: 10
   • Servicios: 10
   • Reservas: 12
   • Favoritos: 11
   • Reseñas: 6
   • Notificaciones: 8
   • Publicidad: 4
   • Facturas: 5
   • Puntos: 5
   • Recompensas: 7
```

## 👤 Usuarios de Prueba

### Administrador
- **Usuario:** admin@habita.com
- **Contraseña:** admin123
- **Rol:** Administrador (acceso completo)

### Propietarios
- **Usuario:** maria.lopez@example.com
- **Contraseña:** prop123
- **Rol:** Propietario

- **Usuario:** juan.perez@example.com
- **Contraseña:** prop123
- **Rol:** Propietario

### Huéspedes
- **Usuario:** pedro.sanchez@example.com
- **Contraseña:** huesp123
- **Rol:** Huésped

- **Usuario:** laura.martinez@example.com
- **Contraseña:** huesp123
- **Rol:** Huésped

### Moderador
- **Usuario:** diego.flores@example.com
- **Contraseña:** mod123
- **Rol:** Moderador

## 📍 Propiedades de Ejemplo

Las propiedades incluyen ubicaciones reales en:
- La Paz
- Cochabamba
- Santa Cruz
- Potosí
- Copacabana

Cada propiedad tiene:
- Coordenadas geográficas reales
- Fotos (se pueden agregar en `/media/propiedades/`)
- Características variadas
- Precios diferentes

## 🔧 Solución de Problemas

### Error: No such table
```bash
python manage.py migrate --run-syncdb
```

### Error: UNIQUE constraint failed
```bash
# Ejecuta el script con limpieza de BD
python load_csv_data.py
# Responde 's' cuando pregunte si desea limpiar
```

### Error: No module named 'apps.xxx'
```bash
# Verifica que INSTALLED_APPS en settings.py incluya todas las apps
# Ejecuta:
python manage.py check
```

## 📂 Estructura de Archivos CSV

Todos los archivos CSV están en `csv_data/`:

```
csv_data/
├── permisos.csv
├── roles.csv
├── suscripciones.csv
├── usuarios.csv
├── planes.csv
├── propiedades.csv
├── servicios.csv
├── reservas.csv
├── favoritos.csv
├── resenas.csv
├── notificaciones.csv
├── publicidad.csv
├── facturas.csv
├── puntos.csv
└── recompensas.csv
```

## 🎯 Próximos Pasos

1. **Iniciar el servidor backend:**
```bash
python manage.py runserver
```

2. **Iniciar el frontend:**
```bash
cd ../PG-Habita-Frontend
npm install
npm run dev
```

3. **Acceder al sistema:**
- Frontend: http://localhost:5173
- Backend Admin: http://localhost:8000/admin
- API: http://localhost:8000/api/

## 🔐 Características del Sistema

### Roles y Permisos
- Sistema completo de roles con permisos granulares
- Cada rol tiene acceso específico a funcionalidades
- Permisos validados en backend y frontend

### Propiedades
- Gestión completa de propiedades
- Sistema de favoritos
- Reseñas y calificaciones
- Geolocalización con mapas

### Reservas
- Estados: pendiente, aceptada, confirmada, cancelada, completada
- Pagos: pendiente, pagado, reembolsado
- Servicios adicionales
- Validación de fechas y disponibilidad

### Sistema de Puntos
- Acumulación de puntos por reservas
- Recompensas canjeables
- Historial de canjes

### Notificaciones
- Notificaciones automáticas por eventos
- Tipos: reservas, pagos, recordatorios, sistema
- Marcado de leídas/no leídas

### Publicidad
- Banners promocionales
- Gestión de vigencia
- Tipos: promoción, anuncio, aviso, funcionalidad

## 📞 Soporte

Si encuentras algún problema durante la migración:

1. Verifica que todas las migraciones estén aplicadas
2. Revisa los logs de error en la consola
3. Asegúrate de que la base de datos esté accesible
4. Verifica que los archivos CSV no estén corruptos

## 🎨 Personalización

Puedes modificar los archivos CSV para agregar más datos o cambiar los existentes. El formato es simple:

```csv
campo1,campo2,campo3
valor1,valor2,valor3
```

**Importante:** Mantén el orden de dependencias al cargar:
1. Permisos
2. Roles
3. Suscripciones
4. Usuarios
5. Planes
6. Propiedades
7. Servicios
8. Reservas
9. Favoritos/Reseñas/Notificaciones
10. Facturas/Puntos/Recompensas

---

✨ **¡Tu sistema Habita está listo para usar con datos completos y consistentes!** ✨
