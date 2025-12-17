from django.urls import path
from .views import NotificacionList, NotificacionCUD, NotificacionesNoLeidas, MarcarTodasLeidas, MarcarLeida

urlpatterns = [
    path('', NotificacionList.as_view(), name='notificacion_list'),
    path('<int:pk>/', NotificacionCUD.as_view(), name='notificacion_detail'),
    path('no-leidas/', NotificacionesNoLeidas.as_view(), name='notificaciones_no_leidas'),
    path('marcar-todas-leidas/', MarcarTodasLeidas.as_view(), name='marcar_todas_leidas'),
    path('<int:pk>/marcar-leida/', MarcarLeida.as_view(), name='marcar_leida'),
]