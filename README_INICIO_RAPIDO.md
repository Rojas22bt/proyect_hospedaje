# 🚀 Guía Rápida de Inicio - Sistema Habita

## ⚡ Inicio Rápido (5 minutos)

### 1️⃣ Backend - Primera Configuración

```bash
# Navegar al backend
cd PG-Habita-Backend

# Activar entorno virtual (Windows)
venv\Scripts\activate

# Aplicar migraciones
python manage.py migrate

# Cargar datos de ejemplo
python load_csv_data.py
# Responde 's' cuando pregunte si desea limpiar

# Verificar datos (opcional pero recomendado)
python verify_data.py

# Iniciar servidor
python manage.py runserver
```

### 2️⃣ Frontend - Primera Configuración

```bash
# Navegar al frontend (en otra terminal)
cd PG-Habita-Frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### 3️⃣ Acceder al Sistema

- **Frontend:** http://localhost:5173
- **API Backend:** http://localhost:8000/api/
- **Admin Django:** http://localhost:8000/admin

**Credenciales de prueba:**
- Email: `admin@habita.com`
- Password: `admin123`

---

## 🔄 Comandos para Uso Diario

### Backend
```bash
# Activar entorno e iniciar
cd PG-Habita-Backend
venv\Scripts\activate
python manage.py runserver

# Crear superusuario (si necesitas)
python manage.py createsuperuser

# Hacer migraciones después de cambios
python manage.py makemigrations
python manage.py migrate

# Ver shell interactivo
python manage.py shell
```

### Frontend
```bash
# Iniciar desarrollo
cd PG-Habita-Frontend
npm run dev

# Build para producción
npm run build

# Preview de producción
npm run preview
```

---

## 📊 ¿Qué Incluye el Sistema?

### ✅ Datos Precargados
- **10 Usuarios** (Admin, Propietarios, Huéspedes, Moderador)
- **10 Propiedades** (Casas, Departamentos, Cabañas)
- **12 Reservas** (Con diferentes estados)
- **4 Roles** con **30 Permisos**
- **4 Suscripciones** (Gratis, Básica, Premium, Empresarial)
- **Reseñas, Notificaciones, Favoritos, Puntos, Recompensas**

### 🎯 Funcionalidades Completas
- ✅ Sistema de autenticación JWT
- ✅ Gestión de propiedades con geolocalización
- ✅ Sistema de reservas con validación
- ✅ Roles y permisos granulares
- ✅ Notificaciones en tiempo real
- ✅ Sistema de puntos y recompensas
- ✅ Backups automáticos
- ✅ Reportes y estadísticas
- ✅ Bitácora de auditoría
- ✅ Sistema de favoritos y reseñas

---

## 🔑 Usuarios de Prueba

| Rol | Email | Password | Accesos |
|-----|-------|----------|---------|
| **Admin** | admin@habita.com | admin123 | Todo el sistema |
| **Propietario** | maria.lopez@example.com | prop123 | Gestión de propiedades |
| **Propietario** | juan.perez@example.com | prop123 | Gestión de propiedades |
| **Huésped** | pedro.sanchez@example.com | huesp123 | Reservas y perfil |
| **Huésped** | laura.martinez@example.com | huesp123 | Reservas y perfil |
| **Moderador** | diego.flores@example.com | mod123 | Moderación |

---

## 🛠️ Solución de Problemas Comunes

### ❌ Error: Puerto 8000 en uso
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <numero_pid> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

### ❌ Error: No module named 'apps'
```bash
# Asegúrate de estar en PG-Habita-Backend
cd PG-Habita-Backend
python manage.py check
```

### ❌ Error: Cannot connect to database
1. Verifica que PostgreSQL esté corriendo
2. Revisa las credenciales en `.env`
3. Crea la base de datos si no existe:
```sql
CREATE DATABASE SERP;
```

### ❌ Error: CORS en el frontend
1. Verifica que el backend esté corriendo
2. Revisa `VITE_API_URL` en `.env` del frontend
3. Verifica `CORS_ALLOWED_ORIGINS` en `settings.py`

---

## 📂 Estructura de Archivos Importantes

### Backend
```
PG-Habita-Backend/
├── csv_data/              # ← Datos CSV para cargar
├── load_csv_data.py       # ← Script de carga
├── verify_data.py         # ← Script de verificación
├── manage.py              # ← Comando principal Django
├── .env                   # ← Configuración de BD
└── apps/                  # ← Todas las aplicaciones
```

### Frontend
```
PG-Habita-Frontend/
├── src/
│   ├── services/         # ← Servicios API
│   ├── pages/            # ← Páginas principales
│   ├── components/       # ← Componentes reutilizables
│   └── contexts/         # ← Context API (Auth, etc)
├── .env                  # ← Configuración API
└── package.json          # ← Dependencias
```

---

## 📖 Documentación Adicional

- **Backend:** Ver `INSTRUCCIONES_MIGRACION.md`
- **Frontend:** Ver `GUIA_FRONTEND.md`
- **API Docs:** http://localhost:8000/api/ (cuando el servidor esté corriendo)

---

## 🎯 Próximos Pasos Recomendados

1. **Explorar el sistema** con las credenciales de prueba
2. **Revisar el dashboard** de administrador
3. **Crear una propiedad** como propietario
4. **Hacer una reserva** como huésped
5. **Ver reportes** y estadísticas
6. **Revisar la bitácora** de actividades

---

## 💡 Tips Útiles

### Resetear la Base de Datos
```bash
cd PG-Habita-Backend
python manage.py flush
python load_csv_data.py
```

### Ver Logs del Backend
El backend muestra logs en la terminal donde ejecutaste `runserver`

### Hot Reload
Ambos servidores (frontend y backend) tienen hot reload activado. Los cambios se reflejan automáticamente.

### Acceso al Admin de Django
1. Ve a http://localhost:8000/admin
2. Login con: admin@habita.com / admin123
3. Explora y modifica los datos directamente

---

## 🎨 Personalización

### Cambiar el Logo
```bash
# Frontend
PG-Habita-Frontend/public/logo.png
```

### Cambiar Colores
```bash
# Frontend
PG-Habita-Frontend/src/index.css
PG-Habita-Frontend/tailwind.config.ts
```

### Agregar Más Datos
```bash
# Editar archivos CSV en
PG-Habita-Backend/csv_data/

# Volver a cargar
python load_csv_data.py
```

---

## ✅ Checklist de Verificación

- [ ] PostgreSQL instalado y corriendo
- [ ] Python 3.8+ instalado
- [ ] Node.js 16+ instalado
- [ ] Backend corriendo en puerto 8000
- [ ] Frontend corriendo en puerto 5173
- [ ] Datos cargados correctamente
- [ ] Login funciona con admin@habita.com
- [ ] Puedes ver propiedades
- [ ] Puedes crear reservas

---

## 📞 ¿Necesitas Ayuda?

1. **Verifica los logs** en las terminales
2. **Revisa la documentación** en los archivos MD
3. **Usa el script de verificación:** `python verify_data.py`

---

**¡Todo listo! Tu sistema Habita está completamente funcional.** 🎉

Recuerda:
- El backend debe estar corriendo SIEMPRE para que el frontend funcione
- Los cambios en el frontend se reflejan automáticamente
- Los cambios en los modelos de Django requieren migraciones

**¡Feliz desarrollo!** 🚀
