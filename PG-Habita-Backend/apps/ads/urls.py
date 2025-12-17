from django.urls import path
from .views import PublicidadList, PublicidadCUD, PublicidadActivaList, ToggleActiva

urlpatterns = [
    path('', PublicidadList.as_view(), name='publicidad_list'),
    path('<int:pk>/', PublicidadCUD.as_view(), name='publicidad_detail'),
    path('activas/', PublicidadActivaList.as_view(), name='publicidad_activas'),
    path('<int:pk>/toggle-activa/', ToggleActiva.as_view(), name='toggle_activa'),
]