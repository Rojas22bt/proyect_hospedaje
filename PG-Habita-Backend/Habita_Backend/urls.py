# urls.py (principal)
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/permisos/', include('apps.permisos.urls')),
    path('api/roles/', include('apps.roles.urls')),
    path('api/usuarios/', include('apps.usuarios.urls')),
    path('api/suscripciones/', include('apps.suscripciones.urls')),
    path('api/planes/', include('apps.planes.urls')),
    path('api/propiedades/', include('apps.propiedades.urls')),
    path('api/reservas/', include('apps.reservas.urls')),
    path('api/servicios/', include('apps.servicios.urls')),
    path('api/dashboard/', include('apps.dashboard.urls')),
    path('api/notificaciones/', include('apps.notificaciones.urls')),
    path('api/ads/', include('apps.ads.urls')),  # Publicidad
    path('api/files/', include('apps.files.urls')),
    path('api/favoritos/', include('apps.favoritos.urls')),
    path('api/backup/', include('apps.backup.urls')),
    path('api/reportes/', include('apps.reportes.urls')),
    path('api/bitacora/', include('apps.bitacora.urls')),

    path('api/facturas/', include('apps.facturas.urls')),
    path('api/devoluciones/', include('apps.devoluciones.urls')),
    path('api/historiales/', include('apps.historiales.urls')),
    path('api/puntos/', include('apps.puntos.urls')),
    path('api/recompensas/', include('apps.recompensas.urls')),
    path('api/pagos/', include('apps.pagos.urls')),

path('api/resenas/', include('apps.resenas.urls')),  # ✅ AGREGADO: Para reseñas

]

# ✅ SERVIR ARCHIVOS ESTÁTICOS Y MEDIA EN DESARROLLO
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)